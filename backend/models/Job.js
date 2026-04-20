const pool = require('../config/database');

function addFilter(sqlParts, params, condition, value) {
    if (value !== undefined && value !== null && value !== '') {
        sqlParts.push(condition);
        params.push(value);
    }
}

function buildFilters(filters = {}) {
    const sqlParts = [];
    const params = [];

    addFilter(sqlParts, params, 'j.company_id = ?', filters.companyId);
    addFilter(sqlParts, params, 'j.status = ?', filters.status);

    if (filters.location) {
        sqlParts.push('j.location LIKE ?');
        params.push(`%${filters.location}%`);
    }

    if (filters.salaryMin) {
        sqlParts.push('j.salary_max >= ?');
        params.push(Number(filters.salaryMin));
    }

    if (filters.sourcePdf) {
        sqlParts.push('j.source_pdf = ?');
        params.push(filters.sourcePdf);
    }

    return {
        where: sqlParts.length ? `WHERE ${sqlParts.join(' AND ')}` : '',
        params
    };
}

class Job {
    static async create(title, description, requirements, salaryMin, salaryMax, location, companyId, postedBy) {
        const [result] = await pool.execute(
            `INSERT INTO jobs
                (title, description, requirements, salary_min, salary_max, location, company_id, posted_by, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'open')`,
            [
                title,
                description,
                requirements || '',
                salaryMin ? Number(salaryMin) : 0,
                salaryMax ? Number(salaryMax) : 0,
                location || '',
                companyId,
                postedBy
            ]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.execute(
            `SELECT j.*, DATE_FORMAT(j.drive_date, '%Y-%m-%d') AS drive_date, c.name AS company_name
             FROM jobs j
             LEFT JOIN companies c ON c.id = j.company_id
             WHERE j.id = ?
             LIMIT 1`,
            [id]
        );
        return rows[0];
    }

    static async findAll(limit = 10, offset = 0, filters = {}) {
        const { where, params } = buildFilters(filters);
        const [rows] = await pool.query(
            `SELECT j.*, DATE_FORMAT(j.drive_date, '%Y-%m-%d') AS drive_date, c.name AS company_name
             FROM jobs j
             LEFT JOIN companies c ON c.id = j.company_id
             ${where}
             ORDER BY (j.drive_date IS NULL) ASC, j.drive_date DESC, j.posted_at DESC, j.id DESC
             LIMIT ? OFFSET ?`,
            [...params, Number(limit), Number(offset)]
        );
        return rows;
    }

    static async update(id, updates) {
        const fields = [];
        const values = [];
        const map = {
            title: 'title',
            description: 'description',
            requirements: 'requirements',
            salaryMin: 'salary_min',
            salary_min: 'salary_min',
            salaryMax: 'salary_max',
            salary_max: 'salary_max',
            location: 'location',
            companyId: 'company_id',
            company_id: 'company_id',
            status: 'status',
            driveDate: 'drive_date',
            drive_date: 'drive_date',
            offerType: 'offer_type',
            offer_type: 'offer_type',
            eligibleBranches: 'eligible_branches',
            eligible_branches: 'eligible_branches',
            eligibilityCriteria: 'eligibility_criteria',
            eligibility_criteria: 'eligibility_criteria'
        };

        Object.entries(map).forEach(([input, column]) => {
            if (updates[input] !== undefined) {
                fields.push(`${column} = ?`);
                values.push(['salaryMin', 'salary_min', 'salaryMax', 'salary_max', 'companyId', 'company_id'].includes(input)
                    ? Number(updates[input] || 0)
                    : updates[input]);
            }
        });

        if (!fields.length) return false;
        values.push(id);
        const [result] = await pool.execute(`UPDATE jobs SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM jobs WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getCount(filters = {}) {
        const { where, params } = buildFilters(filters);
        const [rows] = await pool.execute(`SELECT COUNT(*) AS count FROM jobs j ${where}`, params);
        return rows[0].count;
    }
}

module.exports = Job;
