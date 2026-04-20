const Student = require('../models/Student');
const User = require('../models/User');

exports.createStudent = async (req, res) => {
    try {
        const {
            email,
            password = 'password',
            name,
            branch,
            cgpa,
            skills,
            resumeLink,
            phone,
            address
        } = req.body;

        if (!email || !name || !branch) {
            return res.status(400).json({ message: 'Email, name, and branch are required' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists' });
        }

        const userId = await User.create(email, password, 'student');
        const studentId = await Student.create(userId, name, branch, cgpa, skills, resumeLink, phone, address);

        res.status(201).json({ id: studentId, message: 'Student created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllStudents = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const students = await Student.findAll(limit, offset);
        const total = await Student.getCount();

        res.json({
            students,
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

exports.getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json(student);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateStudent = async (req, res) => {
    try {
        const updated = await Student.update(req.params.id, req.body);
        if (!updated) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteStudent = async (req, res) => {
    try {
        const deleted = await Student.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'Student not found' });
        }
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
