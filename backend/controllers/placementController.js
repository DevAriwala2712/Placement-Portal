const Application = require('../models/Application');
const Student = require('../models/Student');

// GET /api/placements — all accepted placements, filterable
exports.getPlacements = async (req, res) => {
    try {
        const filters = {
            branch: req.query.branch || null,
            companyId: req.query.companyId || null,
        };
        const placements = await Application.findAllPlacements(filters);
        res.json({ placements });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/placements/unplaced — students with no accepted application
exports.getUnplacedStudents = async (req, res) => {
    try {
        const students = await Application.findUnplacedStudents();
        res.json({ students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/placements/analytics — comprehensive placement analytics
exports.getAnalytics = async (req, res) => {
    try {
        const analytics = await Application.getPlacementAnalytics();
        res.json(analytics);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/placements/eligible/:jobId — students eligible for a job
exports.getEligibleStudents = async (req, res) => {
    try {
        const { jobId } = req.params;
        const result = await Student.findEligibleForJob(jobId);
        if (!result.job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// GET /api/placements/students-with-status — all students with placement info for admin
exports.getStudentsWithStatus = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        const students = await Student.findAllWithPlacementStatus(limit, offset);
        res.json({ students });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// POST /api/placements/bulk-assign — mass assign students to a job
exports.bulkAssign = async (req, res) => {
    try {
        const { studentIds, jobId, status } = req.body;

        if (!jobId) {
            return res.status(400).json({ message: 'jobId is required' });
        }
        if (!Array.isArray(studentIds) || studentIds.length === 0) {
            return res.status(400).json({ message: 'studentIds must be a non-empty array' });
        }

        const validStatuses = ['applied', 'shortlisted', 'accepted', 'rejected'];
        const assignStatus = validStatuses.includes(status) ? status : 'applied';

        const result = await Application.bulkCreate(studentIds, jobId, assignStatus);
        res.json({
            message: `Assigned ${result.created} student(s) successfully`,
            created: result.created,
            skipped: result.skipped,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// PUT /api/placements/bulk-status — batch update application statuses
exports.bulkUpdateStatus = async (req, res) => {
    try {
        const { applicationIds, status } = req.body;

        if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({ message: 'applicationIds must be a non-empty array' });
        }

        const validStatuses = ['applied', 'shortlisted', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const affected = await Application.bulkUpdateStatus(applicationIds, status);
        res.json({
            message: `Updated ${affected} application(s) to "${status}"`,
            affected,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
