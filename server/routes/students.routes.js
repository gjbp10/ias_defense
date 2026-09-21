import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// Full student directory is registrar/admin data only.
router.get('/', requireAuth, requireRole('registrar', 'admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
