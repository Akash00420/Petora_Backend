const nodemailer = require("nodemailer");

// Same setup as the working QuickMeds mailer: Gmail via EMAIL_USER / EMAIL_PASS
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Send an email.
 * @param {Object} options
 * @param {string} options.to
 * @param {string} options.subject
 * @param {string} options.text
 * @param {string} [options.html]
 */
const sendEmail = async ({ to, subject, text, html }) => {
  await transporter.sendMail({
    from: `"Petora" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
};

module.exports = sendEmail;