// server/models/Job.js
import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Job title is required'],
        trim: true
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    location: {
        type: String,
        required: [true, 'Location is required'],
        trim: true
    },
    description: {
        type: String,
        required: [true, 'Job description is required']
    },
    requirements: [{
        type: String,
        trim: true
    }],
    salary: {
        min: {
            type: Number,
            default: 0
        },
        max: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'USD'
        }
    },
    jobType: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'],
        default: 'Full-time'
    },
    experienceLevel: {
        type: String,
        enum: ['Entry', 'Mid', 'Senior', 'Lead'],
        default: 'Entry'
    },
    category: {
        type: String,
        required: [true, 'Job category is required'],
        trim: true
    },
    recruiterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Recruiter',
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicationDeadline: {
        type: Date
    },

    // Added fields for deadline notification tracking
    deadlineReminderSent: {
        type: Boolean,
        default: false,
    },
    deadlineFinalSent: {
        type: Boolean,
        default: false,
    },

    applicants: [{
        userId: {
            type: String, // Clerk user ID
            required: true
        },
        appliedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['applied', 'reviewing', 'shortlisted', 'rejected', 'hired'],
            default: 'applied'
        }
    }]
}, {
    timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
