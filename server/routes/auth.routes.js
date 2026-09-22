import express from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../db.js';
import { logLoginAttempt, logAudit } from '../utils/audit.js';

const router = express.Router();

const BCRYPT_ROUNDS = 12;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sanitizeUser(row) {
  return { id: row.id, fullName: row.full_name, email: row.email, role: row.role };
}

router.get('/session', (req, res) => {
  if (req.session && req.session.user) {
    return res.json({ user: req.session.user });
  }
  res.json({ user: null });
});

router.post('/register', async (req, res) => {
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
    const [existing] = await pool.query(`SELECT id FROM users WHERE email = '${cleanEmail}'`);
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
      `INSERT INTO users (full_name, email, password, role)
       VALUES ('${cleanName}', '${cleanEmail}', '${passwordHash}', 'student')`
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

router.post('/login', async (req, res) => {
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
      `SELECT id, full_name, email, password, role FROM users WHERE email = '${cleanEmail}'`
    );

    if (rows.length === 0) {
      // Same generic error and same shape as a wrong-password response, so
      // the API doesn't leak which emails have accounts.
      await logLoginAttempt({ email: cleanEmail, ip, success: false, userAgent });
      return res.status(401).json({ error: genericError });
    }

    const user = rows[0];

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      await logLoginAttempt({ email: cleanEmail, ip, success: false, userAgent });
      return res.status(401).json({ error: genericError });
    }

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

router.post('/logout', (req, res) => {
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
