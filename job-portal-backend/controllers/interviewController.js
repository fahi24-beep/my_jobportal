import asyncHandler from "express-async-handler";
import sendEmail from "../utils/sendEmail.js";

export const sendInterviewInvitation = asyncHandler(async (req, res) => {
  const { candidateEmail, candidateName, company, position, interviewDate, interviewLink } = req.body;

  if (!candidateEmail || !candidateName || !company || !position || !interviewDate || !interviewLink) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const message = `
Dear ${candidateName},

You are invited to an interview for the position of "${position}" at ${company}.

🗓️ Interview Date & Time: ${new Date(interviewDate).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}
🔗 Interview Link: ${interviewLink}

Good luck!
- ${company} Recruitment Team
`;

  const emailSent = await sendEmail(candidateEmail, "Interview Invitation", message);

  res.status(200).json({ success: true, message: "Interview invitation sent!", emailId: emailSent.messageId });
});
