const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const database = process.env.DB_NAME || 'placement_cell';

function splitSql(sql) {
    return sql
        .split(/;\s*(?:\r?\n|$)/)
        .map((statement) => statement.trim())
        .filter(Boolean);
}

async function ignoreExisting(promise) {
    try {
        await promise;
    } catch (error) {
        if (!['ER_DUP_FIELDNAME', 'ER_DUP_KEYNAME', 'ER_TABLE_EXISTS_ERROR'].includes(error.code)) {
            throw error;
        }
    }
}

async function setupDatabase() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: false
    });

    const schemaPath = path.join(__dirname, '..', '..', 'database', 'schema.sql');
    const statements = splitSql(fs.readFileSync(schemaPath, 'utf8'));

    for (const statement of statements) {
        await ignoreExisting(connection.query(statement));
    }

    await connection.query(`USE \`${database}\``);

    const jobColumns = [
        ['drive_date', 'DATE NULL'],
        ['drive_date_raw', 'VARCHAR(50)'],
        ['offer_type', 'VARCHAR(255)'],
        ['eligible_branches', 'TEXT'],
        ['eligibility_criteria', 'TEXT'],
        ['source_pdf', 'VARCHAR(255)'],
        ['source_serial', 'INT']
    ];

    for (const [column, definition] of jobColumns) {
        await ignoreExisting(connection.query(`ALTER TABLE jobs ADD COLUMN ${column} ${definition}`));
    }

    await ignoreExisting(connection.query('CREATE INDEX idx_jobs_source_pdf ON jobs(source_pdf)'));
    await ignoreExisting(connection.query('CREATE INDEX idx_placement_drives_source_pdf ON placement_drives(source_pdf)'));
    await ignoreExisting(connection.query('CREATE INDEX idx_placement_drives_company_id ON placement_drives(company_id)'));
    await ignoreExisting(connection.query('CREATE INDEX idx_placement_drives_job_id ON placement_drives(job_id)'));

    // Add placed_at column to applications (idempotent)
    await ignoreExisting(connection.query('ALTER TABLE applications ADD COLUMN placed_at TIMESTAMP NULL AFTER applied_at'));

    const defaultPassword = await bcrypt.hash('password', 10);
    const seedUser = async (email, role) => {
        const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
        if (existing[0]) return existing[0].id;

        const [result] = await connection.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
            [email, defaultPassword, role]
        );
        return result.insertId;
    };

    await seedUser('admin@college.edu', 'admin');
    const recruiterId = await seedUser('recruiter1@company.com', 'recruiter');
    const studentId = await seedUser('student1@college.edu', 'student');

    const [studentProfile] = await connection.execute('SELECT id FROM students WHERE user_id = ? LIMIT 1', [studentId]);
    if (!studentProfile[0]) {
        await connection.execute(
            `INSERT INTO students (user_id, name, branch, cgpa, skills, resume_link, phone, address)
             VALUES (?, 'Demo Student', 'COE', 8.5, 'JavaScript, SQL, Node.js', '', '9999999999', 'Campus')`,
            [studentId]
        );
    }

    const [company] = await connection.execute('SELECT id FROM companies WHERE name = ? LIMIT 1', ['Demo Recruiter Company']);
    if (!company[0]) {
        await connection.execute(
            `INSERT INTO companies (name, description, website, contact_email, contact_phone, created_by)
             VALUES ('Demo Recruiter Company', 'Default recruiter company for manual testing', '', 'recruiter1@company.com', '', ?)`,
            [recruiterId]
        );
    }

    await connection.end();
}

if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log(`Database '${database}' is ready.`);
        })
        .catch((error) => {
            console.error(error.message);
            process.exit(1);
        });
}

module.exports = setupDatabase;
