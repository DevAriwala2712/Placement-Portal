const path = require('path');
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const setupDatabase = require('./setupDatabase');
const { extractPlacementRows } = require('./edpeeeParser');

const sourcePdf = 'EDPEEE.pdf';
const pdfPath = path.join(__dirname, '..', '..', sourcePdf);
const dryRun = process.argv.includes('--dry-run');

function jobDescription(row) {
    return [
        `Imported from ${sourcePdf}.`,
        row.offerType ? `Offer type: ${row.offerType}.` : '',
        row.eligibleBranches ? `Eligible branches: ${row.eligibleBranches}.` : '',
        row.cgpaCriteria ? `CGPA/eligibility: ${row.cgpaCriteria}.` : '',
        row.driveDateRaw ? `Drive date: ${row.driveDateRaw}.` : ''
    ].filter(Boolean).join(' ');
}

async function ensureUser(connection, email, role) {
    const [existing] = await connection.execute('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing[0]) return existing[0].id;

    const password = await bcrypt.hash('password', 10);
    const [result] = await connection.execute(
        'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
        [email, password, role]
    );
    return result.insertId;
}

async function ensureCompany(connection, name, createdBy) {
    const [existing] = await connection.execute('SELECT id FROM companies WHERE name = ? LIMIT 1', [name]);
    if (existing[0]) return existing[0].id;

    const [result] = await connection.execute(
        `INSERT INTO companies (name, description, website, contact_email, contact_phone, created_by)
         VALUES (?, ?, '', '', '', ?)`,
        [name, `Imported from ${sourcePdf}`, createdBy]
    );
    return result.insertId;
}

async function importRows() {
    const rows = extractPlacementRows(pdfPath);
    if (!rows.length) {
        throw new Error(`No placement rows could be extracted from ${pdfPath}`);
    }

    if (dryRun) {
        console.log(JSON.stringify({ sourcePdf, count: rows.length, sample: rows.slice(0, 10) }, null, 2));
        return;
    }

    await setupDatabase();

    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'placement_cell'
    });

    try {
        await connection.beginTransaction();

        const importerId = await ensureUser(connection, 'placement-importer@college.edu', 'recruiter');
        await ensureUser(connection, 'admin@college.edu', 'admin');

        await connection.execute('DELETE FROM placement_drives WHERE source_pdf = ?', [sourcePdf]);
        await connection.execute('DELETE FROM jobs WHERE source_pdf = ?', [sourcePdf]);

        let imported = 0;
        for (const row of rows) {
            const companyId = await ensureCompany(connection, row.companyName, importerId);
            const [jobResult] = await connection.execute(
                `INSERT INTO jobs
                    (title, description, requirements, salary_min, salary_max, location, company_id, posted_by,
                     status, drive_date, drive_date_raw, offer_type, eligible_branches, eligibility_criteria,
                     source_pdf, source_serial)
                 VALUES (?, ?, ?, 0, 0, ?, ?, ?, 'open', ?, ?, ?, ?, ?, ?, ?)`,
                [
                    row.profile.slice(0, 255),
                    jobDescription(row),
                    `Branches: ${row.eligibleBranches || 'Not specified'} | CGPA: ${row.cgpaCriteria || 'Not specified'}`,
                    'Not specified',
                    companyId,
                    importerId,
                    row.driveDate,
                    row.driveDateRaw,
                    row.offerType || null,
                    row.eligibleBranches || null,
                    row.cgpaCriteria || null,
                    sourcePdf,
                    row.sourceSerial || null
                ]
            );

            await connection.execute(
                `INSERT INTO placement_drives
                    (source_pdf, source_serial, drive_date, drive_date_raw, company_id, job_id, company_name,
                     offer_type, eligible_branches, cgpa_criteria, profile, raw_text, page_stream)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    sourcePdf,
                    row.sourceSerial || null,
                    row.driveDate,
                    row.driveDateRaw,
                    companyId,
                    jobResult.insertId,
                    row.companyName,
                    row.offerType || null,
                    row.eligibleBranches || null,
                    row.cgpaCriteria || null,
                    row.profile,
                    row.rawText,
                    row.pageStream
                ]
            );
            imported += 1;
        }

        await connection.commit();
        console.log(`Imported ${imported} placement tracker rows from ${sourcePdf}.`);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        await connection.end();
    }
}

if (require.main === module) {
    importRows().catch((error) => {
        console.error(error.message);
        process.exit(1);
    });
}

module.exports = importRows;
