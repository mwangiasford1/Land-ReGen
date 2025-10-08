// Service availability monitoring
export const calculateServiceMetrics = (data, location, expectedInterval = 60) => {
  if (!data || data.length === 0) {
    return {
      availability: 0,
      unavailabilityRate: 100,
      missedReadings: 0,
      lastReading: null,
      status: 'offline'
    };
  }

  // Calculate expected readings in the last 24 hours
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const expectedReadings = (24 * 60) / expectedInterval; // readings per day

  // Filter data from last 24 hours
  const recentData = data.filter(d => new Date(d.timestamp) >= yesterday);
  const actualReadings = recentData.length;

  // Calculate availability
  const availability = Math.min((actualReadings / expectedReadings) * 100, 100);
  const unavailabilityRate = 100 - availability;

  // Determine status
  let status = 'online';
  if (availability < 50) status = 'offline';
  else if (availability < 80) status = 'degraded';

  // Check data freshness
  const lastReading = new Date(data[0].timestamp);
  const minutesSinceLastReading = (now - lastReading) / (1000 * 60);

  return {
    availability: availability.toFixed(1),
    unavailabilityRate: unavailabilityRate.toFixed(1),
    missedReadings: Math.max(0, expectedReadings - actualReadings),
    lastReading: lastReading.toISOString(),
    minutesSinceLastReading: Math.floor(minutesSinceLastReading),
    status,
    location
  };
};

export const getDataFreshness = (timestamp) => {
  const now = new Date();
  const dataTime = new Date(timestamp);
  const diffMinutes = (now - dataTime) / (1000 * 60);

  if (diffMinutes < 5) return { status: 'fresh', text: 'Just now', color: '#4CAF50' };
  if (diffMinutes < 60) return { status: 'recent', text: `${Math.floor(diffMinutes)}m ago`, color: '#FF9800' };
  if (diffMinutes < 1440) return { status: 'stale', text: `${Math.floor(diffMinutes / 60)}h ago`, color: '#f44336' };
  return { status: 'old', text: `${Math.floor(diffMinutes / 1440)}d ago`, color: '#9E9E9E' };
};