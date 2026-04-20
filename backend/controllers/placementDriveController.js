const pool = require('../config/database');

exports.getAllPlacementDrives = async (req, res) => {
    try {
        const page = parseInt(req.query.page, 10) || 1;
        const limit = parseInt(req.query.limit, 10) || 25;
        const offset = (page - 1) * limit;
        const filters = [];
        const params = [];

        if (req.query.company) {
            filters.push('company_name LIKE ?');
            params.push(`%${req.query.company}%`);
        }

        if (req.query.sourcePdf) {
            filters.push('source_pdf = ?');
            params.push(req.query.sourcePdf);
        }

        const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
        const [rows] = await pool.query(
            `SELECT placement_drives.*, DATE_FORMAT(drive_date, '%Y-%m-%d') AS drive_date
             FROM placement_drives
             ${where}
             ORDER BY (drive_date IS NULL) ASC, drive_date DESC, id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );
        const [[count]] = await pool.query(
            `SELECT COUNT(*) AS total FROM placement_drives ${where}`,
            params
        );

        res.json({
            placementDrives: rows,
            pagination: {
                page,
                limit,
                total: count.total,
                pages: Math.ceil(count.total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
