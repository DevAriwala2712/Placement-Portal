const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/stats', authenticateToken, authorizeRoles('admin'), dashboardController.getDashboardStats);

module.exports = router;