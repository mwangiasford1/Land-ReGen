import React, { useState, useEffect } from 'react';

const TestimonialList = ({ zone }) => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestimonials();
  }, [zone]);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`http://localhost:3000/testimonials?zone=${zone}`);
      const data = await response.json();
      
      if (data.success) {
        setTestimonials(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading testimonials...</div>;

  return (
    <div className="testimonial-list">
      <h3>🗣️ Community Feedback - {zone}</h3>
      
      {testimonials.length === 0 ? (
        <p>No testimonials yet for this zone.</p>
      ) : (
        <div className="testimonials">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="testimonial-card">
              <div className="testimonial-header">
                <span className="author">{testimonial.users?.name || 'Anonymous'}</span>
                <span className="rating">{'⭐'.repeat(testimonial.rating)}</span>
              </div>
              <p className="comment">{testimonial.comment}</p>
              <span className="date">
                {new Date(testimonial.created_at).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestimonialList;