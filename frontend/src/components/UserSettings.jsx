import React, { useState, useEffect } from 'react';

const UserSettings = ({ user, onUpdate }) => {
  const [settings, setSettings] = useState({
    preferred_zone: user?.preferred_zone || 'Murang\'a',
    email_notifications: user?.email_notifications ?? true,
    daily_reports: user?.daily_reports ?? true
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://https://land-regen-1.onrender.com/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });

      const data = await response.json();
      
      if (data.success) {
        setMessage('Settings updated successfully!');
        onUpdate(data.data);
      } else {
        setMessage('Failed to update settings');
      }
    } catch (err) {
      setMessage('Error updating settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-settings">
      <h3>⚙️ User Settings</h3>
      
      {message && (
        <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="setting-group">
          <label>Preferred Zone:</label>
          <select
            value={settings.preferred_zone}
            onChange={(e) => setSettings({...settings, preferred_zone: e.target.value})}
          >
            <option value="Murang'a">Murang'a</option>
            <option value="Kiambu">Kiambu</option>
            <option value="Thika">Thika</option>
            <option value="Nyeri">Nyeri</option>
          </select>
        </div>
        
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.email_notifications}
              onChange={(e) => setSettings({...settings, email_notifications: e.target.checked})}
            />
            Email Notifications
          </label>
        </div>
        
        <div className="setting-group">
          <label>
            <input
              type="checkbox"
              checked={settings.daily_reports}
              onChange={(e) => setSettings({...settings, daily_reports: e.target.checked})}
            />
            Daily Email Reports
          </label>
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default UserSettings;