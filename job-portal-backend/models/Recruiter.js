// server/models/Recruiter.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const recruiterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    company: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    avatar: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

// Hash password before saving
recruiterSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
recruiterSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const Recruiter = mongoose.model('Recruiter', recruiterSchema);

export default Recruiter;
