import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { authenticateToken, requireRole } from './middleware/auth.js';
import { sendAlertEmail, sendDailyReport } from './services/emailService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration for production
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://land-regen-dashboard.vercel.app', 'https://land-regen-frontend.onrender.com']
    : ['http://localhost:3001', 'http://127.0.0.1:3001'],
  credentials: true
};

app.use(helmet());
app.use(cors(corsOptions));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, error: 'Too many requests' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, error: 'Too many login attempts' }
});

app.use(limiter);
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/forgot-password', authLimiter);
app.use(express.json({ limit: '10mb' }));

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET /soil-health - Fetch soil health data by location and date range
app.get('/soil-health', async (req, res) => {
  try {
    const { location, start, end } = req.query;
    
    let query = supabase.from('soil_health').select('*');
    
    if (location) {
      query = query.eq('location', location);
    }
    
    if (start) {
      query = query.gte('timestamp', start);
    }
    
    if (end) {
      query = query.lte('timestamp', end);
    }
    
    query = query.order('timestamp', { ascending: false });
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /soil-health - Add new soil health reading
app.post('/soil-health', async (req, res) => {
  try {
    const { location, moisture_level, erosion_index, vegetation_index, timestamp } = req.body;
    
    if (!location || moisture_level === undefined || erosion_index === undefined || vegetation_index === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: location, moisture_level, erosion_index, vegetation_index'
      });
    }
    
    const { data, error } = await supabase
      .from('soil_health')
      .insert([{
        location,
        moisture_level,
        erosion_index,
        vegetation_index,
        timestamp: timestamp || new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    
    res.status(201).json({
      success: true,
      data: data[0]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get daily reports for user
app.get('/daily-reports', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('daily_reports')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(30);
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get notifications for user
app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Mark notification as read
app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);
    
    if (error) throw error;
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get preferred methods recommendations
app.get('/recommendations', async (req, res) => {
  try {
    const { location } = req.query;
    
    // Get latest soil health data
    let query = supabase.from('soil_health').select('*');
    if (location) query = query.eq('location', location);
    query = query.order('timestamp', { ascending: false }).limit(10);
    
    const { data, error } = await query;
    if (error) throw error;
    
    if (data.length === 0) {
      return res.json({ success: true, recommendations: [], message: 'No data available' });
    }
    
    const latest = data[0];
    const alertDensity = data.filter(d => 
      d.erosion_index > 0.75 || d.vegetation_index < 0.4 || d.moisture_level < 25
    ).length / data.length * 100;
    
    // Generate recommendations
    const getPreferredMethods = ({ vegetation_index, erosion_index, moisture_level, alert_density }) => {
      const methods = [];
      
      if (vegetation_index < 0.6) {
        methods.push({
          category: 'Vegetation Recovery',
          practice: vegetation_index < 0.4 ? 'Emergency reforestation with native species' : 'Apply cover crops and compost application',
          urgency: vegetation_index < 0.4 ? 'critical' : 'high',
          timeline: vegetation_index < 0.4 ? '1-2 weeks' : '2-4 weeks'
        });
      }
      
      if (erosion_index > 0.75) {
        methods.push({
          category: 'Erosion Control',
          practice: erosion_index > 0.8 ? 'Install check dams and emergency terracing' : 'Initiate terracing and grass strip installation',
          urgency: erosion_index > 0.8 ? 'critical' : 'high',
          timeline: erosion_index > 0.8 ? '1 week' : '2-3 weeks'
        });
      }
      
      if (moisture_level < 35) {
        methods.push({
          category: 'Water Conservation',
          practice: moisture_level < 25 ? 'Emergency irrigation and mulch application' : 'Install drip irrigation and organic mulching',
          urgency: moisture_level < 25 ? 'critical' : 'medium',
          timeline: moisture_level < 25 ? '3-5 days' : '1-2 weeks'
        });
      }
      
      if (methods.length === 0) {
        methods.push({
          category: 'Maintenance',
          practice: 'Continue current soil management practices',
          urgency: 'low',
          timeline: 'Ongoing'
        });
      }
      
      return methods;
    };
    
    const recommendations = getPreferredMethods({
      vegetation_index: latest.vegetation_index,
      erosion_index: latest.erosion_index,
      moisture_level: latest.moisture_level,
      alert_density: alertDensity
    });
    
    res.json({
      success: true,
      location,
      recommendations,
      metrics: {
        vegetation_index: latest.vegetation_index,
        erosion_index: latest.erosion_index,
        moisture_level: latest.moisture_level,
        alert_density: alertDensity.toFixed(1)
      },
      timestamp: latest.timestamp
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Auth routes
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, preferred_zone } = req.body;
    
    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }
    
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password must be 8+ characters with uppercase, lowercase, and number' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, name, role, preferred_zone }])
      .select();
    
    if (error) throw error;
    
    const token = jwt.sign(
      { id: data[0].id, email: data[0].email, role: data[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ success: true, token, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error || !data) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const validPassword = await bcrypt.compare(password, data.password_hash);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: data.id, email: data.email, role: data.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({ success: true, token, user: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Testimonials routes
app.get('/testimonials', async (req, res) => {
  try {
    const { zone } = req.query;
    let query = supabase
      .from('testimonials')
      .select('*, users(name)')
      .order('created_at', { ascending: false });
    
    if (zone) query = query.eq('zone', zone);
    
    const { data, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/testimonials', authenticateToken, async (req, res) => {
  try {
    const { 
      zone, 
      category, 
      rating, 
      title, 
      comment, 
      practices_used, 
      results_achieved, 
      time_period, 
      would_recommend 
    } = req.body;
    
    const { data, error } = await supabase
      .from('testimonials')
      .insert([{ 
        user_id: req.user.id, 
        zone, 
        category,
        rating, 
        title,
        comment, 
        practices_used: JSON.stringify(practices_used || []),
        results_achieved,
        time_period,
        would_recommend
      }])
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// User settings
app.put('/user/settings', authenticateToken, async (req, res) => {
  try {
    const { preferred_zone, email_notifications, daily_reports } = req.body;
    
    const { data, error } = await supabase
      .from('users')
      .update({ preferred_zone, email_notifications, daily_reports })
      .eq('id', req.user.id)
      .select();
    
    if (error) throw error;
    
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Daily report cron job
cron.schedule('0 8 * * *', async () => {
  try {
    const { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('daily_reports', true);
    
    for (const user of users) {
      const { data: soilData } = await supabase
        .from('soil_health')
        .select('*')
        .eq('location', user.preferred_zone)
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
      
      if (soilData?.length > 0) {
        const reportData = {
          user_id: user.id,
          zone: user.preferred_zone,
          avg_vegetation: (soilData.reduce((sum, d) => sum + d.vegetation_index, 0) / soilData.length).toFixed(2),
          avg_erosion: (soilData.reduce((sum, d) => sum + d.erosion_index, 0) / soilData.length).toFixed(2),
          avg_moisture: (soilData.reduce((sum, d) => sum + d.moisture_level, 0) / soilData.length).toFixed(1),
          recommendations: getRecommendations(soilData)
        };
        
        // Store report in database
        await supabase
          .from('daily_reports')
          .insert([reportData]);
        
        // Create notification for user
        await supabase
          .from('notifications')
          .insert([{
            user_id: user.id,
            title: `Daily Report - ${user.preferred_zone}`,
            message: `Your daily soil health report is ready. Avg vegetation: ${reportData.avg_vegetation}, moisture: ${reportData.avg_moisture}%`,
            type: 'daily_report',
            read: false
          }]);
        
        console.log(`Daily report generated for ${user.email}`);
      }
    }
  } catch (error) {
    console.error('Daily report cron error:', error);
  }
});

const getRecommendations = (soilData) => {
  const latest = soilData[0];
  const recommendations = [];
  
  if (latest.vegetation_index < 0.4) {
    recommendations.push('🌱 Emergency vegetation recovery needed');
  } else if (latest.vegetation_index < 0.6) {
    recommendations.push('🌿 Apply cover crops and organic matter');
  }
  
  if (latest.erosion_index > 0.8) {
    recommendations.push('🚨 Critical erosion control required');
  } else if (latest.erosion_index > 0.6) {
    recommendations.push('⚠️ Implement terracing measures');
  }
  
  if (latest.moisture_level < 25) {
    recommendations.push('💧 Emergency irrigation needed');
  } else if (latest.moisture_level < 40) {
    recommendations.push('🌧️ Increase water conservation');
  }
  
  return recommendations.length > 0 ? recommendations.join('. ') : 'Continue current management practices';
};

// Email testing endpoints
app.post('/test-email/alert', async (req, res) => {
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com'
    };
    const testAlert = {
      location: 'Murang\'a',
      erosion_index: 0.85,
      vegetation_index: 0.35,
      moisture_level: 22
    };
    
    await sendAlertEmail(testUser, testAlert);
    res.json({ success: true, message: 'Alert email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/test-email/daily-report', async (req, res) => {
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      preferred_zone: 'Murang\'a'
    };
    const testReport = {
      avgVegetation: '0.65',
      avgErosion: '0.72',
      avgMoisture: '45.2',
      recommendations: 'Continue monitoring vegetation recovery. Consider implementing erosion control measures in high-risk areas.'
    };
    
    await sendDailyReport(testUser, testReport);
    res.json({ success: true, message: 'Daily report email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/test-email/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email || 'test@example.com',
      subject: '🌱 Welcome to Land ReGen!',
      html: `
        <h2>Welcome to Land ReGen!</h2>
        <p>Hello ${name || 'New User'},</p>
        <p>Thank you for joining our soil health monitoring platform!</p>
        <p>You can now:</p>
        <ul>
          <li>📊 Monitor soil health across Kenya regions</li>
          <li>🚨 Receive real-time alerts</li>
          <li>🤖 Get AI-powered recommendations</li>
          <li>💬 Share testimonials with the community</li>
        </ul>
        <p>Start exploring your dashboard today!</p>
        <p>Best regards,<br>The Land ReGen Team</p>
      `
    };
    
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    console.log('Welcome email skipped - no SMTP configured');
    res.json({ success: true, message: 'Welcome email sent successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Forgot password endpoint
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();
    
    if (!user) {
      return res.status(404).json({ success: false, error: 'Email not found' });
    }
    
    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour
    
    // Store reset token (you'd add reset_token and reset_expiry columns to users table)
    await supabase
      .from('users')
      .update({ 
        reset_token: resetToken,
        reset_expiry: resetExpiry.toISOString()
      })
      .eq('email', email);
    
    // Send reset email
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    const resetUrl = process.env.NODE_ENV === 'production'
      ? `https://land-regen-frontend.onrender.com/?token=${resetToken}`
      : `http://localhost:3001/?token=${resetToken}`;
    
    console.log('Reset token generated:', resetToken);
    
    res.json({ success: true, message: 'Reset email sent' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset password endpoint
app.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    
    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('reset_token', token)
      .single();
    
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid or expired reset token' });
    }
    
    // Check if token is expired
    if (new Date() > new Date(user.reset_expiry)) {
      return res.status(400).json({ success: false, error: 'Reset token has expired' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update password and clear reset token
    await supabase
      .from('users')
      .update({ 
        password_hash: hashedPassword,
        reset_token: null,
        reset_expiry: null
      })
      .eq('id', user.id);
    
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Soil Health API running on port ${port}`);
});

export default app;