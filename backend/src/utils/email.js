const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Unified sendEmail wrapper
async function sendEmail(to, subject, html) {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || "no-reply@healthtree.com",
      to,
      subject,
      html,
    });

    return { success: true, info };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

module.exports = { sendEmail };
