import React, { useState } from 'react';
import API_BASE_URL from '../config/api';
import { sanitizeInput, isValidEmail } from '../utils/security';

const Login = ({ onLogin, onForgotPassword }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const sanitizedData = {
      email: sanitizeInput(formData.email),
      password: formData.password
    };

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>🌱 Welcome to Land ReGen</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '1.5rem' }}>
        Monitor soil health across Kenya
      </p>

      {error && <div className="error">{error}</div>}

      <input
        type="email"
        aria-label="Email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        required
      />

      <input
        className="login-box"
        type="password"
        aria-label="Password"
        placeholder="Enter your password"
        value={formData.password}
        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        required
      />

      <button type="submit" disabled={loading}>
        {loading ? '🔄 Signing in...' : '🚀 Sign In'}
      </button>

      <button
        type="button"
        onClick={onForgotPassword}
        style={{
          background: 'transparent',
          color: '#666',
          border: 'none',
          marginTop: '10px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        Forgot your password?
      </button>
    </form>
  );
};

export default Login;