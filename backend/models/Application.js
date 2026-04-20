const pool = require('../config/database');

class Application {
    static async create(studentId, jobId, resumePath) {
        try {
            const [result] = await pool.execute(
                `INSERT INTO applications (student_id, job_id, status, resume_path)
                 VALUES (?, ?, 'applied', ?)`,
                [studentId, jobId, resumePath || null]
            );
            return result.insertId;
        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                const duplicate = new Error('You have already applied for this job');
                duplicate.code = 'DUPLICATE_APPLICATION';
                throw duplicate;
            }
            throw error;
        }
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM applications WHERE id = ? LIMIT 1', [id]);
        return rows[0];
    }

    static async findByStudentId(studentId, limit = 10, offset = 0) {
        const [rows] = await pool.query(
            `SELECT a.*, j.title, j.company_id, c.name AS company_name
             FROM applications a
             LEFT JOIN jobs j ON j.id = a.job_id
             LEFT JOIN companies c ON c.id = j.company_id
             WHERE a.student_id = ?
             ORDER BY a.applied_at DESC
             LIMIT ? OFFSET ?`,
            [studentId, Number(limit), Number(offset)]
        );
        return rows;
    }

    static async findByJobId(jobId, limit = 10, offset = 0) {
        const [rows] = await pool.query(
            `SELECT a.*, s.name AS student_name, s.branch, s.cgpa, s.skills
             FROM applications a
             LEFT JOIN students s ON s.id = a.student_id
             WHERE a.job_id = ?
             ORDER BY a.applied_at DESC
             LIMIT ? OFFSET ?`,
            [jobId, Number(limit), Number(offset)]
        );
        return rows;
    }

    static async updateStatus(id, status) {
        const placedAt = status === 'accepted' ? new Date() : null;
        const [result] = await pool.execute(
            'UPDATE applications SET status = ?, placed_at = ? WHERE id = ?',
            [status, placedAt, id]
        );
        return result.affectedRows > 0;
    }

    static async getCountByJob(jobId) {
        const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM applications WHERE job_id = ?', [jobId]);
        return rows[0].count;
    }

    static async getCountByStudent(studentId) {
        const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM applications WHERE student_id = ?', [studentId]);
        return rows[0].count;
    }

    // ── New: Bulk Operations ────────────────────────────────────────

    static async bulkCreate(studentIds, jobId, status = 'applied') {
        if (!studentIds.length) return { created: 0, skipped: 0 };
        let created = 0;
        let skipped = 0;
        const placedAt = status === 'accepted' ? new Date() : null;

        for (const studentId of studentIds) {
            try {
                await pool.execute(
                    'INSERT INTO applications (student_id, job_id, status, placed_at) VALUES (?, ?, ?, ?)',
                    [studentId, jobId, status, placedAt]
                );
                created++;
            } catch (error) {
                if (error.code === 'ER_DUP_ENTRY') {
                    // Update existing application's status instead
                    await pool.execute(
                        'UPDATE applications SET status = ?, placed_at = ? WHERE student_id = ? AND job_id = ?',
                        [status, placedAt, studentId, jobId]
                    );
                    created++;
                } else {
                    skipped++;
                }
            }
        }
        return { created, skipped };
    }

    static async bulkUpdateStatus(applicationIds, status) {
        if (!applicationIds.length) return 0;
        const placedAt = status === 'accepted' ? new Date() : null;
        const placeholders = applicationIds.map(() => '?').join(',');
        const [result] = await pool.query(
            `UPDATE applications SET status = ?, placed_at = ? WHERE id IN (${placeholders})`,
            [status, placedAt, ...applicationIds]
        );
        return result.affectedRows;
    }

    // ── New: Placement Queries ──────────────────────────────────────

    static async findAllPlacements(filters = {}) {
        const conditions = ["a.status = 'accepted'"];
        const params = [];

        if (filters.branch) {
            conditions.push('s.branch = ?');
            params.push(filters.branch);
        }
        if (filters.companyId) {
            conditions.push('j.company_id = ?');
            params.push(filters.companyId);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
        const [rows] = await pool.query(
            `SELECT a.id AS application_id, a.status, a.placed_at, a.applied_at,
                    s.id AS student_id, s.name AS student_name, s.branch, s.cgpa, s.skills, s.phone,
                    j.id AS job_id, j.title AS job_title, j.salary_min, j.salary_max, j.location,
                    c.id AS company_id, c.name AS company_name
             FROM applications a
             JOIN students s ON s.id = a.student_id
             JOIN jobs j ON j.id = a.job_id
             JOIN companies c ON c.id = j.company_id
             ${where}
             ORDER BY a.placed_at DESC, a.applied_at DESC`,
            params
        );
        return rows;
    }

    static async findUnplacedStudents() {
        const [rows] = await pool.query(
            `SELECT s.*, u.email
             FROM students s
             JOIN users u ON u.id = s.user_id
             WHERE s.id NOT IN (
                 SELECT DISTINCT student_id FROM applications WHERE status = 'accepted'
             )
             ORDER BY s.name ASC`
        );
        return rows;
    }

    static async getPlacementAnalytics() {
        const [[totals]] = await pool.execute(
            `SELECT
                 (SELECT COUNT(*) FROM students) AS total_students,
                 (SELECT COUNT(DISTINCT student_id) FROM applications WHERE status = 'accepted') AS placed_students,
                 (SELECT COUNT(*) FROM applications) AS total_applications,
                 (SELECT COUNT(*) FROM applications WHERE status = 'shortlisted') AS shortlisted,
                 (SELECT COUNT(*) FROM applications WHERE status = 'rejected') AS rejected,
                 (SELECT COUNT(*) FROM jobs WHERE status = 'open') AS open_jobs,
                 (SELECT COUNT(*) FROM companies) AS total_companies`
        );

        // Branch-wise placement stats
        const [branchStats] = await pool.query(
            `SELECT s.branch,
                    COUNT(DISTINCT s.id) AS total,
                    COUNT(DISTINCT CASE WHEN a.status = 'accepted' THEN s.id END) AS placed
             FROM students s
             LEFT JOIN applications a ON a.student_id = s.id
             GROUP BY s.branch
             ORDER BY s.branch`
        );

        // Salary stats from placed students
        const [[salaryStats]] = await pool.execute(
            `SELECT
                 AVG((COALESCE(j.salary_min, 0) + COALESCE(j.salary_max, 0)) / 2) AS avg_package,
                 MAX(j.salary_max) AS highest_package,
                 MIN(CASE WHEN j.salary_min > 0 THEN j.salary_min END) AS lowest_package
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             WHERE a.status = 'accepted' AND (COALESCE(j.salary_min, 0) + COALESCE(j.salary_max, 0)) > 0`
        );

        // Top recruiting companies
        const [topCompanies] = await pool.query(
            `SELECT c.name, COUNT(DISTINCT a.student_id) AS placements
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             JOIN companies c ON c.id = j.company_id
             WHERE a.status = 'accepted'
             GROUP BY c.id, c.name
             ORDER BY placements DESC
             LIMIT 5`
        );

        // Monthly placement trend (last 6 months)
        const [monthlyTrend] = await pool.query(
            `SELECT DATE_FORMAT(placed_at, '%Y-%m') AS month,
                    COUNT(*) AS placements
             FROM applications
             WHERE status = 'accepted' AND placed_at IS NOT NULL
             GROUP BY month
             ORDER BY month DESC
             LIMIT 6`
        );

        return {
            ...totals,
            placement_rate: totals.total_students > 0
                ? ((totals.placed_students / totals.total_students) * 100).toFixed(1)
                : 0,
            branch_stats: branchStats,
            salary: {
                average: salaryStats.avg_package ? Number(salaryStats.avg_package).toFixed(0) : 0,
                highest: salaryStats.highest_package || 0,
                lowest: salaryStats.lowest_package || 0,
            },
            top_companies: topCompanies,
            monthly_trend: monthlyTrend.reverse(),
        };
    }
}

module.exports = Application;
