const Company = require('../models/Company');
const Job = require('../models/Job');

exports.getAllCompanies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const companies = await Company.findAll(limit, offset);
        const total = await Company.getCount();

        res.json({
            companies,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getCompanyById = async (req, res) => {
    try {
        const company = await Company.findById(req.params.id);
        if (!company) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json(company);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createCompany = async (req, res) => {
    try {
        if (!req.body.name) {
            return res.status(400).json({ message: 'Company name is required' });
        }

        const companyId = await Company.create(
            req.body.name,
            req.body.description,
            req.body.website,
            req.body.contactEmail,
            req.body.contactPhone,
            req.user.id
        );

        let linkedJobId = null;
        const linkedJob = req.body.createDefaultJob;
        if (linkedJob && linkedJob.title) {
            linkedJobId = await Job.create(
                linkedJob.title,
                linkedJob.description || `Opportunity at ${req.body.name}`,
                linkedJob.requirements || '',
                linkedJob.salaryMin,
                linkedJob.salaryMax,
                linkedJob.location || '',
                companyId,
                req.user.id
            );
        }

        res.status(201).json({
            id: companyId,
            linkedJobId,
            message: linkedJobId
                ? 'Company and linked job created successfully'
                : 'Company created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateCompany = async (req, res) => {
    try {
        const updated = await Company.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json({ message: 'Company updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteCompany = async (req, res) => {
    try {
        const deleted = await Company.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Company not found' });
        }
        res.json({ message: 'Company deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};