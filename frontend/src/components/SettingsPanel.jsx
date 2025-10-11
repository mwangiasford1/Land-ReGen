import React, { useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';

const SettingsPanel = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [activeTab, setActiveTab] = useState('general');

  const tabs = [
    { id: 'general', label: '🌍 General', icon: '🌍' },
    { id: 'alerts', label: '🔔 Alerts', icon: '🔔' },
    { id: 'voice', label: '🎤 Voice', icon: '🎤' },
    { id: 'display', label: '📊 Display', icon: '📊' },
    { id: 'data', label: '📦 Data', icon: '📦' },
    { id: 'ai', label: '🧠 AI', icon: '🧠' }
  ];

  const handleSettingChange = (category, key, value) => {
    updateSettings({
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
  };

  const handleDirectChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const renderGeneralTab = () => (
    <div className="settings-tab">
      <div className="setting-group">
        <h4>👤 User Role</h4>
        <select 
          value={settings.userRole} 
          onChange={(e) => handleDirectChange('userRole', e.target.value)}
        >
          <option value="field-agent">Field Agent (Read-only)</option>
          <option value="analyst">Analyst (Full Access)</option>
          <option value="admin">Admin (Configuration)</option>
        </select>
      </div>

      <div className="setting-group">
        <h4>🌍 Language & Region</h4>
        <div className="setting-row">
          <label>Language:</label>
          <select className="language-select"
            value={settings.language} 
            onChange={(e) => handleDirectChange('language', e.target.value)}
          >
            <option value="english">English</option>
            <option value="kiswahili">Kiswahili</option>
            <option value="kikuyu">Kikuyu</option>
          </select>
        </div>
        <div className="setting-row">
          <label>Default Zone:</label>
          <select 
            value={settings.defaultZone} 
            onChange={(e) => handleDirectChange('defaultZone', e.target.value)}
          >
            <option value="Murang'a">Murang'a</option>
            <option value="Kiambu">Kiambu</option>
            <option value="Thika">Thika</option>
            <option value="Nyeri">Nyeri</option>
          </select>
        </div>
        <div className="setting-row">
          <label>Units:</label>
          <select 
            value={settings.units} 
            onChange={(e) => handleDirectChange('units', e.target.value)}
          >
            <option value="metric">Metric</option>
            <option value="imperial">Imperial</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAlertsTab = () => (
    <div className="settings-tab">
      <div className="setting-group">
        <h4>⚠️ Alert Thresholds</h4>
        <div className="setting-row">
          <label>Vegetation Index Alert (&lt;):</label>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={settings.alertThresholds.vegetation}
            onChange={(e) => handleSettingChange('alertThresholds', 'vegetation', parseFloat(e.target.value))}
          />
          <span>{settings.alertThresholds.vegetation}</span>
        </div>
        <div className="setting-row">
          <label>Erosion Index Alert (&gt;):</label>
          <input 
            type="range" 
            min="0" 
            max="2" 
            step="0.05" 
            value={settings.alertThresholds.erosion}
            onChange={(e) => handleSettingChange('alertThresholds', 'erosion', parseFloat(e.target.value))}
          />
          <span>{settings.alertThresholds.erosion}</span>
        </div>
        <div className="setting-row">
          <label>Moisture Level Alert (&lt;%):</label>
          <input 
            type="range" 
            min="0" 
            max="50" 
            step="5" 
            value={settings.alertThresholds.moisture}
            onChange={(e) => handleSettingChange('alertThresholds', 'moisture', parseInt(e.target.value))}
          />
          <span>{settings.alertThresholds.moisture}%</span>
        </div>
      </div>

      <div className="setting-group">
        <h4>🔔 Alert Types</h4>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={settings.alertTypes.visual}
              onChange={(e) => handleSettingChange('alertTypes', 'visual', e.target.checked)}
            />
            Visual Alerts
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={settings.alertTypes.voice}
              onChange={(e) => handleSettingChange('alertTypes', 'voice', e.target.checked)}
            />
            Voice Alerts
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={settings.alertTypes.email}
              onChange={(e) => handleSettingChange('alertTypes', 'email', e.target.checked)}
            />
            Email Alerts
          </label>
        </div>
      </div>
    </div>
  );

  const renderVoiceTab = () => (
    <div className="settings-tab">
      <div className="setting-group">
        <h4>🎤 Voice Recognition</h4>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={settings.voiceSettings.enabled}
              onChange={(e) => handleSettingChange('voiceSettings', 'enabled', e.target.checked)}
            />
            Enable Voice Commands
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={settings.voiceSettings.simulationMode}
              onChange={(e) => handleSettingChange('voiceSettings', 'simulationMode', e.target.checked)}
            />
            Simulation Mode (Offline)
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h4>🔊 Voice Synthesis</h4>
        <select 
          value={settings.voiceSettings.synthesis} 
          onChange={(e) => handleSettingChange('voiceSettings', 'synthesis', e.target.value)}
        >
          <option value="calm">Calm & Professional</option>
          <option value="assertive">Assertive & Clear</option>
          <option value="friendly">Friendly & Casual</option>
        </select>
      </div>
    </div>
  );

  const renderDisplayTab = () => (
    <div className="settings-tab">
      <div className="setting-group">
        <h4>📊 Chart Options</h4>
        <select 
          value={settings.displayOptions.chartType} 
          onChange={(e) => handleSettingChange('displayOptions', 'chartType', e.target.value)}
        >
          <option value="line">Line Charts</option>
          <option value="bar">Bar Charts</option>
          <option value="area">Area Charts</option>
        </select>
      </div>

      <div className="setting-group">
        <h4>🎛️ Dashboard Layout</h4>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={settings.displayOptions.showKPITiles}
              onChange={(e) => handleSettingChange('displayOptions', 'showKPITiles', e.target.checked)}
            />
            Show KPI Tiles
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={settings.displayOptions.compactMode}
              onChange={(e) => handleSettingChange('displayOptions', 'compactMode', e.target.checked)}
            />
            Compact Mode (Mobile)
          </label>
        </div>
      </div>
    </div>
  );

  const renderDataTab = () => (
    <div className="settings-tab">
      <div className="setting-group">
        <h4>🔄 Data Sync</h4>
        <select 
          value={settings.dataSync.frequency} 
          onChange={(e) => handleSettingChange('dataSync', 'frequency', e.target.value)}
        >
          <option value="manual">Manual Only</option>
          <option value="hourly">Every Hour</option>
          <option value="daily">Daily</option>
          <option value="realtime">Real-time</option>
        </select>
      </div>

      <div className="setting-group">
        <h4>📄 Export Format</h4>
        <select 
          value={settings.dataSync.exportFormat} 
          onChange={(e) => handleSettingChange('dataSync', 'exportFormat', e.target.value)}
        >
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
          <option value="excel">Excel</option>
        </select>
      </div>

      <div className="setting-group">
        <h4>🛠️ Data Actions</h4>
        <button 
          className="action-btn"
          onClick={() => {
            window.location.reload();
          }}
        >
          🔄 Manual Refresh
        </button>
        <button 
          className="action-btn"
          onClick={() => {
            localStorage.clear();
            alert('Cache cleared successfully!');
          }}
        >
          🗑️ Clear Cache
        </button>
      </div>
    </div>
  );

  const renderAITab = () => (
    <div className="settings-tab">
      <div className="setting-group">
        <h4>🧠 AI Recommendations</h4>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={settings.aiRecommendations.enabled}
              onChange={(e) => handleSettingChange('aiRecommendations', 'enabled', e.target.checked)}
            />
            Enable AI Suggestions
          </label>
          <label>
            <input 
              type="checkbox" 
              checked={settings.aiRecommendations.showPreferredMethods}
              onChange={(e) => handleSettingChange('aiRecommendations', 'showPreferredMethods', e.target.checked)}
            />
            Show Preferred Methods
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h4>🔧 Developer Tools</h4>
        <div className="checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={settings.developerMode}
              onChange={(e) => handleDirectChange('developerMode', e.target.checked)}
            />
            Developer Mode
          </label>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general': return renderGeneralTab();
      case 'alerts': return renderAlertsTab();
      case 'voice': return renderVoiceTab();
      case 'display': return renderDisplayTab();
      case 'data': return renderDataTab();
      case 'ai': return renderAITab();
      default: return renderGeneralTab();
    }
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>⚙️ Settings</h3>
        <button className="reset-btn" onClick={resetSettings}>
          🔄 Reset All
        </button>
      </div>

      <div className="settings-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="settings-content">
        {renderTabContent()}
      </div>

      <div className="settings-footer">
        <p>Settings are automatically saved locally</p>
      </div>
    </div>
  );
};

export default SettingsPanel;