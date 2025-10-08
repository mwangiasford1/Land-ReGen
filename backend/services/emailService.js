import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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
  
  await transporter.sendMail(mailOptions);
};

export const sendDailyReport = async (user, reportData) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: `📊 Daily Soil Health Report - ${user.preferred_zone}`,
    html: `
      <h2>Daily Soil Health Report</h2>
      <p>Hello ${user.name},</p>
      <p>Here's your daily report for <strong>${user.preferred_zone}</strong>:</p>
      <h3>Key Metrics</h3>
      <ul>
        <li>Average Vegetation Index: ${reportData.avgVegetation}</li>
        <li>Average Erosion Index: ${reportData.avgErosion}</li>
        <li>Average Moisture Level: ${reportData.avgMoisture}%</li>
      </ul>
      <h3>AI Recommendations</h3>
      <p>${reportData.recommendations}</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};