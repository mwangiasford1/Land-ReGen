import React, { useState } from 'react';

const TestimonialForm = ({ zone, onSubmit }) => {
  const [formData, setFormData] = useState({
    comment: '',
    rating: 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/testimonials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, zone })
      });

      const data = await response.json();
      
      if (data.success) {
        setFormData({ comment: '', rating: 5 });
        onSubmit(data.data);
      }
    } catch (err) {
      console.error('Failed to submit testimonial:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="testimonial-form">
      <h3>💬 Share Your Experience</h3>
      
      <textarea
        placeholder="Share your experience with soil health improvements in this zone..."
        value={formData.comment}
        onChange={(e) => setFormData({...formData, comment: e.target.value})}
        required
        rows="4"
      />
      
      <div className="rating-input">
        <label>Rating:</label>
        <select
          value={formData.rating}
          onChange={(e) => setFormData({...formData, rating: parseInt(e.target.value)})}
        >
          {[1,2,3,4,5].map(num => (
            <option key={num} value={num}>
              {'⭐'.repeat(num)} ({num}/5)
            </option>
          ))}
        </select>
      </div>
      
      <button type="submit" disabled={loading || !formData.comment.trim()}>
        {loading ? 'Submitting...' : 'Submit Testimonial'}
      </button>
    </form>
  );
};

export default TestimonialForm;