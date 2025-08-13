import nodemailer from "nodemailer";

const sendEmail = async (to, subject, text) => {
  // Create Ethereal test account on first run (optional: create your own Ethereal account and put creds in .env)
  let testAccount = await nodemailer.createTestAccount();

  // Create reusable transporter object using Ethereal SMTP
  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // TLS is false for port 587
    auth: {
      user: testAccount.user, // or process.env.ETHEREAL_USER
      pass: testAccount.pass, // or process.env.ETHEREAL_PASS
    },
  });

  // Send mail
  let info = await transporter.sendMail({
    from: '"Job Portal" <no-reply@jobportal.com>',
    to,
    subject,
    text,
  });

  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  return info;
};

export default sendEmail;
