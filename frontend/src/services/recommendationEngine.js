// Regenerative agriculture recommendation engine
export const getPreferredMethods = ({ vegetation_index, erosion_index, moisture_level, alert_density = 0 }) => {
  const methods = [];
  const urgency = [];

  // Vegetation restoration recommendations
  if (vegetation_index < 0.4) {
    methods.push({
      category: 'Vegetation Recovery',
      practice: 'Emergency reforestation with native species',
      urgency: 'critical',
      timeline: '1-2 weeks',
      icon: '🌳'
    });
    urgency.push('critical');
  } else if (vegetation_index < 0.6) {
    methods.push({
      category: 'Vegetation Enhancement',
      practice: 'Apply cover crops and compost application',
      urgency: 'high',
      timeline: '2-4 weeks',
      icon: '🌱'
    });
    urgency.push('high');
  }

  // Erosion control recommendations
  if (erosion_index > 0.8) {
    methods.push({
      category: 'Erosion Control',
      practice: 'Install check dams and emergency terracing',
      urgency: 'critical',
      timeline: '1 week',
      icon: '🏔️'
    });
    urgency.push('critical');
  } else if (erosion_index > 0.75) {
    methods.push({
      category: 'Erosion Prevention',
      practice: 'Initiate terracing and grass strip installation',
      urgency: 'high',
      timeline: '2-3 weeks',
      icon: '🌾'
    });
    urgency.push('high');
  }

  // Moisture management recommendations
  if (moisture_level < 25) {
    methods.push({
      category: 'Water Conservation',
      practice: 'Emergency irrigation and mulch application',
      urgency: 'critical',
      timeline: '3-5 days',
      icon: '💧'
    });
    urgency.push('critical');
  } else if (moisture_level < 35) {
    methods.push({
      category: 'Moisture Retention',
      practice: 'Install drip irrigation and organic mulching',
      urgency: 'medium',
      timeline: '1-2 weeks',
      icon: '🌿'
    });
    urgency.push('medium');
  }

  // Alert density recommendations
  if (alert_density > 50) {
    methods.push({
      category: 'System Monitoring',
      practice: 'Conduct zone-wide audit and community mobilization',
      urgency: 'high',
      timeline: '1 week',
      icon: '🔍'
    });
    urgency.push('high');
  }

  // Determine overall priority
  let overallUrgency;
  if (urgency.includes('critical')) {
    overallUrgency = 'critical';
  } else if (urgency.includes('high')) {
    overallUrgency = 'high';
  } else if (urgency.includes('medium')) {
    overallUrgency = 'medium';
  } else {
    overallUrgency = 'low';
  }

  // Default recommendation if no issues
  if (methods.length === 0) {
    methods.push({
      category: 'Maintenance',
      practice: 'Continue current soil management practices',
      urgency: 'low',
      timeline: 'Ongoing',
      icon: '✅'
    });
  }

  return {
    methods,
    overallUrgency,
    totalRecommendations: methods.length,
    summary: generateMethodSummary(methods, overallUrgency)
  };
};

const generateMethodSummary = (methods, urgency) => {
  const practices = methods.map(m => m.practice.toLowerCase()).join(', ');
  let urgencyText;

  if (urgency === 'critical') {
    urgencyText = 'immediate action required';
  } else if (urgency === 'high') {
    urgencyText = 'action needed within 2 weeks';
  } else if (urgency === 'medium') {
    urgencyText = 'action recommended within a month';
  } else {
    urgencyText = 'monitoring and maintenance';
  }

  return `${methods.length} regenerative practice${methods.length > 1 ? 's' : ''} recommended: ${practices}. Priority level: ${urgencyText}.`;
};

// Cost estimation for practices
export const estimateCosts = (methods) => {
  const costMap = {
    'Emergency reforestation': { min: 500, max: 1500, unit: 'USD per hectare' },
    'Apply cover crops': { min: 100, max: 300, unit: 'USD per hectare' },
    'Install check dams': { min: 200, max: 800, unit: 'USD per dam' },
    'Initiate terracing': { min: 300, max: 1000, unit: 'USD per hectare' },
    'Emergency irrigation': { min: 150, max: 500, unit: 'USD per hectare' },
    'Install drip irrigation': { min: 400, max: 1200, unit: 'USD per hectare' }
  };

  return methods.map(method => {
    const key = Object.keys(costMap).find(k => method.practice.includes(k.split(' ')[1]));
    return {
      ...method,
      cost: key ? costMap[key] : { min: 50, max: 200, unit: 'USD per hectare' }
    };
  });
};