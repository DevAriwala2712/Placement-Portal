const pool = require('../config/database');

class Student {
    static async create(userId, name, branch, cgpa, skills, resumeLink, phone, address) {
        const [result] = await pool.execute(
            `INSERT INTO students (user_id, name, branch, cgpa, skills, resume_link, phone, address)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, name, branch, cgpa || null, skills || '', resumeLink || '', phone || '', address || '']
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
        return rows[0];
    }

    static async findByUserId(userId) {
        const [rows] = await pool.execute('SELECT * FROM students WHERE user_id = ? LIMIT 1', [userId]);
        return rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const [rows] = await pool.query(
            'SELECT * FROM students ORDER BY id DESC LIMIT ? OFFSET ?',
            [Number(limit), Number(offset)]
        );
        return rows;
    }

    static async update(id, updates) {
        const fields = [];
        const values = [];
        const map = {
            name: 'name',
            branch: 'branch',
            cgpa: 'cgpa',
            skills: 'skills',
            resumeLink: 'resume_link',
            resume_link: 'resume_link',
            phone: 'phone',
            address: 'address'
        };

        Object.entries(map).forEach(([input, column]) => {
            if (updates[input] !== undefined) {
                fields.push(`${column} = ?`);
                values.push(input === 'cgpa' ? Number(updates[input]) : updates[input]);
            }
        });

        if (!fields.length) return false;
        values.push(id);
        const [result] = await pool.execute(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getCount() {
        const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM students');
        return rows[0].count;
    }

    // ── New: Placement-aware queries ────────────────────────────────

    static async findAllWithPlacementStatus(limit = 50, offset = 0) {
        const [rows] = await pool.query(
            `SELECT s.*,
                    u.email,
                    (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id AND a.status = 'accepted') AS offer_count,
                    (SELECT GROUP_CONCAT(DISTINCT c.name SEPARATOR ', ')
                     FROM applications a
                     JOIN jobs j ON j.id = a.job_id
                     JOIN companies c ON c.id = j.company_id
                     WHERE a.student_id = s.id AND a.status = 'accepted'
                    ) AS placed_at_companies,
                    (SELECT GROUP_CONCAT(DISTINCT j.title SEPARATOR ', ')
                     FROM applications a
                     JOIN jobs j ON j.id = a.job_id
                     WHERE a.student_id = s.id AND a.status = 'accepted'
                    ) AS placed_roles,
                    (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id AND a.status = 'shortlisted') AS shortlisted_count,
                    (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id) AS total_applications
             FROM students s
             JOIN users u ON u.id = s.user_id
             ORDER BY s.name ASC
             LIMIT ? OFFSET ?`,
            [Number(limit), Number(offset)]
        );
        return rows;
    }

    static async findEligibleForJob(jobId) {
        // Get the job's eligibility criteria
        const [jobRows] = await pool.execute(
            `SELECT j.eligible_branches, j.eligibility_criteria, j.id
             FROM jobs j WHERE j.id = ? LIMIT 1`,
            [jobId]
        );
        if (!jobRows[0]) return { job: null, students: [] };
        const job = jobRows[0];

        // Parse branches — the eligible_branches field is a comma-separated string
        const branchList = job.eligible_branches
            ? job.eligible_branches.split(/[,\/]/).map(b => b.trim().toUpperCase()).filter(Boolean)
            : [];

        // Parse minimum CGPA from eligibility_criteria (look for numbers like "6.0", "60%")
        let minCgpa = 0;
        if (job.eligibility_criteria) {
            const cgpaMatch = job.eligibility_criteria.match(/(\d+\.?\d*)\s*(?:cgpa|cg|gpa)/i);
            if (cgpaMatch) {
                minCgpa = parseFloat(cgpaMatch[1]);
            } else {
                const pctMatch = job.eligibility_criteria.match(/(\d+)\s*%/);
                if (pctMatch) {
                    minCgpa = parseFloat(pctMatch[1]) / 10; // 60% → 6.0
                }
            }
        }

        // Build query conditions
        const conditions = [];
        const params = [];

        if (branchList.length > 0) {
            const branchPlaceholders = branchList.map(() => 'UPPER(s.branch) = ?').join(' OR ');
            conditions.push(`(${branchPlaceholders})`);
            params.push(...branchList);
        }

        if (minCgpa > 0) {
            conditions.push('s.cgpa >= ?');
            params.push(minCgpa);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const [students] = await pool.query(
            `SELECT s.*, u.email,
                    EXISTS(SELECT 1 FROM applications a WHERE a.student_id = s.id AND a.job_id = ?) AS already_applied,
                    (SELECT a.status FROM applications a WHERE a.student_id = s.id AND a.job_id = ? LIMIT 1) AS application_status,
                    (SELECT COUNT(*) FROM applications a WHERE a.student_id = s.id AND a.status = 'accepted') AS existing_offers
             FROM students s
             JOIN users u ON u.id = s.user_id
             ${where}
             ORDER BY s.cgpa DESC, s.name ASC`,
            [jobId, jobId, ...params]
        );

        return {
            job,
            eligibility: { branches: branchList, minCgpa },
            students,
        };
    }
}

module.exports = Student;
