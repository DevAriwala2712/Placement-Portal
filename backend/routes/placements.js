const express = require('express');
const router = express.Router();
const placementController = require('../controllers/placementController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const adminOnly = [authenticateToken, authorizeRoles('admin')];
const adminOrRecruiter = [authenticateToken, authorizeRoles('admin', 'recruiter')];

// Placement board — who got placed where
router.get('/', adminOrRecruiter, placementController.getPlacements);

// Unplaced students list
router.get('/unplaced', adminOnly, placementController.getUnplacedStudents);

// Full analytics (rates, branch stats, salary, trends)
router.get('/analytics', adminOnly, placementController.getAnalytics);

// All students with placement status (for enhanced admin students tab)
router.get('/students-with-status', adminOnly, placementController.getStudentsWithStatus);

// Eligible students for a specific job
router.get('/eligible/:jobId', adminOrRecruiter, placementController.getEligibleStudents);

// Bulk assign students to a job
router.post('/bulk-assign', adminOnly, placementController.bulkAssign);

// Batch update application statuses
router.put('/bulk-status', adminOrRecruiter, placementController.bulkUpdateStatus);

module.exports = router;
