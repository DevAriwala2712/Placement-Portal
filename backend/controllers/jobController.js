const Job = require('../models/Job');
const Company = require('../models/Company');

exports.getAllJobs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const filters = {};
        if (req.query.companyId) filters.companyId = req.query.companyId;
        if (req.query.status) filters.status = req.query.status;
        if (req.query.location) filters.location = req.query.location;
        if (req.query.salaryMin) filters.salaryMin = req.query.salaryMin;

        const jobs = await Job.findAll(limit, offset, filters);
        const total = await Job.getCount(filters);

        res.json({
            jobs,
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

exports.getJobById = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createJob = async (req, res) => {
    try {
        if (!req.body.title || !req.body.description) {
            return res.status(400).json({ message: 'Job title and description are required' });
        }

        let companyId = req.body.companyId;
        const companyPayload = req.body.createCompany;
        if (!companyId && companyPayload?.name) {
            companyId = await Company.create(
                companyPayload.name,
                companyPayload.description,
                companyPayload.website,
                companyPayload.contactEmail,
                companyPayload.contactPhone,
                req.user.id
            );
        }

        if (!companyId) {
            return res.status(400).json({ message: 'companyId is required or provide createCompany.name' });
        }

        const jobId = await Job.create(
            req.body.title,
            req.body.description,
            req.body.requirements,
            req.body.salaryMin,
            req.body.salaryMax,
            req.body.location,
            companyId,
            req.user.id
        );
        res.status(201).json({
            id: jobId,
            companyId,
            message: companyPayload?.name
                ? 'Job and linked company created successfully'
                : 'Job created successfully'
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateJob = async (req, res) => {
    try {
        const updated = await Job.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteJob = async (req, res) => {
    try {
        const deleted = await Job.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Job not found' });
        }
        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};