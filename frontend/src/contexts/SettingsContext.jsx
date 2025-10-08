import React, { createContext, useContext, useState, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('landRegenSettings');
    return saved ? JSON.parse(saved) : {
      userRole: 'analyst',
      language: 'english',
      defaultZone: 'Murang\'a',
      units: 'metric',
      alertThresholds: {
        vegetation: 0.4,
        erosion: 0.75,
        moisture: 25
      },
      alertTypes: {
        visual: true,
        voice: true,
        email: false
      },
      voiceSettings: {
        enabled: true,
        synthesis: 'calm',
        simulationMode: false
      },
      displayOptions: {
        chartType: 'line',
        showKPITiles: true,
        compactMode: false
      },
      dataSync: {
        frequency: 'hourly',
        exportFormat: 'csv'
      },
      aiRecommendations: {
        enabled: true,
        showPreferredMethods: true
      },
      developerMode: false
    };
  });

  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('landRegenSettings', JSON.stringify(updated));
      return updated;
    });
  };

  const resetSettings = () => {
    localStorage.removeItem('landRegenSettings');
    window.location.reload();
  };

  useEffect(() => {
    localStorage.setItem('landRegenSettings', JSON.stringify(settings));
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};