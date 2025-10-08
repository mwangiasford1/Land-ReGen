import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

const ExperienceList = ({ selectedZone }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchExperiences();
  }, [selectedZone]);

  const fetchExperiences = async () => {
    try {
      const url = selectedZone 
        ? `${API_BASE_URL}/testimonials?zone=${selectedZone}`
        : `${API_BASE_URL}/testimonials`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setExperiences(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperiences = experiences.filter(exp => 
    filter === 'all' || exp.category === filter
  );

  const getCategoryIcon = (category) => {
    const icons = {
      soil_improvement: '🌱',
      erosion_control: '🛡️',
      water_management: '💧',
      crop_rotation: '🔄',
      organic_farming: '🌿',
      technology_use: '📱'
    };
    return icons[category] || '📝';
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) return <div>Loading experiences...</div>;

  return (
    <div className="experience-list">
      <div className="list-header">
        <h3>🌟 Community Experiences</h3>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Categories</option>
          <option value="soil_improvement">🌱 Soil Improvement</option>
          <option value="erosion_control">🛡️ Erosion Control</option>
          <option value="water_management">💧 Water Management</option>
          <option value="crop_rotation">🔄 Crop Rotation</option>
          <option value="organic_farming">🌿 Organic Farming</option>
          <option value="technology_use">📱 Technology Use</option>
        </select>
      </div>

      {filteredExperiences.length === 0 ? (
        <div className="no-experiences">
          <p>No experiences shared yet for this category.</p>
          <p>Be the first to share your story! 🚀</p>
        </div>
      ) : (
        <div className="experiences-grid">
          {filteredExperiences.map(exp => (
            <div key={exp.id} className="experience-card">
              <div className="card-header">
                <div className="category-badge">
                  {getCategoryIcon(exp.category)} {exp.category?.replace('_', ' ')}
                </div>
                <div className="rating">
                  {renderStars(exp.rating)}
                </div>
              </div>
              
              <h4 className="experience-title">{exp.title}</h4>
              
              <div className="experience-meta">
                <span className="zone">📍 {exp.zone}</span>
                <span className="time-period">⏱️ {exp.time_period}</span>
                {exp.would_recommend && <span className="recommended">✅ Recommended</span>}
              </div>

              {exp.practices_used && (
                <div className="practices-used">
                  <strong>Practices:</strong>
                  <div className="practice-tags">
                    {JSON.parse(exp.practices_used).map(practice => (
                      <span key={practice} className="practice-tag">{practice}</span>
                    ))}
                  </div>
                </div>
              )}

              <p className="experience-comment">{exp.comment}</p>

              {exp.results_achieved && (
                <div className="results">
                  <strong>📈 Results:</strong>
                  <p>{exp.results_achieved}</p>
                </div>
              )}

              <div className="card-footer">
                <span className="author">👤 {exp.users?.name || 'Anonymous'}</span>
                <span className="date">{new Date(exp.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExperienceList;