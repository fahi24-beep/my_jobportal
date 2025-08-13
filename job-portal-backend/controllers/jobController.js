import Job from "../models/Job.js";
import Notification from "../models/Notification.js";
import sendEmail from "../utils/sendEmail.js";

let ioInstance;

export const setIOInstance = (io) => {
  ioInstance = io;
};

// Send final deadline email + socket event
async function sendDeadlineEmail(job) {
  // Populate recruiter to get email and id
  await job.populate("recruiter");

  await sendEmail(
    job.recruiter.email,
    `Deadline reached for job: ${job.title}`,
    `The deadline for your job "${job.title}" has been reached.`
  );

  const notif = new Notification({
    user: job.recruiter._id,
    message: `Deadline reached for "${job.title}"`,
    type: "deadline_final",
  });
  await notif.save();

  ioInstance.to(job.recruiter._id.toString()).emit("deadline_final", notif);
}

// Schedule reminder 24h before deadline and final deadline notification
function scheduleDeadlineNotifications(job) {
  const now = Date.now();
  const deadlineTime = job.deadline.getTime();

  // Reminder 24 hours before deadline
  const reminderDelay = deadlineTime - now - 24 * 60 * 60 * 1000;
  if (reminderDelay > 0) {
    setTimeout(async () => {
      const reminderNotif = new Notification({
        user: job.recruiter._id,
        message: `24 hours left to apply for "${job.title}"`,
        type: "deadline_reminder",
      });
      await reminderNotif.save();

      ioInstance.to(job.recruiter._id.toString()).emit("deadline_reminder", reminderNotif);
    }, reminderDelay);
  }

  // Final deadline notification
  const finalDelay = deadlineTime - now;
  if (finalDelay > 0) {
    setTimeout(() => sendDeadlineEmail(job), finalDelay);
  } else {
    sendDeadlineEmail(job);
  }
}

export const createJob = async (req, res) => {
  const { title, description, deadline, recruiterId } = req.body;

  if (!title || !description || !deadline || !recruiterId) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const job = await Job.create({
      title,
      description,
      deadline: new Date(deadline),
      recruiter: recruiterId,
    });

    const notifForPoster = new Notification({
      user: recruiterId,
      message: `New job posted: "${title}"`,
      type: "new_job",
    });
    await notifForPoster.save();

    // Emit new job to all job seekers
    ioInstance.to("job_seekers").emit("new_job_posted", {
      message: `New job posted: "${title}"`,
      type: "new_job",
      jobId: job._id,
    });

    // Emit notification to the recruiter
    ioInstance.to(recruiterId.toString()).emit("new_job_posted", notifForPoster);

    scheduleDeadlineNotifications(job);

    res.status(201).json({
      message: "Job created & notifications scheduled",
      job,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      user: req.params.userId,
    })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
