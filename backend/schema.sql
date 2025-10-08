-- Supabase Schema for Soil Health Tracking
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('Field Agent', 'Analyst', 'Admin')) DEFAULT 'Field Agent',
  preferred_zone VARCHAR(100) DEFAULT 'Murang''a',
  email_notifications BOOLEAN DEFAULT true,
  daily_reports BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Soil health table
CREATE TABLE soil_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  moisture_level DECIMAL(5,2) CHECK (moisture_level >= 0 AND moisture_level <= 100),
  erosion_index DECIMAL(4,2) CHECK (erosion_index >= 0 AND erosion_index <= 10),
  vegetation_index DECIMAL(4,2) CHECK (vegetation_index >= 0 AND vegetation_index <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE daily_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  zone VARCHAR(100) NOT NULL,
  avg_vegetation DECIMAL(4,2),
  avg_erosion DECIMAL(4,2),
  avg_moisture DECIMAL(5,2),
  recommendations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'general',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials table
CREATE TABLE testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  zone VARCHAR(100) NOT NULL,
  category VARCHAR(50) DEFAULT 'soil_improvement',
  title VARCHAR(100) NOT NULL,
  comment TEXT NOT NULL,
  practices_used TEXT, -- JSON array of practices
  results_achieved TEXT,
  time_period VARCHAR(20) DEFAULT '1-3 months',
  would_recommend BOOLEAN DEFAULT TRUE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email logs table
CREATE TABLE email_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for efficient querying by location and timestamp
CREATE INDEX idx_soil_health_location_timestamp ON soil_health(location, timestamp);