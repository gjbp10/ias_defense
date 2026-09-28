import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { doubleCsrfProtection } from '../middleware/csrf.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

// Both portals need the course catalog, so any authenticated user can read it.
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY course_code ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireRole('registrar', 'admin'), doubleCsrfProtection, async (req, res) => {
  const { course_code, title, units, instructor, schedule, max_seats } = req.body || {};
  if (!course_code || !title) {
    return res.status(400).json({ error: 'course_code and title are required.' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (course_code, title, units, instructor, schedule, max_seats) VALUES (?, ?, ?, ?, ?, ?)',
      [course_code, title, units || 3, instructor || '', schedule || '', max_seats || 40]
    );
    await logAudit({ operator: req.session.user.email, category: 'COURSES', details: `Created course ${course_code}`, ip: req.ip });
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This DELETE endpoint didn't exist before -- the frontend was calling
// Supabase directly for deletes even though reads had already moved to
// MySQL. It's added here so course deletion goes through the same
// authenticated, parameterized-query path as everything else.
router.delete('/:id', requireAuth, requireRole('registrar', 'admin'), doubleCsrfProtection, async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    await logAudit({ operator: req.session.user.email, category: 'COURSES', details: `Deleted course id ${req.params.id}`, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
