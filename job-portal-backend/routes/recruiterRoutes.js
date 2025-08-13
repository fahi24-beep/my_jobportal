// server/routes/recruiterRoutes.js
import express from 'express';
import jwt from 'jsonwebtoken';
import Recruiter from '../models/Recruiter.js';

const router = express.Router();

// POST /api/recruiters/register - Register new recruiter
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, company, phone } = req.body;

        // Check if recruiter already exists
        const existingRecruiter = await Recruiter.findOne({ email });
        if (existingRecruiter) {
            return res.status(400).json({ message: 'Recruiter already exists with this email' });
        }

        // Create new recruiter
        const recruiter = new Recruiter({
            name,
            email,
            password,
            company,
            phone
        });

        await recruiter.save();

        // Generate JWT token
        const token = jwt.sign(
            { recruiterId: recruiter._id, email: recruiter.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'Recruiter registered successfully',
            recruiter: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                company: recruiter.company
            },
            token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST /api/recruiters/login - Login recruiter
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find recruiter by email
        const recruiter = await Recruiter.findOne({ email });
        if (!recruiter) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await recruiter.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { recruiterId: recruiter._id, email: recruiter.email },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            recruiter: {
                id: recruiter._id,
                name: recruiter.name,
                email: recruiter.email,
                company: recruiter.company
            },
            token
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/recruiters/profile - Get recruiter profile
router.get('/profile/:id', async (req, res) => {
    try {
        const recruiter = await Recruiter.findById(req.params.id).select('-password');
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        res.json({
            message: 'Profile retrieved successfully',
            recruiter
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/recruiters/profile/:id - Update recruiter profile
router.put('/profile/:id', async (req, res) => {
    try {
        const { name, company, phone } = req.body;
        
        const recruiter = await Recruiter.findByIdAndUpdate(
            req.params.id,
            { name, company, phone },
            { new: true, runValidators: true }
        ).select('-password');

        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            recruiter
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/recruiters - Get all recruiters (for admin)
router.get('/', async (req, res) => {
    try {
        const recruiters = await Recruiter.find().select('-password');
        res.json({
            message: 'Recruiters retrieved successfully',
            count: recruiters.length,
            recruiters
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;