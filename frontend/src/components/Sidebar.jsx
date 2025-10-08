import React from 'react';

const Sidebar = ({ activeSection, onSectionChange }) => {
  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'zones', icon: '🗺️', label: 'Zones' },
    { id: 'analytics', icon: '📈', label: 'Analytics' },
    { id: 'alerts', icon: '⚠️', label: 'Alerts' },
    { id: 'voice', icon: '🎤', label: 'Voice' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <svg width="32" height="32" viewBox="0 0 80 80" className="logo-svg">
            <defs>
              <linearGradient id="sidebarLeafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4CAF50" />
                <stop offset="50%" stopColor="#2E7D32" />
                <stop offset="100%" stopColor="#1B5E20" />
              </linearGradient>
            </defs>
            <path 
              d="M40 10 C50 15, 60 25, 65 40 C60 55, 50 65, 40 70 C30 65, 20 55, 15 40 C20 25, 30 15, 40 10 Z" 
              fill="url(#sidebarLeafGradient)" 
            />
            <path 
              d="M40 15 Q45 30, 40 45 Q35 60, 40 65" 
              stroke="rgba(255,255,255,0.4)" 
              strokeWidth="2" 
              fill="none"
            />
          </svg>
        </div>
        <h3>Land ReGen</h3>
      </div>
      
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
      
      <div className="sidebar-footer">
        <div className="status-indicator">
          <span className="status-dot active"></span>
          <span className="status-text">Online</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;