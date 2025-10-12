import nodemailer from 'nodemailer';

// ✅ Create transporter using Gmail SMTP with TLS fallback
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT, 10) || 587,
  secure: false, // TLS via STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false // Helps avoid handshake issues on Render
  }
});

// ✅ Soil Health Alert Email
export const sendAlertEmail = async (user, alertData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `🚨 Soil Health Alert - ${alertData.location}`,
    html: `
      <h2>Soil Health Alert</h2>
      <p>Hello ${user.name},</p>
      <p>An alert has been triggered for <strong>${alertData.location}</strong>:</p>
      <ul>
        <li>Erosion Index: ${alertData.erosion_index}</li>
        <li>Vegetation Index: ${alertData.vegetation_index}</li>
        <li>Moisture Level: ${alertData.moisture_level}%</li>
      </ul>
      <p>Please review the dashboard for detailed analysis.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Alert email sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send alert email:`, error.message);
  }
};

// ✅ Daily Soil Health Report Email
export const sendDailyReport = async (user, reportData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `📊 Daily Soil Health Report - ${user.preferred_zone}`,
    html: `
      <h2>Daily Soil Health Report</h2>
      <p>Hello ${user.name},</p>
      <p>Here's your daily report for <strong>${user.preferred_zone}</strong>:</p>
      <ul>
        <li>Average Vegetation Index: ${reportData.avgVegetation}</li>
        <li>Average Erosion Index: ${reportData.avgErosion}</li>
        <li>Average Moisture Level: ${reportData.avgMoisture}%</li>
      </ul>
      <h3>AI Recommendations</h3>
      <p>${reportData.recommendations}</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Daily report sent to ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send daily report:`, error.message);
  }
};

// ✅ Password Reset Email
export const sendResetEmail = async (recipient, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: recipient,
    subject: '🔐 Reset Your Land ReGen Password',
    html: `
      <h2>Password Reset Request</h2>
      <p>Hello,</p>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>This link will expire in 1 hour.</p>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reset email sent to ${recipient}`);
  } catch (error) {
    console.error(`❌ Failed to send reset email:`, error.message);
  }
};