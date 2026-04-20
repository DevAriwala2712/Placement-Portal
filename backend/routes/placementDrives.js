const express = require('express');
const router = express.Router();
const placementDriveController = require('../controllers/placementDriveController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, placementDriveController.getAllPlacementDrives);

module.exports = router;
