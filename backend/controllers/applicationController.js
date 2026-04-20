const Application = require('../models/Application');
const Student = require('../models/Student');
const multer = require('multer');
const path = require('path');

// Configure multer for file upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

exports.applyForJob = [
    upload.single('resume'),
    async (req, res) => {
        try {
            const { jobId } = req.body;
            const student = await Student.findByUserId(req.user.id);
            if (!student) {
                return res.status(404).json({ message: 'Student profile not found' });
            }

            const resumePath = req.file ? req.file.path : null;

            const applicationId = await Application.create(student.id, jobId, resumePath);
            res.status(201).json({ id: applicationId, message: 'Application submitted successfully' });
        } catch (error) {
            console.error(error);
            if (error.code === 'DUPLICATE_APPLICATION') {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Server error' });
        }
    }
];

exports.getApplicationsByStudent = async (req, res) => {
    try {
        const student = await Student.findByUserId(req.user.id);
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const applications = await Application.findByStudentId(student.id, limit, offset);
        const total = await Application.getCountByStudent(student.id);

        res.json({
            applications,
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

exports.getApplicationsByJob = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const applications = await Application.findByJobId(req.params.jobId, limit, offset);
        const total = await Application.getCountByJob(req.params.jobId);

        res.json({
            applications,
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

exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Application.updateStatus(req.params.id, status);
        if (!updated) {
            return res.status(404).json({ message: 'Application not found' });
        }
        res.json({ message: 'Application status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
