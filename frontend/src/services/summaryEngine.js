import { getPreferredMethods } from './recommendationEngine';

// Summary generation engine
export const generateSummary = (data, location) => {
  if (!data || data.length === 0) return null;

  const latest = data[0];
  const previous = data[1] || latest;

  // Calculate percentage changes
  const vegetationChange = ((latest.vegetation_index - previous.vegetation_index) / previous.vegetation_index) * 100;
  const erosionChange = ((latest.erosion_index - previous.erosion_index) / previous.erosion_index) * 100;
  const moistureChange = ((latest.moisture_level - previous.moisture_level) / previous.moisture_level) * 100;

  const vegetationDelta = Number(Math.abs(vegetationChange.toFixed(1)));
  const erosionDelta = Number(Math.abs(erosionChange.toFixed(1)));

  // Flag alerts
  const alerts = [];
  if (latest.erosion_index > 0.75) alerts.push('Critical erosion levels detected');
  if (latest.vegetation_index < 0.4) alerts.push('Vegetation stress identified');
  if (latest.moisture_level < 25) alerts.push('Low moisture content');

  // Generate preferred methods using recommendation engine
  const alertDensity = (data.filter(d =>
    d.erosion_index > 0.75 || d.vegetation_index < 0.4 || d.moisture_level < 25
  ).length / data.length) * 100;

  const recommendations = getPreferredMethods({
    vegetation_index: latest.vegetation_index,
    erosion_index: latest.erosion_index,
    moisture_level: latest.moisture_level,
    alert_density: alertDensity
  });

  const interventions = recommendations.methods.map(m => m.practice);

  // Spoken summary
  let vegetationTrend = vegetationChange > 0 ? 'improved' : 'declined';
  let erosionTrend = erosionChange > 0 ? 'increased' : 'decreased';
  let alertText = alerts.length > 0 ? `${alerts.length} alerts active.` : 'No critical alerts.';
  let priorityText = recommendations.summary;

  const spokenSummary = `${location} soil health update: Vegetation ${vegetationTrend} by ${vegetationDelta}%. Erosion levels ${erosionTrend} by ${erosionDelta}%. ${alertText} ${priorityText}`;

  return {
    location,
    timestamp: latest.timestamp,
    metrics: {
      vegetation: { current: latest.vegetation_index, change: vegetationChange },
      erosion: { current: latest.erosion_index, change: erosionChange },
      moisture: { current: latest.moisture_level, change: moistureChange }
    },
    alerts,
    interventions,
    spokenSummary,
    overallStatus: alerts.length > 0 ? 'warning' : 'healthy'
  };
};