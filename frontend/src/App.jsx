import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './auth/Login';
import Register from './auth/Register';
import ForgotPassword from './auth/ForgotPassword';
import ResetPassword from './auth/ResetPassword';
import SplashScreen from './components/SplashScreen';
import { SettingsProvider } from './contexts/SettingsContext';
import { validateToken } from './utils/security';
import './App.css';
import './auth.css';

function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetToken, setResetToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
      setResetToken(token);
      setShowSplash(false);
      setLoading(false);
      return;
    }

    const authToken = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    try {
      if (authToken && userData && validateToken(authToken)) {
        setUser(JSON.parse(userData));
      } else if (authToken) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      console.error('Error validating stored credentials:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleRegister = () => {
    setShowRegister(false); // Return to login after successful registration
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    let authContent;

    if (resetToken) {
      authContent = (
        <ResetPassword
          token={resetToken}
          onComplete={() => {
            setResetToken(null);
            window.history.replaceState({}, '', '/');
          }}
        />
      );
    } else if (showForgotPassword) {
      authContent = (
        <ForgotPassword onBack={() => setShowForgotPassword(false)} />
      );
    } else if (showRegister) {
      authContent = (
        <>
          <Register onRegister={handleRegister} />
          <div className="auth-toggle">
            <p>
              Already have an account?{' '}
              <button onClick={() => setShowRegister(false)}>Login here</button>
            </p>
          </div>
        </>
      );
    } else {
      authContent = (
        <>
          <Login
            onLogin={handleLogin}
            onForgotPassword={() => setShowForgotPassword(true)}
            onCreateAccount={() => setShowRegister(true)} // ✅ This line enables the button
          />
          <div className="auth-toggle">
            <p>
              New to Land ReGen?{' '}
              <button onClick={() => setShowRegister(true)}>Create Account</button>
            </p>
          </div>
        </>
      );
    }

    return (
      <div className="App">
        <div className="auth-container">
          <div className="wrapper">
            <div className="login-box">{authContent}</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SettingsProvider>
      <Dashboard user={user} onLogout={handleLogout} />
    </SettingsProvider>
  );
}

export default App;