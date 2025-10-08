import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import { sanitizeInput } from '../utils/security';

const ExperienceForm = ({ user, onSuccess }) => {
  const [formData, setFormData] = useState({
    zone: user?.preferred_zone || 'Murang\'a',
    category: 'soil_improvement',
    rating: 5,
    title: '',
    comment: '',
    practices_used: [],
    results_achieved: '',
    time_period: '1-3 months',
    would_recommend: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    { value: 'soil_improvement', label: '🌱 Soil Improvement', icon: '🌱' },
    { value: 'erosion_control', label: '🛡️ Erosion Control', icon: '🛡️' },
    { value: 'water_management', label: '💧 Water Management', icon: '💧' },
    { value: 'crop_rotation', label: '🔄 Crop Rotation', icon: '🔄' },
    { value: 'organic_farming', label: '🌿 Organic Farming', icon: '🌿' },
    { value: 'technology_use', label: '📱 Technology Use', icon: '📱' }
  ];

  const practices = [
    'Cover Crops', 'Composting', 'Terracing', 'Drip Irrigation',
    'Crop Rotation', 'Organic Fertilizers', 'Mulching', 'Agroforestry',
    'Contour Farming', 'Green Manure', 'Biochar', 'Precision Agriculture'
  ];

  const handlePracticeToggle = (practice) => {
    setFormData(prev => ({
      ...prev,
      practices_used: prev.practices_used.includes(practice)
        ? prev.practices_used.filter(p => p !== practice)
        : [...prev.practices_used, practice]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.title.trim() || !formData.comment.trim()) {
      setError('Title and experience description are required');
      setLoading(false);
      return;
    }

    try {
      const sanitizedData = {
        ...formData,
        title: sanitizeInput(formData.title),
        comment: sanitizeInput(formData.comment),
        results_achieved: sanitizeInput(formData.results_achieved)
      };

      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/testimonials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(sanitizedData)
      });

      const data = await response.json();
      
      if (data.success) {
        onSuccess?.();
        setFormData({
          zone: user?.preferred_zone || 'Murang\'a',
          category: 'soil_improvement',
          rating: 5,
          title: '',
          comment: '',
          practices_used: [],
          results_achieved: '',
          time_period: '1-3 months',
          would_recommend: true
        });
      } else {
        setError(data.error || 'Failed to submit experience');
      }
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="experience-form">
      <div className="form-header">
        <h3>🌟 Share Your Experience</h3>
        <p>Help fellow farmers by sharing your soil health journey</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-grid">
        <div className="form-group">
          <label>📍 Zone</label>
          <select
            value={formData.zone}
            onChange={(e) => setFormData({...formData, zone: e.target.value})}
          >
            <option value="Murang'a">🌿 Murang'a</option>
            <option value="Kiambu">🌱 Kiambu</option>
            <option value="Thika">🌾 Thika</option>
            <option value="Nyeri">🌲 Nyeri</option>
          </select>
        </div>

        <div className="form-group">
          <label>📂 Category</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>⭐ Rating (1-5)</label>
          <div className="rating-input">
            {[1,2,3,4,5].map(num => (
              <button
                key={num}
                type="button"
                className={`star ${formData.rating >= num ? 'active' : ''}`}
                onClick={() => setFormData({...formData, rating: num})}
              >
                ⭐
              </button>
            ))}
            <span className="rating-text">({formData.rating}/5)</span>
          </div>
        </div>

        <div className="form-group">
          <label>⏱️ Time Period</label>
          <select
            value={formData.time_period}
            onChange={(e) => setFormData({...formData, time_period: e.target.value})}
          >
            <option value="1-3 months">1-3 months</option>
            <option value="3-6 months">3-6 months</option>
            <option value="6-12 months">6-12 months</option>
            <option value="1+ years">1+ years</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label>📝 Experience Title</label>
        <input
          type="text"
          placeholder="e.g., 'Improved soil fertility with cover crops'"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          maxLength="100"
          required
        />
        <small>{formData.title.length}/100 characters</small>
      </div>

      <div className="form-group">
        <label>🌾 Practices Used</label>
        <div className="practices-grid">
          {practices.map(practice => (
            <button
              key={practice}
              type="button"
              className={`practice-tag ${formData.practices_used.includes(practice) ? 'selected' : ''}`}
              onClick={() => handlePracticeToggle(practice)}
            >
              {practice}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label>💬 Describe Your Experience</label>
        <textarea
          placeholder="Share details about what you did, challenges faced, and outcomes..."
          value={formData.comment}
          onChange={(e) => setFormData({...formData, comment: e.target.value})}
          rows="4"
          maxLength="500"
          required
        />
        <small>{formData.comment.length}/500 characters</small>
      </div>

      <div className="form-group">
        <label>📈 Results Achieved</label>
        <textarea
          placeholder="Describe the improvements you observed (e.g., increased yield, better soil texture)..."
          value={formData.results_achieved}
          onChange={(e) => setFormData({...formData, results_achieved: e.target.value})}
          rows="3"
          maxLength="300"
        />
        <small>{formData.results_achieved.length}/300 characters</small>
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={formData.would_recommend}
            onChange={(e) => setFormData({...formData, would_recommend: e.target.checked})}
          />
          <span className="checkmark">✅</span>
          I would recommend these practices to other farmers
        </label>
      </div>

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? '📤 Sharing...' : '🚀 Share Experience'}
      </button>
    </form>
  );
};

export default ExperienceForm;