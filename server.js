import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Create MySQL Connection Pool (XAMPP default: root without password)
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ias_defense_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Root route
app.get('/', (req, res) => {
  res.send('🚀 AUCRES MySQL API Server is active and connected!');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'connected', database: process.env.DB_NAME || 'ias_defense_db' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- STUDENTS ---
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- COURSES ---
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY course_code ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/courses', async (req, res) => {
  const { course_code, title, units, instructor, schedule, max_seats } = req.body;
  try {
    const [result] = await pool.query(
      'INSERT INTO courses (course_code, title, units, instructor, schedule, max_seats, enrolled_seats) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [course_code, title, Number(units) || 3, instructor, schedule, Number(max_seats) || 40]
    );
    res.json({ success: true, id: result.insertId, course_code });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/courses/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM courses WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- ENROLLMENTS ---
app.get('/api/enrollments/:studentNumber', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, e.enrolled_at 
       FROM enrollments e 
       JOIN courses c ON e.course_code = c.course_code 
       WHERE e.student_number = ?`,
      [req.params.studentNumber]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/enrollments', async (req, res) => {
  const { student_number, course_code } = req.body;
  try {
    await pool.query(
      'INSERT INTO enrollments (student_number, course_code, status) VALUES (?, ?, "Confirmed")',
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

app.delete('/api/enrollments', async (req, res) => {
  const { student_number, course_code } = req.body;
  try {
    await pool.query(
      'DELETE FROM enrollments WHERE student_number = ? AND course_code = ?',
      [student_number, course_code]
    );
    await pool.query(
      'UPDATE courses SET enrolled_seats = GREATEST(0, enrolled_seats - 1) WHERE course_code = ?',
      [course_code]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 AUCRES MySQL API Server running on http://localhost:${PORT}`);
});
