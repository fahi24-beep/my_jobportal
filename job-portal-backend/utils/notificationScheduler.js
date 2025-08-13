// utils/notificationScheduler.js
import cron from 'node-cron';
import Notification from '../models/Notification.js';
import Job from '../models/Job.js';

/**
 * Starts the cron job to check job deadlines every minute.
 * Should be called ONCE from server.js after io & connectedUsers are set.
 * @param {Object} io - Socket.io instance
 * @param {Map} connectedUsers - Map of connected userId to socketId
 */
export function startDeadlineNotificationCron(io, connectedUsers) {
  console.log('✅ Deadline notification cron started...');

  // Runs every minute
  cron.schedule('* * * * *', async () => {
    const now = new Date();

    // Reminder window: between 23h and 24h from now
    const reminderWindowStart = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const reminderWindowEnd = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // 1️⃣ Find jobs for 24-hour reminder
      const jobsForReminder = await Job.find({
        applicationDeadline: { $gte: reminderWindowStart, $lte: reminderWindowEnd },
        deadlineReminderSent: { $ne: true }
      });

      for (const job of jobsForReminder) {
        await sendDeadlineReminder(job, io, connectedUsers);
        job.deadlineReminderSent = true;
        await job.save();
      }

      // 2️⃣ Find jobs where deadline passed for final notification
      const jobsForFinal = await Job.find({
        applicationDeadline: { $lte: now },
        deadlineFinalSent: { $ne: true }
      });

      for (const job of jobsForFinal) {
        await sendDeadlineFinal(job, io, connectedUsers);
        job.deadlineFinalSent = true;
        job.isActive = false; // Optionally deactivate the job
        await job.save();
      }
    } catch (error) {
      console.error('❌ Error running deadline notification cron:', error);
    }
  });
}

// --- Helper functions ---

async function sendDeadlineReminder(job, io, connectedUsers) {
  const userId = job.recruiterId.toString();
  const message = `Reminder: The deadline for job "${job.title}" is in 24 hours!`;
  await saveAndEmitNotification(userId, message, 'deadline_reminder', job._id, io, connectedUsers);
}

async function sendDeadlineFinal(job, io, connectedUsers) {
  const userId = job.recruiterId.toString();
  const message = `Deadline reached for job "${job.title}". Applications are now closed.`;
  await saveAndEmitNotification(userId, message, 'deadline_final', job._id, io, connectedUsers);
}

async function saveAndEmitNotification(userId, message, type, jobId, io, connectedUsers) {
  const notification = new Notification({
    userId,
    message,
    type,
    jobId,
    createdAt: new Date(),
    read: false,
  });

  await notification.save();

  const socketId = connectedUsers.get(userId);
  if (socketId) {
    io.to(socketId).emit('job_deadline_notification', notification);
    console.log(`📢 Sent notification to user ${userId}: ${message}`);
  } else {
    console.log(`💾 User ${userId} not connected — notification saved.`);
  }
}
