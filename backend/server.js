import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cron from 'node-cron';
import { createClient } from '@supabase/supabase-js';
import { authenticateToken, requireRole } from './middleware/auth.js';
import { sendAlertEmail, sendDailyReport } from './services/emailService.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Supabase client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// CORS config
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://land-regen-dashboard.vercel.app', 'https://land-regen-frontend.onrender.com']
    : ['http://localhost:3001'],
  credentials: true
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

app.use(limiter);
app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/forgot-password', authLimiter);

// Soil health endpoints
app.get('/soil-health', async (req, res) => {
  try {
    const { location, start, end } = req.query;
    let query = supabase.from('soil_health').select('*');

    if (location) query = query.eq('location', location);
    if (start) query = query.gte('timestamp', start);
    if (end) query = query.lte('timestamp', end);

    query = query.order('timestamp', { ascending: false });
    const { data, error } = await query;
    if (error) throw error;

    res.json({ success: true, data, count: data.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/soil-health', async (req, res) => {
  try {
    const { location, moisture_level, erosion_index, vegetation_index, timestamp } = req.body;
    if (!location || moisture_level === undefined || erosion_index === undefined || vegetation_index === undefined) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const { data, error } = await supabase
      .from('soil_health')
      .insert([{ location, moisture_level, erosion_index, vegetation_index, timestamp: timestamp || new Date().toISOString() }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Recommendations
app.get('/recommendations', async (req, res) => {
  try {
    const { location } = req.query;
    let query = supabase.from('soil_health').select('*');
    if (location) query = query.eq('location', location);
    query = query.order('timestamp', { ascending: false }).limit(10);

    const { data, error } = await query;
    if (error) throw error;
    if (data.length === 0) return res.json({ success: true, recommendations: [], message: 'No data available' });

    const latest = data[0];
    const alertDensity = data.filter(d =>
      d.erosion_index > 0.75 || d.vegetation_index < 0.4 || d.moisture_level < 25
    ).length / data.length * 100;

    const getPreferredMethods = ({ vegetation_index, erosion_index, moisture_level }) => {
      const methods = [];

      if (vegetation_index < 0.6) {
        methods.push({
          category: 'Vegetation Recovery',
          practice: vegetation_index < 0.4 ? 'Emergency reforestation' : 'Apply cover crops',
          urgency: vegetation_index < 0.4 ? 'critical' : 'high',
          timeline: vegetation_index < 0.4 ? '1-2 weeks' : '2-4 weeks'
        });
      }

      if (erosion_index > 0.75) {
        methods.push({
          category: 'Erosion Control',
          practice: erosion_index > 0.8 ? 'Install check dams' : 'Initiate terracing',
          urgency: erosion_index > 0.8 ? 'critical' : 'high',
          timeline: erosion_index > 0.8 ? '1 week' : '2-3 weeks'
        });
      }

      if (moisture_level < 35) {
        methods.push({
          category: 'Water Conservation',
          practice: moisture_level < 25 ? 'Emergency irrigation' : 'Install drip irrigation',
          urgency: moisture_level < 25 ? 'critical' : 'medium',
          timeline: moisture_level < 25 ? '3-5 days' : '1-2 weeks'
        });
      }

      if (methods.length === 0) {
        methods.push({
          category: 'Maintenance',
          practice: 'Continue current practices',
          urgency: 'low',
          timeline: 'Ongoing'
        });
      }

      return methods;
    };

    const recommendations = getPreferredMethods(latest);

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
    res.status(500).json({ success: false, error: error.message });
  }
});

// Auth routes
app.post('/register', async (req, res) => {
  try {
    const { email, password, name, role, preferred_zone } = req.body;
    if (!email || !password || !name) return res.status(400).json({ success: false, error: 'Missing required fields' });

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

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`✅ Soil Health API running on port ${port}`);
});

export default app;