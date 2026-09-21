import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { generateCsrfToken, doubleCsrfProtection } from '../middleware/csrf.js';
import { loginLimiter, registerLimiter } from '../middleware/rateLimiters.js';
import { logLoginAttempt, logAudit } from '../utils/audit.js';

const router = express.Router();

const LOCK_THRESHOLD = 5;          // failed attempts before lockout
const LOCK_DURATION_MINUTES = 5;   // how long the account stays locked
const BCRYPT_ROUNDS = 12;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(row) {
  return { id: row.id, fullName: row.full_name, email: row.email, role: row.role };
}

// Frontend fetches this once on load (and again after login/register/logout,
// since the session id -- and therefore the token bound to it -- changes)
// and sends the value back in the X-CSRF-Token header on every mutating call.
router.get('/csrf-token', (req, res) => {
  const csrfToken = generateCsrfToken(req, res);
  res.json({ csrfToken });
});

router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.json({ user: null });
});

router.post('/register', registerLimiter, doubleCsrfProtection, async (req, res) => {
  const { fullName, email, password } = req.body || {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }
  if (!email || typeof email !== 'string' || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const cleanName = fullName.trim();

  try {
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // IMPORTANT: role is always hardcoded to 'student' here and is never
    // read from the request body. This is the fix for the privilege-
    // escalation bug found in the previous review, where every public
    // registration silently wrote an 'admin' row. Registrar/admin accounts
    // are provisioned out-of-band (seeded directly in SQL, or created later
    // by an existing registrar through a role-gated endpoint) -- never
    // through public self-registration.
    const [result] = await pool.query(
      'INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)',
      [cleanName, cleanEmail, passwordHash, 'student']
    );

    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({ error: 'Registration succeeded but login failed. Please sign in.' });
      }
      const user = { id: result.insertId, fullName: cleanName, email: cleanEmail, role: 'student' };
      req.session.user = user;
      logAudit({ operator: user.email, category: 'AUTH', details: 'New account registered', ip: req.ip });
      res.status(201).json({ user });
    });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/login', loginLimiter, doubleCsrfProtection, async (req, res) => {
  const { email, password } = req.body || {};
  const ip = req.ip;
  const userAgent = req.headers['user-agent'];
  const genericError = 'Invalid email or password.';

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const cleanEmail = String(email).toLowerCase().trim();

  try {
    const [rows] = await pool.query(
      'SELECT id, full_name, email, password, role, failed_attempts, locked_until FROM users WHERE email = ?',
      [cleanEmail]
    );

    if (rows.length === 0) {
      // Same generic error and same shape as a wrong-password response, so
      // the API doesn't leak which emails have accounts.
      await logLoginAttempt({ email: cleanEmail, ip, success: false, userAgent });
      return res.status(401).json({ error: genericError });
    }

    const user = rows[0];

    // Layer 2 of brute-force defense: a per-account lockout persisted in
    // MySQL, so (unlike the old React-only counter) it survives a page
    // refresh and can't be reset by the attacker just reloading the page.
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const retryAfterMs = new Date(user.locked_until).getTime() - Date.now();
      await logLoginAttempt({ email: cleanEmail, ip, success: false, userAgent });
      return res.status(423).json({
        error: `Too many failed attempts. Try again in ${Math.max(1, Math.ceil(retryAfterMs / 60000))} minute(s).`,
        lockedUntil: user.locked_until,
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      const newAttempts = user.failed_attempts + 1;
      const shouldLock = newAttempts >= LOCK_THRESHOLD;

      await pool.query(
        'UPDATE users SET failed_attempts = ?, locked_until = ? WHERE id = ?',
        [
          shouldLock ? 0 : newAttempts,
          shouldLock ? new Date(Date.now() + LOCK_DURATION_MINUTES * 60000) : null,
          user.id,
        ]
      );
      await logLoginAttempt({ email: cleanEmail, ip, success: false, userAgent });

      if (shouldLock) {
        return res.status(423).json({ error: `Too many failed attempts. Try again in ${LOCK_DURATION_MINUTES} minutes.` });
      }
      return res.status(401).json({ error: genericError, attemptsRemaining: LOCK_THRESHOLD - newAttempts });
    }

    await pool.query('UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = ?', [user.id]);
    await logLoginAttempt({ email: cleanEmail, ip, success: true, userAgent });

    req.session.regenerate((err) => {
      if (err) {
        console.error('Session regenerate error:', err);
        return res.status(500).json({ error: 'Login succeeded but session setup failed. Please try again.' });
      }
      const sanitized = sanitizeUser(user);
      req.session.user = sanitized;
      logAudit({ operator: sanitized.email, category: 'AUTH', details: 'User logged in', ip });
      res.json({ user: sanitized });
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

router.post('/logout', doubleCsrfProtection, (req, res) => {
  const email = req.session?.user?.email;
  const ip = req.ip;
  req.session.destroy((err) => {
    if (err) {
      console.error('Logout error:', err.message);
      return res.status(500).json({ error: 'Logout failed.' });
    }
    res.clearCookie('aucres.sid');
    if (email) logAudit({ operator: email, category: 'AUTH', details: 'User logged out', ip });
    res.json({ success: true });
  });
});

export default router;
