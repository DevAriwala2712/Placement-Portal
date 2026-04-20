const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'placement_cell'
    });

    console.log('🌱 Starting mock data seeding...');

    // 1. Clear existing data (optional, but good for a fresh start)
    // Keep admin user if exists, or recreate
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');
    await connection.query('TRUNCATE TABLE applications');
    await connection.query('TRUNCATE TABLE placement_drives');
    await connection.query('TRUNCATE TABLE jobs');
    await connection.query('TRUNCATE TABLE companies');
    await connection.query('TRUNCATE TABLE students');
    await connection.query('DELETE FROM users WHERE role != "admin"');
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');

    const passwordHash = await bcrypt.hash('password', 10);

    const branches = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];
    const skillsList = ['React', 'Node.js', 'Python', 'Java', 'SQL', 'AWS', 'C++', 'Go', 'Docker', 'Kubernetes', 'Machine Learning', 'Data Analysis'];
    const companyNames = [
        'Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Tesla', 'SpaceX', 'Adobe', 'Salesforce',
        'Oracle', 'Intel', 'IBM', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Capgemini', 'Cognizant', 'HCL',
        'Deloitte', 'PwC', 'EY', 'KPMG', 'JPMorgan', 'Goldman Sachs', 'Morgan Stanley', 'Citibank', 'Walmart',
        'Target', 'Uber', 'Lyft', 'Airbnb', 'Stripe', 'Twilio', 'Slack', 'Zoom', 'Atlassian', 'Datadog', 'Snowflake'
    ];
    const jobTitles = [
        'Software Engineer', 'Full Stack Developer', 'Backend Developer', 'Frontend Developer', 'Data Scientist',
        'Data Analyst', 'DevOps Engineer', 'Cloud Architect', 'Security Engineer', 'Product Manager',
        'UI/UX Designer', 'Mobile Developer', 'Embedded Systems Engineer', 'Quality Assurance Engineer'
    ];
    const locations = ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune', 'Delhi', 'Chennai', 'Remote'];

    // 2. Create Companies
    console.log('🏢 Creating companies...');
    const companyIds = [];
    const [adminUser] = await connection.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    const adminId = adminUser[0]?.id || 1;

    for (let i = 0; i < companyNames.length; i++) {
        const [res] = await connection.execute(
            'INSERT INTO companies (name, description, website, contact_email, created_by) VALUES (?, ?, ?, ?, ?)',
            [
                companyNames[i],
                `${companyNames[i]} is a leading innovation company specializing in technology solutions.`,
                `https://${companyNames[i].toLowerCase().replace(/\s/g, '')}.com`,
                `hr@${companyNames[i].toLowerCase().replace(/\s/g, '')}.com`,
                adminId
            ]
        );
        companyIds.push(res.insertId);
    }

    // 3. Create Jobs
    console.log('💼 Creating jobs...');
    const jobIds = [];
    for (let i = 0; i < 100; i++) {
        const companyId = companyIds[Math.floor(Math.random() * companyIds.length)];
        const title = jobTitles[Math.floor(Math.random() * jobTitles.length)];
        const salaryMin = Math.floor(Math.random() * 800000) + 400000;
        const salaryMax = salaryMin + Math.floor(Math.random() * 1000000) + 200000;
        const eligibleBranches = branches.slice(0, Math.floor(Math.random() * 3) + 1).join(', ');
        const [res] = await connection.execute(
            'INSERT INTO jobs (title, description, requirements, salary_min, salary_max, location, company_id, posted_by, status, eligible_branches, eligibility_criteria) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "open", ?, ?)',
            [
                title,
                `Exciting opportunity to join our ${title} team.`,
                'Bachelor\'s degree in related field, strong problem solving skills.',
                salaryMin,
                salaryMax,
                locations[Math.floor(Math.random() * locations.length)],
                companyId,
                adminId,
                eligibleBranches,
                `CGPA ${ (6 + Math.random() * 2).toFixed(1) } and above`
            ]
        );
        jobIds.push(res.insertId);
    }

    // 4. Create Students
    console.log('🎓 Creating 200 students...');
    const firstNames = ['Arjun', 'Isha', 'Aravind', 'Ananya', 'Rohan', 'Sanya', 'Vikram', 'Aditi', 'Kabir', 'Zoya', 'Rahul', 'Priya', 'Amit', 'Neha', 'Siddharth', 'Kiara'];
    const lastNames = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Patel', 'Reddy', 'Iyer', 'Nair', 'Chopra', 'Malhotra', 'Kapoor', 'Deshmukh'];

    const studentIds = [];
    for (let i = 0; i < 200; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const name = `${firstName} ${lastName} ${i + 1}`;
        const email = `student${i + 1}@college.edu`;

        const [userRes] = await connection.execute(
            'INSERT INTO users (email, password, role) VALUES (?, ?, "student")',
            [email, passwordHash]
        );
        const userId = userRes.insertId;

        const branch = branches[Math.floor(Math.random() * branches.length)];
        const cgpa = (7 + Math.random() * 2.8).toFixed(2);
        const skills = skillsList.sort(() => 0.5 - Math.random()).slice(0, 4).join(', ');

        const [studentRes] = await connection.execute(
            'INSERT INTO students (user_id, name, branch, cgpa, skills, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, name, branch, cgpa, skills, `9${Math.floor(100000000 + Math.random() * 900000000)}`, 'Student Housing, Campus']
        );
        studentIds.push(studentRes.insertId);
    }

    // 5. Create Applications & Placements
    console.log('📝 Creating applications and placements...');
    const statuses = ['applied', 'shortlisted', 'rejected', 'accepted'];

    for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        // Each student applies to 2-5 jobs
        const numApps = Math.floor(Math.random() * 4) + 2;
        const appliedJobs = jobIds.sort(() => 0.5 - Math.random()).slice(0, numApps);

        let isPlaced = false;

        for (const jobId of appliedJobs) {
            // Random status, but only one "accepted" per student for simplicity or multiple if allowed
            let status = statuses[Math.floor(Math.random() * statuses.length)];

            if (status === 'accepted') {
                if (isPlaced) {
                    status = 'shortlisted'; // mitigate multiple "accepted" for now if you want, or just allow it
                } else {
                    isPlaced = true;
                }
            }

            const placedAt = status === 'accepted' ? new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)) : null;

            await connection.execute(
                'INSERT INTO applications (student_id, job_id, status, placed_at) VALUES (?, ?, ?, ?)',
                [studentId, jobId, status, placedAt]
            );
        }
    }

    await connection.end();
    console.log('✅ Seeding complete! 200 Students, 40 Companies, 100 Jobs, and ~600 Applications created.');
}

seed().catch(err => {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
});
