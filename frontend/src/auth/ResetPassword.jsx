import React, { useState, useEffect } from 'react';
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });

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
        <h2>✅ Password Reset</h2>
        <div className="success">
          Password successfully reset! Redirecting to login...
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>🔐 New Password</h2>
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
        minLength="6"
      />
      
      <input
        type="password"
        placeholder="Confirm New Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
        minLength="6"
      />
      
      <button type="submit" disabled={loading}>
        {loading ? '🔄 Updating...' : '🔒 Update Password'}
      </button>
    </form>
  );
};

export default ResetPassword;