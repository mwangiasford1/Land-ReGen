import React, { useState, useEffect } from 'react';

const DataFreshness = ({ lastUpdate, isLoading }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000); // Update every 30 seconds
    return () => clearInterval(timer);
  }, []);

  const getFreshnessInfo = () => {
    if (!lastUpdate) return { status: 'unknown', text: 'No data', color: '#9E9E9E' };
    
    const updateTime = new Date(lastUpdate);
    const diffMinutes = (currentTime - updateTime) / (1000 * 60);
    
    if (diffMinutes < 5) return { status: 'fresh', text: 'Just updated', color: '#4CAF50' };
    if (diffMinutes < 30) return { status: 'recent', text: `${Math.floor(diffMinutes)}m ago`, color: '#4CAF50' };
    if (diffMinutes < 120) return { status: 'stale', text: `${Math.floor(diffMinutes)}m ago`, color: '#FF9800' };
    if (diffMinutes < 1440) return { status: 'old', text: `${Math.floor(diffMinutes / 60)}h ago`, color: '#f44336' };
    return { status: 'very_old', text: `${Math.floor(diffMinutes / 1440)}d ago`, color: '#9E9E9E' };
  };

  const freshness = getFreshnessInfo();

  return (
    <div className="data-freshness">
      <div className="freshness-indicator">
        <span 
          className={`freshness-dot ${freshness.status}`}
          style={{ backgroundColor: freshness.color }}
        ></span>
        <span className="freshness-text">
          {isLoading ? ' Updating...' : ` ${freshness.text}`}
        </span>
      </div>
      {lastUpdate && (
        <div className="last-sync">
          Last sync: {new Date(lastUpdate).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default DataFreshness;