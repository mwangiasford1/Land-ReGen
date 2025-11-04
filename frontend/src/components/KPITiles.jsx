import React from 'react';

const KPITiles = ({ data, location }) => {
  const calculateKPIs = () => {
    if (!data || data.length === 0) {
      return {
        serviceUnavailability: 0,
        alertDensity: 0,
        vegetationDips: 0,
        avgMoisture: 0,
        avgErosion: 0
      };
    }

    // Service Unavailability Rate (simulate based on data gaps)
    const expectedReadings = 24; // hourly readings per day
    const actualReadings = data.length;
    const serviceUnavailability = Math.max(0, ((expectedReadings - actualReadings) / expectedReadings) * 100);

    // Alert Density (count of threshold violations)
    const alerts = data.filter(d => 
      d.erosion_index > 0.75 || 
      d.vegetation_index < 0.4 || 
      d.moisture_level < 20
    );
    const alertDensity = (alerts.length / data.length) * 100;

    // Vegetation Dips (consecutive decreases)
    let vegetationDips = 0;
    for (let i = 1; i < data.length; i++) {
      if (data[i].vegetation_index < data[i-1].vegetation_index) {
        vegetationDips++;
      }
    }

    // Averages
    const avgMoisture = data.reduce((sum, d) => sum + d.moisture_level, 0) / data.length;
    const avgErosion = data.reduce((sum, d) => sum + d.erosion_index, 0) / data.length;

    return {
      serviceUnavailability: serviceUnavailability.toFixed(1),
      alertDensity: alertDensity.toFixed(1),
      vegetationDips,
      avgMoisture: avgMoisture.toFixed(1),
      avgErosion: avgErosion.toFixed(2)
    };
  };

  const kpis = calculateKPIs();

  const KPICard = ({ title, value, unit, threshold, icon, type }) => {
    const isAlert = threshold && (
      (type === 'unavailability' && parseFloat(value) > threshold) ||
      (type === 'alerts' && parseFloat(value) > threshold) ||
      (type === 'dips' && parseInt(value) > threshold)
    );

    return (
      <div className={`kpi-card ${isAlert ? 'alert' : ''}`}>
        <div className="kpi-header">
          <span className="kpi-icon">{icon}</span>
          <span className="kpi-title">{title}</span>
        </div>
        <div className="kpi-value">
          {value}{unit}
        </div>
        {isAlert && (
          <div className="kpi-alert">
            ⚠️ Threshold exceeded
          </div>
        )}
        <div className="kpi-location">
          📍 {location}
        </div>
      </div>
    );
  };

  return (
    <div className="kpi-tiles">
      <h3>Key Performance Indicators</h3>
      <div className="kpi-grid">
        <KPICard
          title="Service Unavailability"
          value={kpis.serviceUnavailability}
          unit="%"
          threshold={5}
          icon="🔴"
          type="unavailability"
        />
        <KPICard
          title="Alert Density"
          value={kpis.alertDensity}
          unit="%"
          threshold={20}
          icon="⚠️"
          type="alerts"
        />
        <KPICard
          title="Vegetation Dips"
          value={kpis.vegetationDips}
          unit=""
          threshold={5}
          icon="📉"
          type="dips"
        />
        <KPICard
          title="Avg Moisture"
          value={kpis.avgMoisture}
          unit="%"
          icon="💧"
        />
        <KPICard
          title="Avg Erosion"
          value={kpis.avgErosion}
          unit=""
          icon="🌊"
        />
      </div>
    </div>
  );
};

export default KPITiles;