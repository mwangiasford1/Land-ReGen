import React, { useState } from 'react';

const EmailTester = () => {
  const [loading, setLoading] = useState({});
  const [results, setResults] = useState({});

  const testEmail = async (type, data = {}) => {
    setLoading(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`//https://land-regen.onrender.com/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      setResults(prev => ({ ...prev, [type]: result }));
    } catch (error) {
      setResults(prev => ({ 
        ...prev, 
        [type]: { success: false, error: error.message } 
      }));
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  return (
    <div className="email-tester">
      <h3>📧 Email Service Tester</h3>
      
      <div className="test-section">
        <h4>🚨 Alert Email Test</h4>
        <p>Tests soil health alert notifications</p>
        <button 
          onClick={() => testEmail('alert')}
          disabled={loading.alert}
        >
          {loading.alert ? 'Sending...' : 'Send Test Alert'}
        </button>
        {results.alert && (
          <div className={`result ${results.alert.success ? 'success' : 'error'}`}>
            {results.alert.success ? '✅ ' : '❌ '}
            {results.alert.message || results.alert.error}
          </div>
        )}
      </div>

      <div className="test-section">
        <h4>📊 Daily Report Test</h4>
        <p>Tests daily soil health report emails</p>
        <button 
          onClick={() => testEmail('daily-report')}
          disabled={loading['daily-report']}
        >
          {loading['daily-report'] ? 'Sending...' : 'Send Test Report'}
        </button>
        {results['daily-report'] && (
          <div className={`result ${results['daily-report'].success ? 'success' : 'error'}`}>
            {results['daily-report'].success ? '✅ ' : '❌ '}
            {results['daily-report'].message || results['daily-report'].error}
          </div>
        )}
      </div>

      <div className="test-section">
        <h4>🎉 Welcome Email Test</h4>
        <p>Tests new user welcome emails</p>
        <input
          type="email"
          placeholder="Test email address"
          id="welcomeEmail"
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <input
          type="text"
          placeholder="Test name"
          id="welcomeName"
          style={{ marginRight: '10px', padding: '8px' }}
        />
        <button 
          onClick={() => {
            const email = document.getElementById('welcomeEmail').value;
            const name = document.getElementById('welcomeName').value;
            testEmail('welcome', { email, name });
          }}
          disabled={loading.welcome}
        >
          {loading.welcome ? 'Sending...' : 'Send Welcome Email'}
        </button>
        {results.welcome && (
          <div className={`result ${results.welcome.success ? 'success' : 'error'}`}>
            {results.welcome.success ? '✅ ' : '❌ '}
            {results.welcome.message || results.welcome.error}
          </div>
        )}
      </div>

      <div className="email-config">
        <h4>⚙️ Email Configuration</h4>
        <p><strong>SMTP Host:</strong> smtp.gmail.com</p>
        <p><strong>Email User:</strong> Configure in backend .env</p>
        <p><strong>Status:</strong> 🟡 Check backend logs</p>
      </div>
    </div>
  );
};

export default EmailTester;