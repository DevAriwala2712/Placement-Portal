const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'placement_cell',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to handle async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- AUTH ENDPOINTS ---

app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const [users] = await pool.execute(
    'SELECT * FROM users WHERE email = ? AND password = ?',
    [email, password]
  );

  if (users.length > 0) {
    const user = users[0];
    let profile = { ...user };

    if (user.role === 'student') {
      const [students] = await pool.execute(
        'SELECT id as student_id, name, branch, cgpa FROM students WHERE user_id = ?',
        [user.id]
      );
      if (students.length > 0) profile = { ...profile, ...students[0] };
    }

    res.json({ success: true, user: profile });
  } else {
    // Admin backdoor for demo
    if (email === 'admin@thapar.edu' && password === 'admin123') {
        res.json({ success: true, user: { name: 'Administrator', role: 'admin', email: 'admin@thapar.edu' } });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  }
}));

app.post('/api/register', asyncHandler(async (req, res) => {
  const { name, email, password, role, branch, cgpa } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [userResult] = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, password, role || 'student']
    );

    if (role === 'student' || !role) {
      await connection.execute(
        'INSERT INTO students (user_id, name, branch, cgpa) VALUES (?, ?, ?, ?)',
        [userResult.insertId, name, branch || 'COPC', cgpa || 0]
      );
    }

    await connection.commit();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    connection.release();
  }
}));

// --- STUDENT DIRECTORY ---

app.get('/api/students', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT s.id as student_id, s.name, s.branch, s.cgpa, u.email, 
    CASE WHEN EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.status = 'Selected') THEN 'Placed' ELSE 'Not Placed' END as status
    FROM students s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
  `);
  res.json(rows);
}));

// --- JOB ENDPOINTS ---

app.get('/api/jobs', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT j.id as role_id, c.name as company, j.title, j.offer_type as type, 
    CONCAT(j.salary_min, ' - ', j.salary_max) as package, 
    j.eligibility_criteria as cgpa,
    j.eligible_branches as branches
    FROM jobs j
    LEFT JOIN companies c ON j.company_id = c.id
    ORDER BY j.id DESC
  `);
  res.json(rows);
}));

app.post('/api/apply', asyncHandler(async (req, res) => {
  const { student_id, role_id } = req.body;
  
  const [existing] = await pool.execute(
    'SELECT * FROM applications WHERE student_id = ? AND role_id = ?',
    [student_id, role_id]
  );

  if (existing.length > 0) {
    return res.status(400).json({ success: false, message: 'Already applied for this role' });
  }

  await pool.execute(
    'INSERT INTO applications (student_id, role_id, status) VALUES (?, ?, "Pending")',
    [student_id, role_id]
  );

  res.json({ success: true, message: 'Application submitted successfully!' });
}));

// --- APPLICATION ENDPOINTS ---

app.get('/api/admin/applications', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT a.id as application_id, a.student_id, s.name as student_name, 
    c.name as company, j.title as role, a.status, 
    DATE_FORMAT(a.created_at, '%Y-%m-%d') as date
    FROM applications a
    JOIN students s ON a.student_id = s.id
    JOIN jobs j ON a.role_id = j.id
    JOIN companies c ON j.company_id = c.id
    ORDER BY a.created_at DESC
  `);
  res.json(rows);
}));

// --- ANALYTICS / STATS ---

app.get('/api/stats', asyncHandler(async (req, res) => {
  const [placed] = await pool.execute("SELECT COUNT(DISTINCT student_id) as count FROM applications WHERE status = 'Selected'");
  const [total] = await pool.execute("SELECT COUNT(*) as count FROM students");
  const [avgPkg] = await pool.execute("SELECT AVG(salary_max) as avg FROM jobs");
  const [companies] = await pool.execute("SELECT COUNT(DISTINCT company_id) as count FROM jobs");
  const [totalJobs] = await pool.execute("SELECT COUNT(*) as count FROM jobs");

  res.json({
    placedStudents: placed[0].count,
    totalStudents: total[0].count,
    avgPackage: parseFloat(avgPkg[0].avg || 0).toFixed(1),
    totalCompanies: companies[0].count,
    totalJobs: totalJobs[0].count
  });
}));

// --- ADMIN MANAGEMENT ---

app.get('/api/admin/students', asyncHandler(async (req, res) => {
  const [rows] = await pool.execute(`
    SELECT s.id as student_id, s.name, s.branch, s.cgpa, u.email, 
    CASE WHEN EXISTS (SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.status = 'Selected') THEN 'Placed' ELSE 'Pending' END as status
    FROM students s
    JOIN users u ON s.user_id = u.id
    ORDER BY s.id DESC
  `);
  res.json(rows);
}));

app.post('/api/admin/students', asyncHandler(async (req, res) => {
  const { name, branch, cgpa, email, password } = req.body;
  
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [u] = await connection.execute(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, 'student123', 'student']
    );

    const [s] = await connection.execute(
      'INSERT INTO students (user_id, name, branch, cgpa) VALUES (?, ?, ?, ?)',
      [u.insertId, name, branch, cgpa]
    );

    await connection.commit();
    res.json({ success: true, id: s.insertId });
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}));

app.delete('/api/admin/students/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await pool.execute('DELETE FROM students WHERE id = ?', [id]);
  res.json({ success: true });
}));

app.post('/api/jobs', asyncHandler(async (req, res) => {
  const { title, company_name, type, package, cgpa, branches } = req.body;
  
  let [companies] = await pool.execute('SELECT id FROM companies WHERE name = ?', [company_name]);
  let companyId;
  
  if (companies.length === 0) {
    const [result] = await pool.execute('INSERT INTO companies (name, created_by) VALUES (?, 1)', [company_name]);
    companyId = result.insertId;
  } else {
    companyId = companies[0].id;
  }

  const [jobResult] = await pool.execute(
    'INSERT INTO jobs (title, company_id, offer_type, salary_max, eligibility_criteria, eligible_branches, posted_by) VALUES (?, ?, ?, ?, ?, ?, 1)',
    [title, companyId, type, package, cgpa, branches]
  );

  res.json({ success: true, id: jobResult.insertId });
}));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`🛢️ Connected to MySQL database: placement_cell`);
});
