import React from 'react';

const SummaryCard = ({ data, location, isVisible, onClose, summaryData }) => {
  if (!isVisible || !data || data.length === 0) return null;

  // Use provided summary data or generate from raw data
  const summary = summaryData || (() => {
    if (!data || data.length === 0) return null;
    const latest = data[0];
    const previous = data[1] || latest;
    return {
      metrics: {
        vegetation: { current: latest.vegetation_index, change: 0 },
        erosion: { current: latest.erosion_index, change: 0 },
        moisture: { current: latest.moisture_level, change: 0 }
      },
      alerts: [],
      interventions: ['Continue monitoring'],
      overallStatus: 'healthy',
      timestamp: latest.timestamp
    };
  })();

  if (!summary) return null;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'improving': return '📈';
      case 'declining': return '📉';
      default: return '➡️';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'improving': return '#4CAF50';
      case 'declining': return '#f44336';
      default: return '#FF9800';
    }
  };

  return (
    <div className="summary-overlay">
      <div className="summary-card">
        <div className="summary-header">
          <h3>🌱 Soil Health Summary - {location}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="summary-content">
          <div className="current-status">
            <h4>Current Status</h4>
            <div className="status-grid">
              <div className="status-item">
                <span className="status-label">Vegetation Index</span>
                <span className="status-value">{summary.metrics.vegetation.current.toFixed(2)}</span>
                <span 
                  className="status-change"
                  style={{ color: summary.metrics.vegetation.change > 0 ? '#4CAF50' : '#f44336' }}
                >
                  {summary.metrics.vegetation.change > 0 ? '📈' : '📉'} {Math.abs(summary.metrics.vegetation.change.toFixed(1))}%
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Erosion Index</span>
                <span className="status-value">{summary.metrics.erosion.current.toFixed(2)}</span>
                <span 
                  className="status-change"
                  style={{ color: summary.metrics.erosion.change < 0 ? '#4CAF50' : '#f44336' }}
                >
                  {summary.metrics.erosion.change > 0 ? '📈' : '📉'} {Math.abs(summary.metrics.erosion.change.toFixed(1))}%
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Moisture Level</span>
                <span className="status-value">{summary.metrics.moisture.current.toFixed(1)}%</span>
                <span 
                  className="status-change"
                  style={{ color: summary.metrics.moisture.change > 0 ? '#4CAF50' : '#f44336' }}
                >
                  {summary.metrics.moisture.change > 0 ? '📈' : '📉'} {Math.abs(summary.metrics.moisture.change.toFixed(1))}%
                </span>
              </div>
            </div>

            {summary.alerts && summary.alerts.length > 0 && (
              <div className="summary-alerts">
                <h4>⚠️ Active Alerts</h4>
                <ul>
                  {summary.alerts.map((alert, index) => (
                    <li key={index} className="alert-summary">{alert}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="recommendations">
            <h4>🎯 Recommendations</h4>
            <ul>
              {summary.interventions.map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="overall-status">
            <span className={`status-badge ${summary.overallStatus}`}>
              {summary.overallStatus === 'healthy' ? '🟢' : '🟡'} 
              {summary.overallStatus.toUpperCase()}
            </span>
          </div>

          <div className="summary-footer">
            <p>Last updated: {new Date(summary.timestamp).toLocaleString()}</p>
            {summary.spokenSummary && (
              <button 
                className="speak-btn"
                onClick={() => {
                  if ('speechSynthesis' in window) {
                    const utterance = new SpeechSynthesisUtterance(summary.spokenSummary);
                    speechSynthesis.speak(utterance);
                  }
                }}
              >
                🔊 Speak Summary
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;