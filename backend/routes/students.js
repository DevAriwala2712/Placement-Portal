const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, authorizeRoles('admin'), studentController.getAllStudents);
router.post('/', authenticateToken, authorizeRoles('admin'), studentController.createStudent);
router.get('/:id', authenticateToken, authorizeRoles('admin'), studentController.getStudentById);
router.put('/:id', authenticateToken, authorizeRoles('admin'), studentController.updateStudent);
router.delete('/:id', authenticateToken, authorizeRoles('admin'), studentController.deleteStudent);

module.exports = router;
