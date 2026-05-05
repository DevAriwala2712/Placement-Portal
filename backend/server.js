const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Oracle Configuration
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

let pool;

async function initOracle() {
  try {
    pool = await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECTION_STRING,
      poolMax: 10,
      poolMin: 2,
      poolIncrement: 1
    });
    console.log('✅ Oracle Connection Pool initialized');
  } catch (err) {
    console.error('❌ Oracle Pool Error: ' + err.message);
  }
}

initOracle();

// Helper to handle queries
async function query(sql, binds = [], options = {}) {
  let conn;
  try {
    conn = await pool.getConnection();
    const result = await conn.execute(sql, binds, options);
    return result.rows || result;
  } catch (err) {
    throw err;
  } finally {
    if (conn) {
      try { await conn.close(); } catch (e) {}
    }
  }
}

// Helper to handle async routes
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- AUTH ENDPOINTS ---

app.post('/api/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const users = await query(
    'SELECT * FROM Users WHERE email = :email AND password = :password',
    { email, password }
  );

  if (users.length > 0) {
    const user = users[0];
    let profile = { ...user };

    // Map Oracle uppercase keys to lowercase for frontend compatibility if needed
    // But oracledb OUT_FORMAT_OBJECT returns keys as uppercase by default
    // We'll normalize them here
    const normalizedUser = {
        id: user.USER_ID,
        email: user.EMAIL,
        role: user.ROLE
    };

    if (normalizedUser.role === 'student') {
      const students = await query(
        'SELECT student_id, name, branch, cgpa FROM Students WHERE user_id = :id',
        { id: normalizedUser.id }
      );
      if (students.length > 0) {
          profile = { 
              ...normalizedUser, 
              student_id: students[0].STUDENT_ID,
              name: students[0].NAME,
              branch: students[0].BRANCH,
              cgpa: students[0].CGPA
          };
      }
    } else {
        profile = normalizedUser;
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
  
  let conn;
  try {
    conn = await pool.getConnection();
    // In Oracle, we don't need explicit transactions if we use autocommit or manage it manually
    // But for multi-table inserts, it's safer
    
    const userResult = await conn.execute(
      'INSERT INTO Users (email, password, role) VALUES (:email, :password, :role) RETURNING user_id INTO :id',
      { 
          email, 
          password, 
          role: role || 'student',
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const userId = userResult.outBinds.id[0];

    if (role === 'student' || !role) {
      await conn.execute(
        'INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES (:uid, :name, :branch, :cgpa, 2026, :email)',
        { 
            uid: userId, 
            name, 
            branch: branch || 'COPC', 
            cgpa: cgpa || 0,
            email
        }
      );
    }

    await conn.commit();
    res.json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    if (conn) await conn.rollback();
    res.status(500).json({ success: false, message: error.message });
  } finally {
    if (conn) await conn.close();
  }
}));

// --- STUDENT DIRECTORY ---

app.get('/api/students', asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT s.student_id, s.name, s.branch, s.cgpa, s.email, 
    CASE WHEN EXISTS (SELECT 1 FROM Applications a WHERE a.student_id = s.student_id AND a.status = 'Selected') THEN 'Placed' ELSE 'Not Placed' END as status
    FROM Students s
    ORDER BY s.student_id DESC
  `);
  
  // Normalize keys for frontend
  const result = rows.map(r => ({
      student_id: r.STUDENT_ID,
      name: r.NAME,
      branch: r.BRANCH,
      cgpa: r.CGPA,
      email: r.EMAIL,
      status: r.STATUS
  }));
  
  res.json(result);
}));

// --- JOB ENDPOINTS ---

app.get('/api/jobs', asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT j.role_id, c.name as company, j.title, j.type_of_offer as type, 
    j.package_ctc as package, 
    j.eligibility_cgpa as cgpa,
    j.branches_allowed as branches
    FROM JobRoles j
    LEFT JOIN Companies c ON j.company_id = c.company_id
    ORDER BY j.role_id DESC
  `);

  const result = rows.map(r => ({
      role_id: r.ROLE_ID,
      company: r.COMPANY,
      title: r.TITLE,
      type: r.TYPE,
      package: r.PACKAGE,
      cgpa: r.CGPA,
      branches: r.BRANCHES
  }));

  res.json(result);
}));

app.post('/api/apply', asyncHandler(async (req, res) => {
  const { student_id, role_id } = req.body;
  
  const existing = await query(
    'SELECT * FROM Applications WHERE student_id = :sid AND role_id = :rid',
    { sid: student_id, rid: role_id }
  );

  if (existing.length > 0) {
    return res.status(400).json({ success: false, message: 'Already applied for this role' });
  }

  await query(
    'INSERT INTO Applications (student_id, role_id, status) VALUES (:sid, :rid, \'Pending\')',
    { sid: student_id, rid: role_id }
  );

  res.json({ success: true, message: 'Application submitted successfully!' });
}));

// --- APPLICATION ENDPOINTS ---

app.get('/api/admin/applications', asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT a.application_id, a.student_id, s.name as student_name, 
    c.name as company, j.title as role, a.status, 
    TO_CHAR(a.app_date, 'YYYY-MM-DD') as app_date
    FROM Applications a
    JOIN Students s ON a.student_id = s.student_id
    JOIN JobRoles j ON a.role_id = j.role_id
    JOIN Companies c ON j.company_id = c.company_id
    ORDER BY a.app_date DESC
  `);

  const result = rows.map(r => ({
      application_id: r.APPLICATION_ID,
      student_id: r.STUDENT_ID,
      student_name: r.STUDENT_NAME,
      company: r.COMPANY,
      role: r.ROLE,
      status: r.STATUS,
      date: r.APP_DATE
  }));

  res.json(result);
}));

// --- ANALYTICS / STATS ---

app.get('/api/stats', asyncHandler(async (req, res) => {
  const placed = await query("SELECT COUNT(DISTINCT student_id) as count FROM Applications WHERE status = 'Selected'");
  const total = await query("SELECT COUNT(*) as count FROM Students");
  const avgPkg = await query("SELECT AVG(package_ctc) as avg FROM JobRoles");
  const companies = await query("SELECT COUNT(DISTINCT company_id) as count FROM JobRoles");
  const totalJobs = await query("SELECT COUNT(*) as count FROM JobRoles");

  res.json({
    placedStudents: placed[0].COUNT,
    totalStudents: total[0].COUNT,
    avgPackage: parseFloat(avgPkg[0].AVG || 0).toFixed(1),
    totalCompanies: companies[0].COUNT,
    totalJobs: totalJobs[0].COUNT
  });
}));

// --- ADMIN MANAGEMENT ---

app.get('/api/admin/students', asyncHandler(async (req, res) => {
  const rows = await query(`
    SELECT s.student_id, s.name, s.branch, s.cgpa, s.email, 
    CASE WHEN EXISTS (SELECT 1 FROM Applications a WHERE a.student_id = s.student_id AND a.status = 'Selected') THEN 'Placed' ELSE 'Pending' END as status
    FROM Students s
    ORDER BY s.student_id DESC
  `);

  const result = rows.map(r => ({
      student_id: r.STUDENT_ID,
      name: r.NAME,
      branch: r.BRANCH,
      cgpa: r.CGPA,
      email: r.EMAIL,
      status: r.STATUS
  }));

  res.json(result);
}));

app.post('/api/admin/students', asyncHandler(async (req, res) => {
  const { name, branch, cgpa, email } = req.body;
  
  let conn;
  try {
    conn = await pool.getConnection();
    
    const userResult = await conn.execute(
      'INSERT INTO Users (email, password, role) VALUES (:email, :pass, :role) RETURNING user_id INTO :id',
      { 
          email, 
          pass: 'student123', 
          role: 'student',
          id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    const userId = userResult.outBinds.id[0];

    const studentResult = await conn.execute(
      'INSERT INTO Students (user_id, name, branch, cgpa, grad_year, email) VALUES (:uid, :name, :branch, :cgpa, 2026, :email) RETURNING student_id INTO :sid',
      { 
          uid: userId, 
          name, 
          branch, 
          cgpa,
          email,
          sid: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      }
    );

    await conn.commit();
    res.json({ success: true, id: studentResult.outBinds.sid[0] });
  } catch (error) {
    if (conn) await conn.rollback();
    throw error;
  } finally {
    if (conn) await conn.close();
  }
}));

app.delete('/api/admin/students/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  await query('DELETE FROM Students WHERE student_id = :id', { id });
  res.json({ success: true });
}));

app.post('/api/jobs', asyncHandler(async (req, res) => {
  const { title, company_name, type, package, cgpa, branches } = req.body;
  
  let companies = await query('SELECT company_id FROM Companies WHERE name = :name', { name: company_name });
  let companyId;
  
  if (companies.length === 0) {
    let conn;
    try {
        conn = await pool.getConnection();
        const result = await conn.execute(
            'INSERT INTO Companies (name) VALUES (:name) RETURNING company_id INTO :id',
            { name: company_name, id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT } }
        );
        companyId = result.outBinds.id[0];
        await conn.commit();
    } finally {
        if (conn) await conn.close();
    }
  } else {
    companyId = companies[0].COMPANY_ID;
  }

  let conn;
  try {
    conn = await pool.getConnection();
    const jobResult = await conn.execute(
        'INSERT INTO JobRoles (title, company_id, type_of_offer, package_ctc, eligibility_cgpa, branches_allowed) VALUES (:title, :cid, :type, :pkg, :cgpa, :branches) RETURNING role_id INTO :id',
        { 
            title, 
            cid: companyId, 
            type, 
            pkg: package, 
            cgpa, 
            branches,
            id: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        }
    );
    await conn.commit();
    res.json({ success: true, id: jobResult.outBinds.id[0] });
  } finally {
    if (conn) await conn.close();
  }
}));

// --- PATCH: Accept / Reject an application ---
app.patch('/api/admin/applications/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['Pending', 'Selected', 'Rejected', 'Interviewing'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status' });
  }
  await query(
    'UPDATE Applications SET status = :status WHERE application_id = :id',
    { status, id: Number(id) }
  );
  res.json({ success: true, status });
}));

// --- PL/SQL ANALYTICS ENDPOINT ---
app.get('/api/admin/analytics/branch-avg', asyncHandler(async (req, res) => {
  // Branch-wise placement stats (using PL/SQL-style aggregation)
  const branchRows = await query(`
    SELECT 
      s.branch,
      COUNT(s.student_id) AS total,
      COUNT(CASE WHEN a.status = 'Selected' THEN 1 END) AS placed,
      ROUND(COUNT(CASE WHEN a.status = 'Selected' THEN 1 END) * 100.0 / NULLIF(COUNT(s.student_id), 0), 1) AS percent
    FROM Students s
    LEFT JOIN Applications a ON s.student_id = a.student_id
    GROUP BY s.branch
    ORDER BY placed DESC, total DESC
  `);

  // Overall totals
  const totalsRow = await query(`
    SELECT
      COUNT(DISTINCT s.student_id) AS total_students,
      COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.student_id END) AS placed_students,
      COUNT(DISTINCT j.role_id) AS open_jobs,
      COUNT(a.application_id) AS total_applications,
      ROUND(
        COUNT(DISTINCT CASE WHEN a.status = 'Selected' THEN s.student_id END) * 100.0
        / NULLIF(COUNT(DISTINCT s.student_id), 0), 1
      ) AS placement_rate
    FROM Students s
    LEFT JOIN Applications a ON s.student_id = a.student_id
    LEFT JOIN JobRoles j ON a.role_id = j.role_id
  `);

  // Top companies by number of selected applications
  const topCoRows = await query(`
    SELECT c.name, COUNT(a.application_id) AS placements
    FROM Applications a
    JOIN JobRoles j ON a.role_id = j.role_id
    JOIN Companies c ON j.company_id = c.company_id
    WHERE a.status = 'Selected'
    GROUP BY c.name
    ORDER BY placements DESC
    FETCH FIRST 5 ROWS ONLY
  `);

  // Salary stats from JobRoles (package_ctc)
  const salaryRow = await query(`
    SELECT 
      ROUND(AVG(package_ctc), 1) AS average,
      MAX(package_ctc) AS highest,
      MIN(CASE WHEN package_ctc > 0 THEN package_ctc END) AS lowest
    FROM JobRoles
  `);

  res.json({
    branch_stats: branchRows.map(r => ({
      branch: r.BRANCH,
      total: r.TOTAL,
      placed: r.PLACED,
      percent: r.PERCENT || 0
    })),
    totals: {
      total_students: totalsRow[0].TOTAL_STUDENTS,
      placed_students: totalsRow[0].PLACED_STUDENTS,
      open_jobs: totalsRow[0].OPEN_JOBS,
      total_applications: totalsRow[0].TOTAL_APPLICATIONS,
      placement_rate: totalsRow[0].PLACEMENT_RATE || 0
    },
    top_companies: topCoRows.map(r => ({
      name: r.NAME,
      placements: r.PLACEMENTS
    })),
    salary: {
      average: salaryRow[0].AVERAGE || 0,
      highest: salaryRow[0].HIGHEST || 0,
      lowest: salaryRow[0].LOWEST || 0
    }
  });
}));

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
  console.log(`🛢️ Connected to Oracle Database: ${process.env.DB_CONNECTION_STRING}`);
});


