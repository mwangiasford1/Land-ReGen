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
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 15000
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
    from: `"Land ReGen Support" <${process.env.EMAIL_USER}>`,
    to: recipient,
    replyTo: process.env.EMAIL_USER,
    subject: 'Password Reset - Land ReGen',
    text: `Hello,\n\nYou requested a password reset for your Land ReGen account.\n\nReset your password: ${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nLand ReGen Team`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h2 style="color: #2c5530; margin-bottom: 20px;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You requested a password reset for your Land ReGen account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${escapeHtml(resetUrl)}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">This link will expire in 1 hour.</p>
          <p style="font-size: 14px; color: #666;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #999;">Best regards,<br>Land ReGen Team</p>
        </div>
      </body>
      </html>
    `,
  };

  await sendWithRetry(mailOptions, 'Reset');
};