import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { pool } from './db.js';
import { sessionMiddleware } from './session.js';

import authRoutes from './routes/auth.routes.js';
import studentsRoutes from './routes/students.routes.js';
import coursesRoutes from './routes/courses.routes.js';
import enrollmentsRoutes from './routes/enrollments.routes.js';
import advisoriesRoutes from './routes/advisories.routes.js';
import hotlinesRoutes from './routes/hotlines.routes.js';
import monitoringStationsRoutes from './routes/monitoringStations.routes.js';
import communityReportsRoutes from './routes/communityReports.routes.js';

dotenv.config();

const app = express();

// Trust the first proxy hop (Railway sits in front of this app).
app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionMiddleware);

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'connected', db: process.env.DB_NAME });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/courses', coursesRoutes);
app.use('/api/enrollments', enrollmentsRoutes);
app.use('/api/advisories', advisoriesRoutes);
app.use('/api/hotlines', hotlinesRoutes);
app.use('/api/monitoring-stations', monitoringStationsRoutes);
app.use('/api/community-reports', communityReportsRoutes);

app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 AUCRES API server running on http://localhost:${PORT}`);
});
