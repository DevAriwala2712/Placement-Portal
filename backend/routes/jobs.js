const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, jobController.getAllJobs);
router.get('/:id', authenticateToken, jobController.getJobById);
router.post('/', authenticateToken, authorizeRoles('recruiter', 'admin'), jobController.createJob);
router.put('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), jobController.updateJob);
router.delete('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), jobController.deleteJob);

module.exports = router;
