import nodemailer from 'nodemailer';

// HTML escape function to prevent XSS
const escapeHtml = (text) => {
  if (typeof text !== 'string') return text;
  return text
    .replaceAll(/&/g, '&amp;')
    .replaceAll(/</g, '&lt;')
    .replaceAll(/>/g, '&gt;')
    .replaceAll(/"/g, '&quot;')
    .replaceAll(/'/g, '&#39;');
};

// ✅ Create transporter using Gmail SMTP with TLS fallback
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: Number.parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Helps avoid handshake issues on Render
  },
  connectionTimeout: 15000, // ⏱️ Increased timeout
});

// ✅ Generic retry wrapper with SMTP response logging
const sendWithRetry = async (mailOptions, label) => {
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`${label} email sent to ${mailOptions.to} on attempt ${attempt}`);
      console.log(`SMTP response: ${info.response}`);
      return;
    } catch (err) {
      console.error(`Attempt ${attempt} failed: ${err.message}`);
      if (attempt < 2) await new Promise((res) => setTimeout(res, 3000));
    }
  }

  console.warn(`All attempts failed for ${label} email to ${mailOptions.to}`);
};

// ✅ Soil Health Alert Email
export const sendAlertEmail = async (user, alertData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Soil Health Alert - ${alertData.location}`,
    html: `
      <h2>Soil Health Alert</h2>
      <p>Hello ${escapeHtml(user.name)},</p>
      <p>An alert has been triggered for <strong>${escapeHtml(alertData.location)}</strong>:</p>
      <ul>
        <li>Erosion Index: ${escapeHtml(alertData.erosion_index)}</li>
        <li>Vegetation Index: ${escapeHtml(alertData.vegetation_index)}</li>
        <li>Moisture Level: ${escapeHtml(alertData.moisture_level)}%</li>
      </ul>
      <p>Please review the dashboard for detailed analysis.</p>
    `,
  };

  await sendWithRetry(mailOptions, 'Alert');
};

// ✅ Daily Soil Health Report Email
export const sendDailyReport = async (user, reportData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `Daily Soil Health Report - ${user.preferred_zone}`,
    html: `
      <h2>Daily Soil Health Report</h2>
      <p>Hello ${escapeHtml(user.name)},</p>
      <p>Here's your daily report for <strong>${escapeHtml(user.preferred_zone)}</strong>:</p>
      <ul>
        <li>Average Vegetation Index: ${escapeHtml(reportData.avgVegetation)}</li>
        <li>Average Erosion Index: ${escapeHtml(reportData.avgErosion)}</li>
        <li>Average Moisture Level: ${escapeHtml(reportData.avgMoisture)}%</li>
      </ul>
      <h3>AI Recommendations</h3>
      <p>${escapeHtml(reportData.recommendations)}</p>
    `,
  };

  await sendWithRetry(mailOptions, 'Daily Report');
};

// ✅ Password Reset Email
export const sendResetEmail = async (recipient, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: 'Reset Your Land ReGen Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${escapeHtml(resetUrl)}">${escapeHtml(resetUrl)}</a></p>
      <p>This link will expire in 1 hour.</p>
    `,
  };

  await sendWithRetry(mailOptions, 'Reset');
};