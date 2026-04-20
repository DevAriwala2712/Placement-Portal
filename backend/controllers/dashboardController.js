const pool = require('../config/database');

exports.getDashboardStats = async (req, res) => {
    try {
        const [[studentCount]] = await pool.execute('SELECT COUNT(*) AS count FROM students');
        const [[companyCount]] = await pool.execute('SELECT COUNT(*) AS count FROM companies');
        const [[jobCount]] = await pool.execute('SELECT COUNT(*) AS count FROM jobs');
        const [[placementDriveCount]] = await pool.execute('SELECT COUNT(*) AS count FROM placement_drives');
        const [[applicationCount]] = await pool.execute('SELECT COUNT(*) AS count FROM applications');
        const [[placedCount]] = await pool.execute(
            'SELECT COUNT(DISTINCT student_id) AS count FROM applications WHERE status = ?',
            ['accepted']
        );
        const [[salaryStats]] = await pool.execute(
            `SELECT AVG((COALESCE(j.salary_min, 0) + COALESCE(j.salary_max, 0)) / 2) AS averageSalary
             FROM applications a
             JOIN jobs j ON j.id = a.job_id
             WHERE a.status = 'accepted' AND (COALESCE(j.salary_min, 0) + COALESCE(j.salary_max, 0)) > 0`
        );

        const placementPercentage = studentCount.count > 0
            ? (placedCount.count / studentCount.count) * 100
            : 0;

        res.json({
            totalStudents: studentCount.count,
            totalCompanies: companyCount.count,
            totalJobs: jobCount.count,
            totalPlacementDrives: placementDriveCount.count,
            totalApplications: applicationCount.count,
            placedStudents: placedCount.count,
            placementPercentage: placementPercentage.toFixed(2),
            averageSalary: salaryStats.averageSalary ? Number(salaryStats.averageSalary).toFixed(2) : 0
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
