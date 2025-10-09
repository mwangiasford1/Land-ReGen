import { getPreferredMethods } from './recommendationEngine';

// Summary generation engine
export const generateSummary = (data, location) => {
  if (!data || data.length === 0) return null;

  const latest = data[0];
  const previous = data[1] || latest;

  // ✅ Ensure numeric types for calculations
  const vegetationCurrent = parseFloat(latest.vegetation_index || 0);
  const vegetationPrevious = parseFloat(previous.vegetation_index || vegetationCurrent);
  const erosionCurrent = parseFloat(latest.erosion_index || 0);
  const erosionPrevious = parseFloat(previous.erosion_index || erosionCurrent);
  const moistureCurrent = parseFloat(latest.moisture_level || 0);
  const moisturePrevious = parseFloat(previous.moisture_level || moistureCurrent);

  // ✅ Calculate percentage changes
  const vegetationChange = ((vegetationCurrent - vegetationPrevious) / vegetationPrevious) * 100;
  const erosionChange = ((erosionCurrent - erosionPrevious) / erosionPrevious) * 100;
  const moistureChange = ((moistureCurrent - moisturePrevious) / moisturePrevious) * 100;

  // ✅ Flag alerts
  const alerts = [];
  if (erosionCurrent > 0.75) alerts.push('Critical erosion levels detected');
  if (vegetationCurrent < 0.4) alerts.push('Vegetation stress identified');
  if (moistureCurrent < 25) alerts.push('Low moisture content');

  // ✅ Calculate alert density
  const alertDensity = (data.filter(d =>
    parseFloat(d.erosion_index) > 0.75 ||
    parseFloat(d.vegetation_index) < 0.4 ||
    parseFloat(d.moisture_level) < 25
  ).length / data.length) * 100;

  // ✅ Generate recommendations
  const recommendations = getPreferredMethods({
    vegetation_index: vegetationCurrent,
    erosion_index: erosionCurrent,
    moisture_level: moistureCurrent,
    alert_density: alertDensity
  });

  const interventions = recommendations.methods.map(m => m.practice);

  // ✅ Generate spoken summary
  const spokenSummary = `${location} soil health update: Vegetation ${vegetationChange > 0 ? 'improved' : 'declined'} by ${Math.abs(vegetationChange.toFixed(1))}%. Erosion levels ${erosionChange > 0 ? 'increased' : 'decreased'} by ${Math.abs(erosionChange.toFixed(1))}%. ${alerts.length > 0 ? `${alerts.length} alerts active.` : 'No critical alerts.'} ${recommendations.summary}`;

  return {
    location,
    timestamp: latest.timestamp,
    metrics: {
      vegetation: { current: vegetationCurrent, change: vegetationChange },
      erosion: { current: erosionCurrent, change: erosionChange },
      moisture: { current: moistureCurrent, change: moistureChange }
    },
    alerts,
    interventions,
    spokenSummary,
    overallStatus: alerts.length > 0 ? 'warning' : 'healthy'
  };
};