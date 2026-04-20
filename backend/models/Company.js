const pool = require('../config/database');

class Company {
    static async create(name, description, website, contactEmail, contactPhone, createdBy) {
        const [result] = await pool.execute(
            `INSERT INTO companies (name, description, website, contact_email, contact_phone, created_by)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description || '', website || '', contactEmail || '', contactPhone || '', createdBy]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await pool.execute('SELECT * FROM companies WHERE id = ? LIMIT 1', [id]);
        return rows[0];
    }

    static async findAll(limit = 10, offset = 0) {
        const [rows] = await pool.query(
            'SELECT * FROM companies ORDER BY name ASC LIMIT ? OFFSET ?',
            [Number(limit), Number(offset)]
        );
        return rows;
    }

    static async update(id, updates) {
        const fields = [];
        const values = [];
        const map = {
            name: 'name',
            description: 'description',
            website: 'website',
            contactEmail: 'contact_email',
            contact_email: 'contact_email',
            contactPhone: 'contact_phone',
            contact_phone: 'contact_phone'
        };

        Object.entries(map).forEach(([input, column]) => {
            if (updates[input] !== undefined) {
                fields.push(`${column} = ?`);
                values.push(updates[input]);
            }
        });

        if (!fields.length) return false;
        values.push(id);
        const [result] = await pool.execute(`UPDATE companies SET ${fields.join(', ')} WHERE id = ?`, values);
        return result.affectedRows > 0;
    }

    static async delete(id) {
        const [result] = await pool.execute('DELETE FROM companies WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }

    static async getCount() {
        const [rows] = await pool.execute('SELECT COUNT(*) AS count FROM companies');
        return rows[0].count;
    }
}

module.exports = Company;
