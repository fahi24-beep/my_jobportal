// server/routes/jobRoutes.js
import express from 'express';
import Job from '../models/Job.js';
import Recruiter from '../models/Recruiter.js';

import Notification from '../models/Notification.js';
import { startDeadlineNotificationCron } from '../utils/notificationScheduler.js';


const router = express.Router();

// POST /api/jobs - Create new job with notifications
router.post('/', async (req, res) => {
    try {
        const {
            title,
            company,
            location,
            description,
            requirements,
            salary,
            jobType,
            experienceLevel,
            category,
            recruiterId,
            applicationDeadline
        } = req.body;

        // Verify recruiter exists
        const recruiter = await Recruiter.findById(recruiterId);
        if (!recruiter) {
            return res.status(404).json({ message: 'Recruiter not found' });
        }

        const job = new Job({
            title,
            company,
            location,
            description,
            requirements,
            salary,
            jobType,
            experienceLevel,
            category,
            recruiterId,
            applicationDeadline
        });

        await job.save();

        // -------------- YOUR NOTIFICATION PART -------------------

        // Save notification for new job post
        const notification = new Notification({
            userId: recruiterId.toString(),
            message: `New job posted: ${job.title}`,
            type: 'new_job'
        });
        await notification.save();

        // Emit notification to recruiter if connected
        const io = req.app.get('io');
        const connectedUsers = req.app.get('connectedUsers');
        const socketId = connectedUsers.get(recruiterId.toString());
        if (socketId) {
            io.to(socketId).emit('new_job_posted', notification);
        }

        // Schedule deadline notifications (24h reminder & final)
        //scheduleDeadlineNotifications(job, io, connectedUsers);

        // ---------------------------------------------------------

        res.status(201).json({
            message: 'Job created successfully, notifications sent/scheduled',
            job
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// GET /api/jobs - Get all jobs (with filtering)
router.get('/', async (req, res) => {
    try {
        const { title, location, category, jobType, page = 1, limit = 10 } = req.query;
        
        // Build filter object
        const filter = { isActive: true };
        if (title) filter.title = { $regex: title, $options: 'i' };
        if (location) filter.location = { $regex: location, $options: 'i' };
        if (category) filter.category = { $regex: category, $options: 'i' };
        if (jobType) filter.jobType = jobType;

        // Execute query with pagination
        const jobs = await Job.find(filter)
            .populate('recruiterId', 'name company')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Job.countDocuments(filter);

        res.json({
            message: 'Jobs retrieved successfully',
            jobs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalJobs: total,
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/jobs/:id - Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('recruiterId', 'name company phone email');
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({
            message: 'Job retrieved successfully',
            job
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// PUT /api/jobs/:id - Update job
router.put('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('recruiterId', 'name company');

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({
            message: 'Job updated successfully',
            job
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
    try {
        const job = await Job.findByIdAndDelete(req.params.id);
        
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        res.json({
            message: 'Job deleted successfully',
            job
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/jobs/:id/apply - Apply to job
router.post('/:id/apply', async (req, res) => {
    try {
        const { userId } = req.body; // Clerk user ID
        
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if user already applied
        const existingApplication = job.applicants.find(app => app.userId === userId);
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied to this job' });
        }

        // Add applicant
        job.applicants.push({ userId });
        await job.save();

        res.json({
            message: 'Application submitted successfully',
            applicationId: job.applicants[job.applicants.length - 1]._id
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
