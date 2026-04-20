const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/applicationController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles('student'), applicationController.applyForJob);
router.get('/student', authenticateToken, authorizeRoles('student'), applicationController.getApplicationsByStudent);
router.get('/job/:jobId', authenticateToken, authorizeRoles('recruiter', 'admin'), applicationController.getApplicationsByJob);
router.put('/:id/status', authenticateToken, authorizeRoles('recruiter', 'admin'), applicationController.updateApplicationStatus);

module.exports = router;