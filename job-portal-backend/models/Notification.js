// server/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: { type: String, required: true }, // Clerk user ID or Recruiter ID as string
  message: { type: String, required: true },
  type: {
    type: String,
    enum: ['new_job', 'deadline_reminder', 'deadline_final'],
    required: true
  },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;

