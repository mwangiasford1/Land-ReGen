import React, { useState } from 'react';

const AlertHistory = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sortedAlerts = [...alerts].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diffMinutes = (now - alertTime) / (1000 * 60);
    
    if (diffMinutes < 60) return `${Math.floor(diffMinutes)}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  return (
    <div className="alert-history">
      <div className="history-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4> Alert History ({alerts.length})</h4>
        <span className="expand-icon">{isExpanded ? '▼' : '▶'}</span>
      </div>
      
      {isExpanded && (
        <div className="history-timeline">
          {sortedAlerts.length > 0 ? sortedAlerts.map(alert => (
            <div key={alert.id} className={`timeline-item ${alert.type}`}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="alert-header">
                  <span className="alert-icon">{alert.icon}</span>
                  <span className="alert-location">{alert.location}</span>
                  <span className="alert-time">{getTimeAgo(alert.timestamp)}</span>
                </div>
                <div className="alert-message">{alert.message}</div>
                <div className="alert-value">Value: {alert.value}</div>
              </div>
            </div>
          )) : (
            <div className="no-history">
               No alert history available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlertHistory;