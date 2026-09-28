import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { doubleCsrfProtection } from '../middleware/csrf.js';

const router = express.Router();

router.get('/:studentNumber', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.* FROM enrollments e
       JOIN courses c ON e.course_code = c.course_code
       WHERE e.student_number = ?`,
      [req.params.studentNumber]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, doubleCsrfProtection, async (req, res) => {
  const { student_number, course_code } = req.body || {};
  if (!student_number || !course_code) {
    return res.status(400).json({ error: 'student_number and course_code are required.' });
  }
  try {
    await pool.query(
      'INSERT INTO enrollments (student_number, course_code) VALUES (?, ?)',
      [student_number, course_code]
    );
    await pool.query(
      'UPDATE courses SET enrolled_seats = enrolled_seats + 1 WHERE course_code = ?',
      [course_code]
    );
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// This didn't exist before -- apiClient.js already defined dropCourse() on
// the frontend, but server.js had no matching route, so StudentRecords.jsx
// was calling Supabase directly to drop a course instead. Added here, and
// it now also decrements enrolled_seats (the old Supabase path didn't).
router.delete('/', requireAuth, doubleCsrfProtection, async (req, res) => {
  const { student_number, course_code } = req.body || {};
  if (!student_number || !course_code) {
    return res.status(400).json({ error: 'student_number and course_code are required.' });
  }
  try {
    await pool.query(
      'DELETE FROM enrollments WHERE student_number = ? AND course_code = ?',
      [student_number, course_code]
    );
    await pool.query(
      'UPDATE courses SET enrolled_seats = GREATEST(enrolled_seats - 1, 0) WHERE course_code = ?',
      [course_code]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
