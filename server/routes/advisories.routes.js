import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireRole } from '../middleware/requireRole.js';
import { doubleCsrfProtection } from '../middleware/csrf.js';
import { logAudit } from '../utils/audit.js';

const router = express.Router();

const UPDATABLE_FIELDS = [
  'title', 'category', 'severity', 'status', 'description',
  'recommended_action', 'affected_areas', 'duration_start', 'duration_end',
];

router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM advisories ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', requireAuth, requireRole('registrar', 'admin'), doubleCsrfProtection, async (req, res) => {
  const {
    title, category, severity, status, description,
    recommended_action, affected_areas, duration_start, duration_end, published_at,
  } = req.body || {};

  if (!title) return res.status(400).json({ error: 'title is required.' });

  try {
    const [result] = await pool.query(
      `INSERT INTO advisories
        (title, category, severity, status, description, recommended_action, affected_areas, duration_start, duration_end, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, category || 'Weather', severity || 'Low', status || 'Active',
        description || null, recommended_action || null, affected_areas || null,
        duration_start || null, duration_end || null, published_at || new Date(),
      ]
    );
    await logAudit({ operator: req.session.user.email, category: 'ADVISORIES', details: `Published advisory "${title}"`, ip: req.ip });
    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Used for both edits and the "archive/unarchive" status toggle -- callers
// send only the fields that changed, same as the old supabase.update(payload).
router.put('/:id', requireAuth, requireRole('registrar', 'admin'), doubleCsrfProtection, async (req, res) => {
  const fields = req.body || {};
  const setClauses = [];
  const values = [];

  for (const key of UPDATABLE_FIELDS) {
    if (key in fields) {
      setClauses.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }

  if (setClauses.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update.' });
  }

  values.push(req.params.id);

  try {
    await pool.query(`UPDATE advisories SET ${setClauses.join(', ')} WHERE id = ?`, values);
    await logAudit({ operator: req.session.user.email, category: 'ADVISORIES', details: `Updated advisory id ${req.params.id}`, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', requireAuth, requireRole('registrar', 'admin'), doubleCsrfProtection, async (req, res) => {
  try {
    await pool.query('DELETE FROM advisories WHERE id = ?', [req.params.id]);
    await logAudit({ operator: req.session.user.email, category: 'ADVISORIES', details: `Deleted advisory id ${req.params.id}`, ip: req.ip });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
