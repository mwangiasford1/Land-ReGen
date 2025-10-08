import React, { useState, useEffect } from 'react';
import { fetchSoilHealth } from '../services/api';
import { generateSummary } from '../services/summaryEngine';
import { alertEngine } from '../services/alertEngine';
import { calculateServiceMetrics, getDataFreshness } from '../services/serviceMonitor';
import { useSettings } from '../contexts/SettingsContext';
import LineChart from '../components/LineChart';
import VoiceCommand from '../components/VoiceCommand';
import KPITiles from '../components/KPITiles';
import SummaryCard from '../components/SummaryCard';
import ZoneSelector from '../components/ZoneSelector';
import ZoneComparison from '../components/ZoneComparison';
import AlertHistory from '../components/AlertHistory';
import DataFreshness from '../components/DataFreshness';
import ReportExporter from '../components/ReportExporter';
import PreferredMethods from '../components/PreferredMethods';
import SettingsPanel from '../components/SettingsPanel';
import Sidebar from '../components/Sidebar';
import KPITile from '../components/KPITile';
import TestimonialForm from '../components/TestimonialForm';
import TestimonialList from '../components/TestimonialList';
import UserSettings from '../components/UserSettings';
import EmailTester from '../components/EmailTester';
import CanvasChart from '../components/CanvasChart';

export default function Dashboard({ user, onLogout }) {
  const { settings, updateSettings } = useSettings();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState(settings.defaultZone);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [alerts, setAlerts] = useState([]);
  const [allZoneData, setAllZoneData] = useState({});
  const [serviceMetrics, setServiceMetrics] = useState({});
  const [lastUpdate, setLastUpdate] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: '2025-10-01',
    end: '2025-10-03'
  });
  const [currentMetrics, setCurrentMetrics] = useState({
    vegetation: { current: 0.55, previous: 0.60 },
    erosion: { current: 0.78, previous: 0.72 },
    moisture: { current: 36, previous: 38 }
  });

  const loadData = async (location = selectedZone) => {
    setLoading(true);
    try {
      const result = await fetchSoilHealth(location, dateRange.start, dateRange.end);
      if (result.success && result.data) {
        setData(result.data);
        
        // Update current metrics from latest data
        const latest = result.data[0]; // Most recent first
        const previous = result.data[1];
        
        if (latest) {
          setCurrentMetrics({
            vegetation: {
              current: latest.vegetation_index,
              previous: previous?.vegetation_index || latest.vegetation_index
            },
            erosion: {
              current: latest.erosion_index,
              previous: previous?.erosion_index || latest.erosion_index
            },
            moisture: {
              current: latest.moisture_level,
              previous: previous?.moisture_level || latest.moisture_level
            }
          });
        }

        // Check for alerts using settings thresholds
        alertEngine.updateThresholds({
          erosion_critical: settings.alertThresholds.erosion,
          vegetation_low: settings.alertThresholds.vegetation,
          moisture_low: settings.alertThresholds.moisture
        });
        const newAlerts = alertEngine.checkAlerts(result.data, location);
        setAlerts(alertEngine.getActiveAlerts());

        // Calculate service metrics
        const metrics = calculateServiceMetrics(result.data, location);
        setServiceMetrics(prev => ({ ...prev, [location]: metrics }));
        
        // Store data for all zones
        setAllZoneData(prev => ({ ...prev, [location]: result.data }));
        
        // Update last sync time
        setLastUpdate(new Date().toISOString());
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleZoneChange = (zone) => {
    setSelectedZone(zone);
    loadData(zone);
    // Update default zone in settings
    if (settings.defaultZone !== zone) {
      updateSettings({ defaultZone: zone });
    }
  };

  const handleVoiceLocation = (location) => {
    setSelectedZone(location);
    loadData(location);
  };

  const handleSummaryRequest = (show, summary = null) => {
    if (summary) {
      setSummaryData(summary);
    } else if (show) {
      const generatedSummary = generateSummary(data, selectedZone);
      setSummaryData(generatedSummary);
    }
    setShowSummary(show);
  };

  useEffect(() => {
    loadData();
  }, [selectedZone, dateRange]);

  // Auto-refresh based on settings
  useEffect(() => {
    if (settings.dataSync.frequency === 'realtime') {
      const interval = setInterval(() => loadData(selectedZone), 30000); // 30 seconds
      return () => clearInterval(interval);
    } else if (settings.dataSync.frequency === 'hourly') {
      const interval = setInterval(() => loadData(selectedZone), 3600000); // 1 hour
      return () => clearInterval(interval);
    } else if (settings.dataSync.frequency === 'daily') {
      const interval = setInterval(() => loadData(selectedZone), 86400000); // 24 hours
      return () => clearInterval(interval);
    }
  }, [settings.dataSync.frequency, selectedZone]);

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading">🌱 Loading soil health data...</div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'zones':
        return (
          <>
            <ZoneSelector 
              selectedZone={selectedZone}
              onZoneChange={handleZoneChange}
            />
            <ZoneComparison allZoneData={allZoneData} />
          </>
        );
      case 'analytics':
        return (
          <div className="analytics-section" style={{
            padding: window.innerWidth < 768 ? '10px' : '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: window.innerWidth < 768 ? '15px' : '20px'
          }}>
            <h2 style={{
              fontSize: window.innerWidth < 768 ? '1.5rem' : '2rem',
              margin: '0 0 10px 0'
            }}>📊 Analytics</h2>
            
            <div className="chart-container" style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '15px' : '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: window.innerWidth < 768 ? '1.1rem' : '1.3rem',
                margin: '0 0 15px 0'
              }}>🔄 Live Moisture</h3>
              <CanvasChart 
                data={data} 
                zones={[selectedZone]} 
                type="realtime" 
              />
            </div>
            
            <div className="chart-container" style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '15px' : '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: window.innerWidth < 768 ? '1.1rem' : '1.3rem',
                margin: '0 0 15px 0'
              }}>🌍 Multi-Zone</h3>
              <CanvasChart 
                data={Object.values(allZoneData).flat()} 
                zones={window.innerWidth < 768 ? [selectedZone, 'Kiambu'] : ['Murang\'a', 'Kiambu', 'Thika', 'Nyeri']} 
                type="multizone" 
              />
            </div>
            
            <div className="chart-container" style={{
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '12px',
              padding: window.innerWidth < 768 ? '15px' : '20px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{
                fontSize: window.innerWidth < 768 ? '1.1rem' : '1.3rem',
                margin: '0 0 15px 0'
              }}>📈 High-Density</h3>
              <CanvasChart 
                data={data} 
                zones={[selectedZone]} 
                type="density" 
              />
            </div>
          </div>
        );
      case 'voice':
        return (
          <VoiceCommand 
            onLocationCommand={handleVoiceLocation}
            onSummaryRequest={handleSummaryRequest}
            data={data}
            location={selectedZone}
            voiceSettings={settings?.voiceSettings || { enabled: true, simulationMode: false }}
          />
        );
      case 'alerts':
        return (
          <div className="alerts-section">
            <h3>🚨 Active Alerts ({alerts.length})</h3>
            <div className="alert-list">
              {alerts.length > 0 ? alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  {alert.icon} {alert.message} in {alert.location}
                  <span className="alert-time">
                    {getDataFreshness(alert.timestamp).text}
                  </span>
                  <button 
                    className="alert-dismiss"
                    onClick={() => {
                      alertEngine.clearAlert(alert.id);
                      setAlerts(alertEngine.getActiveAlerts());
                    }}
                  >
                    ×
                  </button>
                </div>
              )) : (
                <div className="no-alerts">
                  🟢 No active alerts - All systems healthy
                </div>
              )}
            </div>
            
            <AlertHistory alerts={alerts} />
            
            <div className="service-status">
              <h4>📊 Service Status</h4>
              {Object.entries(serviceMetrics).map(([zone, metrics]) => (
                <div key={zone} className="service-item">
                  <span className="zone-name">{zone}</span>
                  <span className={`status-badge ${metrics.status}`}>
                    {metrics.status} ({metrics.availability}%)
                  </span>
                  <span className="last-reading">
                    {getDataFreshness(metrics.lastReading).text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      case 'settings':
        return (
          <>
            <SettingsPanel />
            <UserSettings user={user} onUpdate={() => window.location.reload()} />
            <EmailTester />
            <ReportExporter 
              data={data}
              location={selectedZone}
              alerts={alerts}
            />
          </>
        );
      default:
        return (
          <>
            <ZoneSelector 
              selectedZone={selectedZone}
              onZoneChange={handleZoneChange}
            />
            
            {settings.displayOptions.showKPITiles && (
              <KPITiles 
                data={data}
                location={selectedZone}
              />
            )}
            
            {settings.aiRecommendations.showPreferredMethods && (
              <PreferredMethods 
                data={data}
                location={selectedZone}
              />
            )}
            
            <div className="charts-section">
              <LineChart 
                data={data}
                location={selectedZone}
                dateRange={dateRange}
              />
              
              <VoiceCommand 
                onLocationCommand={handleVoiceLocation}
                onSummaryRequest={handleSummaryRequest}
                data={data}
                location={selectedZone}
                voiceSettings={settings?.voiceSettings || { enabled: true, simulationMode: false }}
              />
            </div>
            
            <TestimonialForm 
              zone={selectedZone}
              onSubmit={() => window.location.reload()}
            />
            
            <TestimonialList zone={selectedZone} />
          </>
        );
    }
  };

  return (
    <div className="app-layout">
      <Sidebar 
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <div className="main-container">
        <header className="header">
          <div className="header-content">
            <div className="header-text">
              <h1>🌱 Land ReGen Dashboard</h1>
              <h2>{selectedZone} Soil Health Monitoring</h2>
              <p>Welcome, {user?.name} ({user?.role})</p>
              <p style={{fontSize: '0.9rem', opacity: '0.8'}}>
                {new Date(dateRange.start).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })} - {new Date(dateRange.end).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
            </div>

            <button onClick={onLogout} className="logout-btn">Logout</button>
            <DataFreshness lastUpdate={lastUpdate} isLoading={loading} />
          </div>
        </header>

        <div className="main-content">
          {renderContent()}
        </div>
      </div>
      
      <SummaryCard 
        data={summaryData || data}
        location={selectedZone}
        isVisible={showSummary}
        onClose={() => setShowSummary(false)}
        summaryData={summaryData}
      />
    </div>
  );
}