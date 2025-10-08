import React from 'react';

export default function KPITile({ title, icon, value, previousValue, unit = '', threshold, type }) {
  const calculateChange = () => {
    if (!previousValue) return 0;
    return Math.round(((value - previousValue) / previousValue) * 100);
  };

  const getTrendIcon = () => {
    const change = calculateChange();
    return change > 0 ? '📈' : change < 0 ? '📉' : '➡️';
  };

  const getTrendClass = () => {
    const change = calculateChange();
    if (type === 'erosion') {
      return change > 0 ? 'trend-bad' : 'trend-good';
    }
    return change > 0 ? 'trend-good' : 'trend-bad';
  };

  const isAlert = threshold && value > threshold;
  const change = calculateChange();

  return (
    <div className={`kpi-tile ${isAlert ? 'tile-alert' : ''}`}>
      <div className="tile-header">
        <span className="tile-title">{icon} {title}</span>
        {isAlert && <span className="alert-badge">⚠️ ALERT</span>}
      </div>
      
      <div className="metric-value">
        {typeof value === 'number' ? value.toFixed(2) : value}{unit}
      </div>
      
      {previousValue && (
        <div className={`trend ${getTrendClass()}`}>
          <span className={`status-indicator ${
            isAlert ? 'status-critical' : 
            change > 0 && type === 'vegetation' ? 'status-good' : 
            change < 0 && type === 'erosion' ? 'status-good' : 
            'status-warning'
          }`}></span>
          {getTrendIcon()} {Math.abs(change)}% from previous
        </div>
      )}
      
      {previousValue && (
        <div className="previous-value">
          Previous: {previousValue.toFixed(2)}{unit}
        </div>
      )}
      
      {isAlert && (
        <div className="alert-message">
          Alert threshold exceeded ({threshold}{unit})
        </div>
      )}
      
      {type === 'vegetation' && change < -5 && (
        <div className="insight">
          🔍 Early signs of vegetation stress
        </div>
      )}
    </div>
  );
}