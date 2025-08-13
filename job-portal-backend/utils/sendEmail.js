import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  // Create test account on demand
  const testAccount = await nodemailer.createTestAccount();

  // Create transporter using Ethereal SMTP
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  // Send mail
  const info = await transporter.sendMail({
    from: `"Job Portal" <${testAccount.user}>`,
    to,
    subject,
    text,
  });

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

  return info;
};

export default sendEmail;
