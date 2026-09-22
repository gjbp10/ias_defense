import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM community_reports ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', requireAuth, requireRole('registrar', 'admin'), async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: 'status is required.' });
  try {
    await pool.query(`UPDATE community_reports SET status = '${status}' WHERE id = ${req.params.id}`);
    await logAudit({ operator: req.session.user.email, category: 'REPORTS', details: `Updated report ${req.params.id} status to ${status}`, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
