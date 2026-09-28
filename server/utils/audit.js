import { pool } from '../db.js';

// Every login attempt (success or failure) is recorded here, separate from
// the general audit_logs table, so brute-force activity can be reviewed and
// demonstrated cleanly (e.g. for testing the lockout behavior) without being
// mixed in with ordinary admin actions.
export async function logLoginAttempt({ email, ip, success, userAgent }) {
  try {
    await pool.query(
      'INSERT INTO login_attempts (email_attempted, ip_address, success, user_agent) VALUES (?, ?, ?, ?)',
      [email || null, ip || null, success ? 1 : 0, userAgent || null]
    );
  } catch (err) {
    console.error('Failed to log login attempt:', err.message);
  }
}

export async function logAudit({ operator, category, details, ip }) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (operator, category, details, ip_address) VALUES (?, ?, ?, ?)',
      [operator || 'unknown', category, details, ip || null]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}
