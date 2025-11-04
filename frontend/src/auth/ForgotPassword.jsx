import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import PropTypes from 'prop-types';
import { isValidEmail } from '../utils/security';

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.success) {
        setSent(true);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('ForgotPassword error:', err);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <form className="auth-form">
        <h2>Check Your Email</h2>
        <p style={{textAlign: 'center', color: '#666', marginBottom: '1.5rem'}}>
          If an account exists with {email}, you will receive reset instructions.
        </p>
        
        <div className="success" style={{marginBottom: '1rem'}}>
           Reset link sent! Check your inbox and spam folder.
        </div>
        
        <button type="button" onClick={onBack}>
          Back to Login
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2> Reset Password</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '1.5rem'}}>
        Enter your email to receive reset instructions
      </p>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="email"
        placeholder="Enter your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>
      
      <button type="button" onClick={onBack} style={{
        background: 'transparent',
        color: '#666',
        marginTop: '10px'
      }}>
        Back to Login
      </button>
    </form>
  );
};

ForgotPassword.propTypes = {
  onBack: PropTypes.func.isRequired,
};

export default ForgotPassword;