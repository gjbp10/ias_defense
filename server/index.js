import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { pool } from './db.js';
import { sessionMiddleware } from './session.js';
import { invalidCsrfTokenError } from './middleware/csrf.js';

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

// Trust the first proxy hop (Railway sits in front of this app), so
// req.ip reflects the real client IP for rate limiting / login_attempts,
// and secure cookies are detected correctly.
app.set('trust proxy', 1);

app.use(helmet());

// CORS is locked to the actual frontend origin(s) -- comma-separated in
// CLIENT_ORIGIN -- with credentials enabled so the session cookie can be
// sent cross-origin (Vercel -> Railway). This replaces the previous
// app.use(cors()) which allowed literally any origin.
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173').split(',').map(o => o.trim());
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json());
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


const distPath = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../dist'
);

app.use(express.static(distPath));

app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) return next();
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((error, req, res, _next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 AUCRES API server running on http://localhost:${PORT}`);
});
