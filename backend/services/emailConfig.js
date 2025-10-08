import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (process.env.EMAIL_ENABLED === 'false') {
    return null;
  }

  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  };

  return nodemailer.createTransporter(config);
};

export const sendEmail = async (mailOptions) => {
  const transporter = createTransporter();
  
  if (!transporter) {
    console.log('Email disabled - would send:', mailOptions.subject);
    return { success: true, message: 'Email service disabled' };
  }

  try {
    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Email error:', error.message);
    return { success: false, error: error.message };
  }
};

export default { sendEmail };