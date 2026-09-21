import express from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = express.Router();

// Read-only: rows here are written by the telemetry/scraper pipeline, not
// through this web API. ?orderBy is restricted to a two-value whitelist
// (never interpolated directly from arbitrary input) so this stays safe
// from injection while still supporting both sort orders the frontend needs
// (MonitoringStations.jsx sorts by level, RiverLevel.jsx by station_name).
router.get('/', requireAuth, async (req, res) => {
  const orderColumn = req.query.orderBy === 'station_name' ? 'station_name' : 'level';
  const direction = req.query.orderBy === 'station_name' ? 'ASC' : 'DESC';
  try {
    const [rows] = await pool.query(`SELECT * FROM monitoring_stations ORDER BY ${orderColumn} ${direction}`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
