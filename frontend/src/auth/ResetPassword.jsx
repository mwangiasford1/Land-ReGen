import React, { useState } from 'react';
import PropTypes from 'prop-types';
import API_BASE_URL from '../config/api';

const ResetPassword = ({ token, onComplete }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      setError('Password must contain uppercase, lowercase, and number');
      return;
    }

    setLoading(true);

    try {
      const url = `${API_BASE_URL}/reset-password`;
      if (!url.startsWith('http')) {
        throw new Error('Invalid API URL');
      }
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': globalThis.location.origin
        },
        body: JSON.stringify({ token, password })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setTimeout(() => onComplete(), 3000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <form className="auth-form">
        <h2>Password Reset</h2>
        <div className="success">
          Password successfully reset! Redirecting to login...
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>New Password</h2>
      <p style={{textAlign: 'center', color: '#666', marginBottom: '1.5rem'}}>
        Enter your new password
      </p>
      
      {error && <div className="error">{error}</div>}
      
      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength="8"
      />
      
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength="8"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
};

ResetPassword.propTypes = {
  token: PropTypes.string.isRequired,
  onComplete: PropTypes.func.isRequired
};

export default ResetPassword;