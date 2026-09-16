import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ias_defense_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test Connection Route
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'connected', db: process.env.DB_NAME });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API ENDPOINTS ---

// 1. GET Students
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. GET Courses
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY course_code ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. POST Add Course
app.post('/api/courses', async (req, res) => {
  const { course_code, title, units, instructor, schedule, max_seats } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (course_code, title, units, instructor, schedule, max_seats) VALUES (?, ?, ?, ?, ?, ?)',
      [course_code, title, units, instructor, schedule, max_seats]
    );
    res.json({ success: true, id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. GET Enrollments by Student Number
app.get('/api/enrollments/:studentNumber', async (req, res) => {
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

// 5. POST Enroll Student
app.post('/api/enrollments', async (req, res) => {
  const { student_number, course_code } = req.body;
  try {
    await pool.query(
      'INSERT INTO enrollments (student_number, course_code) VALUES (?, ?)',
      [student_number, course_code]
    );
    await pool.query(
      'UPDATE courses SET enrolled_seats = enrolled_seats + 1 WHERE course_code = ?',
      [course_code]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MySQL API Server running on http://localhost:${PORT}`);
});
