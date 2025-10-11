import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { getPreferredMethods, estimateCosts } from '../services/recommendationEngine';

const PreferredMethods = ({ data, location }) => {
  const [showCosts, setShowCosts] = useState(false);
  
  if (!data || data.length === 0) {
    return (
      <div className="preferred-methods">
        <h3>🌱 Preferred Methods</h3>
        <p>No data available for recommendations</p>
      </div>
    );
  }

  const latest = data[0];
  const alertDensity = data.filter(d => 
    d.erosion_index > 0.75 || d.vegetation_index < 0.4 || d.moisture_level < 25
  ).length / data.length * 100;

  const recommendations = getPreferredMethods({
    vegetation_index: latest.vegetation_index,
    erosion_index: latest.erosion_index,
    moisture_level: latest.moisture_level,
    alert_density: alertDensity
  });

  const methodsWithCosts = estimateCosts(recommendations.methods);

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return '#f44336';
      case 'high': return '#FF9800';
      case 'medium': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  const getUrgencyIcon = (urgency) => {
    switch (urgency) {
      case 'critical': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📋';
      default: return '✅';
    }
  };

  return (
    <div className="preferred-methods">
      <div className="methods-header">
        <h3>🌱 Preferred Methods - {location}</h3>
        <div className="urgency-badge" style={{ backgroundColor: getUrgencyColor(recommendations.overallUrgency) }}>
          {getUrgencyIcon(recommendations.overallUrgency)} {recommendations.overallUrgency.toUpperCase()}
        </div>
      </div>

      <div className="methods-summary">
        <p>{recommendations.summary}</p>
      </div>

      <div className="methods-grid">
        {methodsWithCosts.map((method) => (
          <div key={`${method.category}-${method.practice}-${method.timeline}`} className={`method-card ${method.urgency}`}>
            <div className="method-header">
              <span className="method-icon">{method.icon}</span>
              <div className="method-info">
                <h4>{method.category}</h4>
                <span className="method-timeline">⏱️ {method.timeline}</span>
              </div>
              <span 
                className="urgency-indicator"
                style={{ color: getUrgencyColor(method.urgency) }}
              >
                {getUrgencyIcon(method.urgency)}
              </span>
            </div>
            
            <div className="method-practice">
              {method.practice}
            </div>
            
            {showCosts && (
              <div className="method-cost">
                💰 ${method.cost.min}-${method.cost.max} {method.cost.unit}
              </div>
            )}
            
            <div className="method-actions">
              <button 
                className="action-btn primary"
                onClick={() => {
                  const plan = `Action Plan for ${location}:\n\nPractice: ${method.practice}\nUrgency: ${method.urgency}\nTimeline: ${method.timeline}\nCategory: ${method.category}`;
                  navigator.clipboard.writeText(plan).then(() => {
                    alert('Action plan copied to clipboard!');
                  });
                }}
              >
                📋 Create Action Plan
              </button>
              <button 
                className="action-btn secondary"
                onClick={() => {
                  const subject = `Expert Consultation - ${method.category}`;
                  const body = `I need expert advice for: ${method.practice} in ${location}. Urgency: ${method.urgency}`;
                  window.open(`mailto:mwangiasford12@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                }}
              >
                📞 Contact Expert
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="methods-footer">
        <button 
          className="toggle-costs-btn"
          onClick={() => setShowCosts(!showCosts)}
        >
          {showCosts ? '🙈 Hide Costs' : '💰 Show Cost Estimates'}
        </button>
        
        <button 
          className="export-plan-btn"
          onClick={() => {
            const plan = methodsWithCosts.map((method, i) => 
              `${i + 1}. ${method.practice}\n   Category: ${method.category}\n   Urgency: ${method.urgency}\n   Timeline: ${method.timeline}\n   Cost: $${method.cost.min}-${method.cost.max} ${method.cost.unit}\n`
            ).join('\n');
            
            const fullPlan = `LAND REGEN ACTION PLAN - ${location}\n${'='.repeat(40)}\n\n${plan}\nGenerated: ${new Date().toLocaleString()}`;
            
            const blob = new Blob([fullPlan], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `action-plan-${location}-${new Date().toISOString().split('T')[0]}.txt`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
          }}
        >
          📄 Export Action Plan
        </button>
        
        <button 
          className="voice-methods-btn"
          onClick={() => {
            if ('speechSynthesis' in window) {
              const utterance = new SpeechSynthesisUtterance(
                `Recommended practices for ${location}: ${recommendations.methods.map(m => m.practice).join('. ')}`
              );
              speechSynthesis.speak(utterance);
            }
          }}
        >
          🔊 Speak Recommendations
        </button>
      </div>
    </div>
  );
};

PreferredMethods.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      vegetation_index: PropTypes.number.isRequired,
      erosion_index: PropTypes.number.isRequired,
      moisture_level: PropTypes.number.isRequired,
    })
  ).isRequired,
  location: PropTypes.string.isRequired,
};

export default PreferredMethods;