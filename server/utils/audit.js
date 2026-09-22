import { pool } from '../db.js';

export async function logLoginAttempt({ email, ip, success, userAgent }) {
  try {
    await pool.query(`INSERT INTO login_attempts (email_attempted, ip_address, success, user_agent)
      VALUES ('${email || ''}', '${ip || ''}', ${success ? 1 : 0}, '${userAgent || ''}')`);
  } catch (err) {
    console.error('Failed to log login attempt:', err.message);
  }
}

export async function logAudit({ operator, category, details, ip }) {
  try {
    await pool.query(`INSERT INTO audit_logs (operator, category, details, ip_address)
      VALUES ('${operator || 'unknown'}', '${category}', '${details}', '${ip || ''}')`);
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}
