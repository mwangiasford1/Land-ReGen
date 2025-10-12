import React, { useState } from 'react';
import PropTypes from 'prop-types';
import API_BASE_URL from '../config/api';
import { sanitizeInput, isValidEmail, isStrongPassword } from '../utils/security';
import './auth.css'; // Adjust path if needed

const Register = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Field Agent',
    preferred_zone: "Murang'a"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isValidEmail(formData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!isStrongPassword(formData.password)) {
      setError('Password must be 8+ characters with uppercase, lowercase, and number');
      setLoading(false);
      return;
    }

    const sanitizedData = {
      name: sanitizeInput(formData.name),
      email: sanitizeInput(formData.email),
      password: formData.password,
      role: formData.role,
      preferred_zone: formData.preferred_zone
    };

    try {
      const response = await fetch(`${API_BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sanitizedData)
      });

      const data = await response.json();

      if (data.success) {
        fetch(`${API_BASE_URL}/test-email/welcome`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: sanitizedData.email,
            name: sanitizedData.name
          })
        }).catch(error => console.log('Welcome email failed:', error));

        setSuccess(true);
        setTimeout(() => {
          onRegister(null); // Redirect to login
        }, 2000);
      } else {
        setError(data.error);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="wrapper">
        <div className="login-box">
          <form onSubmit={handleSubmit} className="auth-form">
            <h2>🌱 Join Land ReGen</h2>
            <p>Create your account to start monitoring soil health</p>

            {error && <div className="error">{error}</div>}
            {success && (
              <div className="success">
                ✅ Account created successfully! Redirecting to login...
              </div>
            )}

            <input
              type="text"
              placeholder="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              autoComplete="name"
              aria-label="Full Name"
            />

            <input
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              autoComplete="email"
              inputMode="email"
              aria-label="Email Address"
            />

            <input
              type="password"
              placeholder="Create Password (8+ chars, A-Z, a-z, 0-9)"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength="8"
              autoComplete="new-password"
              aria-label="Password"
            />

            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              aria-label="Select Role"
            >
              <option value="Field Agent">👨🌾 Field Agent</option>
              <option value="Analyst">📊 Analyst</option>
              <option value="Admin">🔑 Admin</option>
            </select>

            <select
              value={formData.preferred_zone}
              onChange={(e) => setFormData({ ...formData, preferred_zone: e.target.value })}
              aria-label="Preferred Zone"
            >
              <option value="Murang'a">🌿 Murang'a</option>
              <option value="Kiambu">🌱 Kiambu</option>
              <option value="Thika">🌾 Thika</option>
              <option value="Nyeri">🌲 Nyeri</option>
            </select>

            <button type="submit" disabled={loading}>
              {loading ? '🔄 Creating Account...' : '🎆 Create Account'}
            </button>

            <div className="auth-toggle">
              <p>Already have an account?</p>
              <button type="button" onClick={() => onRegister(null)}>
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

Register.propTypes = {
  onRegister: PropTypes.func.isRequired
};

export default Register;