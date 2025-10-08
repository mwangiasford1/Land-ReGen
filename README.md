# 🌱 Land ReGen - Soil Health Monitoring Dashboard

A comprehensive React-based soil health tracking system for monitoring vegetation, erosion, and moisture levels across multiple regions in Kenya. Built for the Land ReGen Hackathon with Supabase backend and advanced visualization features.

## 📁 Project Structure

```
Soil Health/
├── backend/                    # Node.js API Server
│   ├── server.js              # Express API endpoints
│   ├── schema.sql             # Supabase database schema
│   ├── package.json           # Backend dependencies
│   ├── .env                   # Environment variables
│   └── .env.example           # Environment template
├── frontend/                   # React + Vite Dashboard
│   ├── src/
│   │   ├── components/        # Reusable React components
│   │   │   ├── LineChart.jsx  # Trend visualization
│   │   │   ├── VoiceCommand.jsx # Voice recognition
│   │   │   ├── KPITiles.jsx   # Performance metrics
│   │   │   ├── SummaryCard.jsx # Analysis modal
│   │   │   └── ZoneSelector.jsx # Region picker
│   │   ├── pages/
│   │   │   └── Dashboard.jsx  # Main dashboard page
│   │   ├── services/
│   │   │   └── api.js         # API service layer
│   │   ├── App.jsx            # Root component
│   │   └── main.jsx           # Vite entry point
│   ├── public/                # Static assets
│   ├── vite.config.js         # Vite configuration
│   └── package.json           # Frontend dependencies
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account and project
- Modern web browser with speech recognition support

### Backend Setup
```bash
cd backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Run database schema
# Execute schema.sql in your Supabase SQL editor

npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Access Dashboard
- Frontend: http://localhost:3001
- Backend API: http://localhost:3000

## ✨ Features

### 📊 Interactive Dashboard
- **Multi-Region Support**: Monitor Murang'a, Kiambu, Thika, and Nyeri
- **Real-time KPIs**: Service availability, alert density, vegetation trends
- **SVG Charts**: Optimized line charts with multiple soil metrics
- **Responsive Design**: Glass morphism UI with mobile support

### 🎤 Voice Commands
- **Speech Recognition**: Web Speech API integration
- **Location Commands**: "Show Kiambu data", "Summarize Murang'a"
- **Smart Fallback**: Simulation mode for unsupported browsers
- **Voice Synthesis**: Customizable speech output settings

### 🚨 Alert System
- **Real-time Monitoring**: Configurable thresholds for all metrics
- **Multi-channel Alerts**: Visual, voice, and email notifications
- **Alert Management**: Acknowledge, snooze, and dismiss capabilities
- **Threshold Customization**: Per-metric alert configuration

### 🤖 AI Recommendations
- **Smart Analysis**: Rule-based recommendation engine
- **Urgency Classification**: Critical, high, medium, low priority actions
- **Cost Estimates**: Budget planning for interventions
- **Agricultural Practices**: Tailored soil improvement strategies

### ⚙️ Settings & Configuration
- **User Roles**: Field Agent, Analyst, Admin access levels
- **Language Support**: Multi-language interface
- **Data Sync**: Automatic and manual synchronization options
- **Customizable UI**: Theme, display, and notification preferences

### 🗺️ Zone Management
- **Interactive Selector**: Dropdown and card-based region picker
- **Status Monitoring**: Active/maintenance/inactive indicators
- **Map Visualization**: Monitoring station overview
- **Dynamic Updates**: Real-time data refresh per zone

## 🔗 API Endpoints

### Soil Health Data
```bash
# Get soil health data
GET /soil-health?location=Murang'a&start=2025-10-01&end=2025-10-03

# Add new reading
POST /soil-health
{
  "location": "Murang'a",
  "moisture_level": 45.2,
  "erosion_index": 0.72,
  "vegetation_index": 0.65,
  "timestamp": "2025-10-08T10:00:00Z"
}

# Get AI recommendations
GET /recommendations?location=Murang'a

# Health check
GET /health
```

### Response Format
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "location": "Murang'a",
      "timestamp": "2025-10-08T10:00:00Z",
      "moisture_level": 45.2,
      "erosion_index": 0.72,
      "vegetation_index": 0.65,
      "created_at": "2025-10-08T10:00:00Z"
    }
  ],
  "count": 1
}
```

## 🎯 Component Usage

### Chart Tile
```jsx
import ChartTile from './components/ChartTile';

<ChartTile data={soilData} />
```

### Voice Commands
```jsx
import VoiceCommand from './components/VoiceCommand';

<VoiceCommand 
  onLocationCommand={(location) => setSelectedZone(location)}
  onSummaryRequest={(show) => setShowSummary(show)}
/>
```

### Settings Panel
```jsx
import SettingsPanel from './components/SettingsPanel';

<SettingsPanel 
  isOpen={showSettings}
  onClose={() => setShowSettings(false)}
/>
```

### Preferred Methods
```jsx
import PreferredMethods from './components/PreferredMethods';

<PreferredMethods 
  data={soilData}
  location="Murang'a"
/>
```

## 🌍 Monitoring Regions

| Region | Status | Stations | Focus Areas |
|--------|--------|----------|-------------|
| Murang'a | 🟢 Active | 3 | Vegetation recovery, erosion control |
| Kiambu | 🟢 Active | 2 | Moisture management, soil quality |
| Thika | 🟡 Maintenance | 2 | Infrastructure upgrade |
| Nyeri | 🔴 Inactive | 1 | Pending deployment |

## 🔧 Configuration

### Environment Variables
```bash
# Backend (.env)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000

# Frontend (vite.config.js)
server: {
  port: 3001
}
```

### Security Updates
- **Express**: Updated to 4.20.0 (security vulnerability fixed)
- **Vite**: Updated to 7.1.7 (latest stable version)
- **PropTypes**: Added validation for all React components
- **Code Quality**: SonarLint issues resolved

### Database Schema
```sql
CREATE TABLE soil_health (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  location VARCHAR(100) NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  moisture_level DECIMAL(5,2) CHECK (moisture_level >= 0 AND moisture_level <= 100),
  erosion_index DECIMAL(4,2) CHECK (erosion_index >= 0 AND erosion_index <= 10),
  vegetation_index DECIMAL(4,2) CHECK (vegetation_index >= 0 AND vegetation_index <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 Deployment

### Backend (Railway/Heroku)
```bash
# Build and deploy
npm run build
npm start
```

### Frontend (Vercel/Netlify)
```bash
# Build for production
npm run build

# Preview build
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 🏆 Hackathon Goals

**Land ReGen Dashboard** focuses on:
- 🌱 **Soil Regeneration**: Track vegetation recovery across regions
- 🚨 **Early Warning**: Alert system for erosion and moisture threats
- 📊 **Data-Driven Insights**: KPI monitoring for land restoration
- 🎤 **Accessibility**: Voice-controlled interface for field workers
- 🗺️ **Scalability**: Multi-region monitoring with expansion capability

---

**Built with ❤️ for sustainable agriculture in Kenya** 🇰🇪