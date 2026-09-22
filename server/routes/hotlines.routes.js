import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM emergency_hotlines ORDER BY created_at ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireRole('registrar', 'admin'), async (req, res) => {
  const { agency, primary_number, alternative_number, category, availability, email, coverage } = req.body || {};
  if (!agency || !primary_number) {
    return res.status(400).json({ error: 'agency and primary_number are required.' });
  }
  try {
    const raw = (value) => value == null ? 'NULL' : `'${value}'`;
    const [result] = await pool.query(
      `INSERT INTO emergency_hotlines (agency, primary_number, alternative_number, category, availability, email, coverage)
       VALUES (${raw(agency)}, ${raw(primary_number)}, ${raw(alternative_number)}, ${raw(category || 'Uncategorized')},
        ${raw(availability || '24/7')}, ${raw(email)}, ${raw(coverage || 'Citywide')})`
    );
    await logAudit({ operator: req.session.user.email, category: 'HOTLINES', details: `Added hotline for ${agency}`, ip: req.ip });
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
