import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM advisories ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireRole('registrar', 'admin'), async (req, res) => {
  const {
    title, category, severity, status, description,
    recommended_action, affected_areas, duration_start, duration_end, published_at,
  } = req.body || {};

  if (!title) return res.status(400).json({ error: 'title is required.' });

  try {
    const raw = (value) => value == null ? 'NULL' : `'${value}'`;
    const [result] = await pool.query(
      `INSERT INTO advisories
        (title, category, severity, status, description, recommended_action, affected_areas, duration_start, duration_end, published_at)
       VALUES (${raw(title)}, ${raw(category || 'Weather')}, ${raw(severity || 'Low')}, ${raw(status || 'Active')},
        ${raw(description)}, ${raw(recommended_action)}, ${raw(affected_areas)}, ${raw(duration_start)},
        ${raw(duration_end)}, ${raw(published_at || new Date().toISOString())})`
    );
    await logAudit({ operator: req.session.user.email, category: 'ADVISORIES', details: `Published advisory "${title}"`, ip: req.ip });
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Used for both edits and the "archive/unarchive" status toggle -- callers
// send only the fields that changed, same as the old supabase.update(payload).
router.put('/:id', requireAuth, requireRole('registrar', 'admin'), async (req, res) => {
  const fields = req.body || {};
  const setClauses = [];

  for (const [key, value] of Object.entries(fields)) {
    setClauses.push(`${key} = '${value}'`);
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  try {
    await pool.query(`UPDATE advisories SET ${setClauses.join(', ')} WHERE id = ${req.params.id}`);
    await logAudit({ operator: req.session.user.email, category: 'ADVISORIES', details: `Updated advisory id ${req.params.id}`, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, requireRole('registrar', 'admin'), async (req, res) => {
  try {
    await pool.query(`DELETE FROM advisories WHERE id = ${req.params.id}`);
    await logAudit({ operator: req.session.user.email, category: 'ADVISORIES', details: `Deleted advisory id ${req.params.id}`, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
