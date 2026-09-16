import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// Create MySQL Connection Pool (XAMPP default: root without password)
=======
// Create MySQL Connection Pool
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ias_defense_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

<<<<<<< HEAD
// Root route
app.get('/', (req, res) => {
  res.send('🚀 AUCRES MySQL API Server is active and connected!');
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'connected', database: process.env.DB_NAME || 'ias_defense_db' });
=======
// Test Connection Route
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ status: 'connected', db: process.env.DB_NAME });
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

<<<<<<< HEAD
// --- STUDENTS ---
=======
// --- API ENDPOINTS ---

// 1. GET Students
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
app.get('/api/students', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
// --- COURSES ---
=======
// 2. GET Courses
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
app.get('/api/courses', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM courses ORDER BY course_code ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
=======
// 3. POST Add Course
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
app.post('/api/courses', async (req, res) => {
  const { course_code, title, units, instructor, schedule, max_seats } = req.body;
  try {
    const [result] = await pool.query(
<<<<<<< HEAD
      'INSERT INTO courses (course_code, title, units, instructor, schedule, max_seats, enrolled_seats) VALUES (?, ?, ?, ?, ?, ?, 0)',
      [course_code, title, Number(units) || 3, instructor, schedule, Number(max_seats) || 40]
    );
    res.json({ success: true, id: result.insertId, course_code });
=======
      'INSERT INTO courses (course_code, title, units, instructor, schedule, max_seats) VALUES (?, ?, ?, ?, ?, ?)',
      [course_code, title, units, instructor, schedule, max_seats]
    );
    res.json({ success: true, id: result.insertId });
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
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
=======
// 4. GET Enrollments by Student Number
app.get('/api/enrollments/:studentNumber', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.* FROM enrollments e 
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
       JOIN courses c ON e.course_code = c.course_code 
       WHERE e.student_number = ?`,
      [req.params.studentNumber]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD
=======
// 5. POST Enroll Student
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
app.post('/api/enrollments', async (req, res) => {
  const { student_number, course_code } = req.body;
  try {
    await pool.query(
<<<<<<< HEAD
      'INSERT INTO enrollments (student_number, course_code, status) VALUES (?, ?, "Confirmed")',
=======
      'INSERT INTO enrollments (student_number, course_code) VALUES (?, ?)',
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
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

<<<<<<< HEAD
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
=======
// Start Express Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 MySQL API Server running on http://localhost:${PORT}`);
>>>>>>> 59132c73865bfd566b95ffaa4383dd4f7d1c5969
});
