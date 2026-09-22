import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

router.get('/', requireAuth, async (req, res) => {
  const orderColumn = req.query.orderBy || 'level DESC';
  try {
    const [rows] = await pool.query(`SELECT * FROM monitoring_stations ORDER BY ${orderColumn}`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
