const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/', authenticateToken, companyController.getAllCompanies);
router.get('/:id', authenticateToken, companyController.getCompanyById);
router.post('/', authenticateToken, authorizeRoles('recruiter', 'admin'), companyController.createCompany);
router.put('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), companyController.updateCompany);
router.delete('/:id', authenticateToken, authorizeRoles('recruiter', 'admin'), companyController.deleteCompany);

module.exports = router;
