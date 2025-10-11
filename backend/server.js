import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken } from './middleware/auth.js';
import { sendAlertEmail, sendDailyReport } from './services/emailService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// ✅ CORS configuration
const allowedOrigins = [
  'https://land-regen-1.onrender.com',
  'http://localhost:3001'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// ✅ Global OPTIONS handler
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(204);
});

app.use(helmet());
app.use(express.json({ limit: '10mb' }));

// ✅ Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.use(limiter);
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/forgot-password', authLimiter);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('🌱 Land ReGen backend is running. Try /health or /register');
});

// ✅ Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ✅ Register
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, preferred_zone } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return res.status(400).json({ success: false, error: 'Password must include uppercase, lowercase, and number' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data, error } = await supabase
      .from('users')
      .insert([{ email, password_hash: hashedPassword, name, role, preferred_zone }])
      .select();

    if (error) throw error;

    const token = jwt.sign({ id: data[0].id, email: data[0].email, role: data[0].role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({ success: true, token, user: data[0] });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ✅ Login
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.from('users').select('*').eq('email', email).single();
    if (error || !data) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, data.password_hash);
    if (!validPassword) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = jwt.sign({ id: data.id, email: data.email, role: data.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ success: true, token, user: data });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// ✅ Forgot Password
app.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    const { data: user } = await supabase.from('users').select('*').eq('email', email).single();
    if (!user) return res.status(404).json({ success: false, error: 'Email not found' });

    const crypto = await import('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 3600000); // 1 hour

    await supabase
      .from('users')
      .update({ reset_token: resetToken, reset_expiry: resetExpiry.toISOString() })
      .eq('email', email);

    const resetUrl = `https://land-regen-1.onrender.com/reset?token=${resetToken}`;
    console.log('Reset token generated:', resetToken);

    res.json({ success: true, message: 'Reset email sent', resetUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Reset Password
app.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;

    const { data: user } = await supabase.from('users').select('*').eq('reset_token', token).single();
    if (!user) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    if (new Date() > new Date(user.reset_expiry)) {
      return res.status(400).json({ success: false, error: 'Token expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await supabase
      .from('users')
      .update({ password_hash: hashedPassword, reset_token: null, reset_expiry: null })
      .eq('id', user.id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Soil Health
app.get('/soil-health', authenticateToken, async (req, res) => {
  try {
    const { location, start, end } = req.query;

    if (!location || !start || !end) {
      return res.status(400).json({ success: false, error: 'Missing location or date range' });
    }

    console.log('Incoming soil-health query:', { location, start, end });

    const { data, error } = await supabase
      .from('soil_health')
      .select('*')
      .eq('location', location)
      .gte('timestamp', start)
      .lte('timestamp', end)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error.message);
      return res.status(500).json({ success: false, error: 'Database query failed: ' + error.message });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Soil Health Route Error:', error.message);
    res.status(500).json({ success: false, error: 'Internal server error: ' + error.message });
  }
});

// ✅ Testimonials
app.get('/testimonials', async (req, res) => {
  try {
    const { zone } = req.query;
    let query = supabase.from('testimonials').select('*, users(name)').order('created_at', { ascending: false });
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
      zone, category, rating, title, comment,
      practices_used, results_achieved, time_period, would_recommend
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

// ✅ Daily Reports
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

// ✅ Notifications
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

app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/alert', async (req, res) => {
  try {
    console.log('📨 Alert email test triggered from frontend');

    // Optional: mock zone or recipient for testing
    const mockZone = req.body.zone || 'Murang\'a';
    const mockRecipient = req.body.email || 'test@example.com';

    // Pass mock data to your email service
    await sendAlertEmail(supabase, { zone: mockZone, recipient: mockRecipient });

    res.json({ success: true, message: 'Alert email sent successfully' });
  } catch (error) {
    console.error('Alert email error:', error);
    res.status(500).json({ success: false, error: error.message || 'Unknown error' });
  }
});

// ✅ Daily Report Email (for testing)
app.post('/daily-report', async (req, res) => {
  try {
    const { zone, email } = req.body;
    console.log(`📊 Daily report email triggered for ${zone} → ${email}`);

    // Replace with actual email logic
    // await sendDailyReportEmail(supabase, { zone, email });

    res.json({ success: true, message: 'Mock daily report email sent' });
  } catch (error) {
    console.error('Daily report error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Welcome Email (for testing)
app.post('/welcome', async (req, res) => {
  try {
    const { email, name } = req.body;
    console.log(`🎉 Welcome email triggered for ${name} → ${email}`);

    // Replace with actual email logic if ready
    // await sendWelcomeEmail({ email, name });

    res.json({ success: true, message: 'Mock welcome email sent' });
  } catch (error) {
    console.error('Welcome email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ Cron Jobs
cron.schedule('0 8 * * *', async () => {
  await sendDailyReport(supabase);
});

cron.schedule('0 12 * * *', async () => {
  await sendAlertEmail(supabase);
});

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Land ReGen backend running on port ${port}`);
});