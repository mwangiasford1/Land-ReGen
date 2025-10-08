// Real-time alert monitoring
export class AlertEngine {
  constructor() {
    this.alerts = [];
    this.thresholds = {
      erosion_critical: 0.75,
      vegetation_low: 0.4,
      moisture_low: 25
    };
  }

  updateThresholds(newThresholds) {
    this.thresholds = { ...this.thresholds, ...newThresholds };
  }

  checkAlerts(data, location) {
    if (!data || data.length === 0) return [];

    const latest = data[0];
    const newAlerts = [];

    // Erosion alert
    if (latest.erosion_index > this.thresholds.erosion_critical) {
      newAlerts.push({
        id: `erosion_${location}_${Date.now()}`,
        type: 'critical',
        location,
        message: `Erosion index exceeded ${this.thresholds.erosion_critical}`,
        value: latest.erosion_index,
        timestamp: latest.timestamp,
        icon: '🔴'
      });
    }

    // Vegetation alert
    if (latest.vegetation_index < this.thresholds.vegetation_low) {
      newAlerts.push({
        id: `vegetation_${location}_${Date.now()}`,
        type: 'warning',
        location,
        message: `Vegetation index below ${this.thresholds.vegetation_low}`,
        value: latest.vegetation_index,
        timestamp: latest.timestamp,
        icon: '🟡'
      });
    }

    // Moisture alert
    if (latest.moisture_level < this.thresholds.moisture_low) {
      newAlerts.push({
        id: `moisture_${location}_${Date.now()}`,
        type: 'warning',
        location,
        message: `Moisture level below ${this.thresholds.moisture_low}%`,
        value: latest.moisture_level,
        timestamp: latest.timestamp,
        icon: '🟡'
      });
    }

    // Update alerts array
    this.alerts = [...this.alerts.filter(a => a.location !== location), ...newAlerts];
    return newAlerts;
  }

  getActiveAlerts() {
    return this.alerts.filter(alert => {
      const alertTime = new Date(alert.timestamp);
      const now = new Date();
      const hoursDiff = (now - alertTime) / (1000 * 60 * 60);
      return hoursDiff < 24; // Keep alerts for 24 hours
    });
  }

  clearAlert(alertId) {
    this.alerts = this.alerts.filter(alert => alert.id !== alertId);
  }
}

export const alertEngine = new AlertEngine();