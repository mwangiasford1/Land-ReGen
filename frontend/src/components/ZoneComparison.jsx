import React from 'react';

const ZoneComparison = ({ allZoneData }) => {
  const zones = ['Murang\'a', 'Kiambu', 'Thika', 'Nyeri'];
  
  const getZoneMetrics = (zoneName) => {
    const data = allZoneData[zoneName] || [];
    if (data.length === 0) return { vegetation: 0, erosion: 0, moisture: 0, alerts: 0 };
    
    const latest = data[0];
    const alerts = data.filter(d => d.erosion_index > 0.75 || d.vegetation_index < 0.4).length;
    
    return {
      vegetation: latest.vegetation_index,
      erosion: latest.erosion_index,
      moisture: latest.moisture_level,
      alerts: (alerts / data.length * 100).toFixed(1)
    };
  };

  const getStatusColor = (value, metric) => {
    if (metric === 'vegetation') return value > 0.6 ? '#4CAF50' : value > 0.4 ? '#FF9800' : '#f44336';
    if (metric === 'erosion') return value < 0.5 ? '#4CAF50' : value < 0.75 ? '#FF9800' : '#f44336';
    if (metric === 'moisture') return value > 40 ? '#4CAF50' : value > 25 ? '#FF9800' : '#f44336';
    return '#718096';
  };

  return (
    <div className="zone-comparison">
      <h3>🌍 Multi-Zone Comparison</h3>
      
      <div className="comparison-grid">
        <div className="metric-header">Zone</div>
        <div className="metric-header">Vegetation</div>
        <div className="metric-header">Erosion</div>
        <div className="metric-header">Moisture</div>
        <div className="metric-header">Alert %</div>
        
        {zones.map(zone => {
          const metrics = getZoneMetrics(zone);
          return (
            <React.Fragment key={zone}>
              <div className="zone-name">{zone}</div>
              <div 
                className="metric-value"
                style={{ color: getStatusColor(metrics.vegetation, 'vegetation') }}
              >
                {metrics.vegetation.toFixed(2)}
              </div>
              <div 
                className="metric-value"
                style={{ color: getStatusColor(metrics.erosion, 'erosion') }}
              >
                {metrics.erosion.toFixed(2)}
              </div>
              <div 
                className="metric-value"
                style={{ color: getStatusColor(metrics.moisture, 'moisture') }}
              >
                {metrics.moisture.toFixed(1)}%
              </div>
              <div className="metric-value alert-percentage">
                {metrics.alerts}%
              </div>
            </React.Fragment>
          );
        })}
      </div>
      
      <div className="priority-zones">
        <h4>🎯 Priority Interventions</h4>
        {zones.map(zone => {
          const metrics = getZoneMetrics(zone);
          const priority = [];
          
          if (metrics.vegetation < 0.4) priority.push('Vegetation restoration');
          if (metrics.erosion > 0.75) priority.push('Erosion control');
          if (metrics.moisture < 25) priority.push('Irrigation support');
          
          return priority.length > 0 ? (
            <div key={zone} className="priority-item">
              <strong>{zone}:</strong> {priority.join(', ')}
            </div>
          ) : null;
        })}
      </div>
    </div>
  );
};

export default ZoneComparison;