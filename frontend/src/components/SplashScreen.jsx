import React, { useState, useEffect } from 'react';

const SplashScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [logoVisible, setLogoVisible] = useState(false);
  const [textVisible, setTextVisible] = useState(false);

  useEffect(() => {
    // Logo animation
    setTimeout(() => setLogoVisible(true), 200);
    
    // Text animation
    setTimeout(() => setTextVisible(true), 800);
    
    // Progress animation
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    return () => clearInterval(progressInterval);
  }, [onComplete]);

  return (
    <div className="splash-screen">
      <div className="splash-content">
        {/* Enhanced Logo */}
        <div className={`logo-container ${logoVisible ? 'visible' : ''}`}>
          <div className="logo-main">
            <div className="logo-icon">
              <svg width="80" height="80" viewBox="0 0 80 80" className="logo-svg">
                <defs>
                  <linearGradient id="leafGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4CAF50" />
                    <stop offset="50%" stopColor="#2E7D32" />
                    <stop offset="100%" stopColor="#1B5E20" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge> 
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Leaf shape */}
                <path 
                  d="M40 10 C50 15, 60 25, 65 40 C60 55, 50 65, 40 70 C30 65, 20 55, 15 40 C20 25, 30 15, 40 10 Z" 
                  fill="url(#leafGradient)" 
                  filter="url(#glow)"
                  className="leaf-path"
                />
                
                {/* Leaf vein */}
                <path 
                  d="M40 15 Q45 30, 40 45 Q35 60, 40 65" 
                  stroke="rgba(255,255,255,0.3)" 
                  strokeWidth="2" 
                  fill="none"
                  className="leaf-vein"
                />
                
                {/* Particles */}
                <circle cx="25" cy="25" r="2" fill="#81C784" className="particle p1" />
                <circle cx="55" cy="30" r="1.5" fill="#A5D6A7" className="particle p2" />
                <circle cx="30" cy="55" r="1" fill="#C8E6C9" className="particle p3" />
              </svg>
            </div>
            <div className="logo-rings">
              <div className="ring ring-1"></div>
              <div className="ring ring-2"></div>
              <div className="ring ring-3"></div>
            </div>
          </div>
        </div>

        {/* Brand Text */}
        <div className={`brand-text ${textVisible ? 'visible' : ''}`}>
          <h1 className="brand-title">Land ReGen</h1>
          <p className="brand-subtitle">Soil Health Monitoring</p>
          <div className="brand-tagline">
            <span className="tagline-icon">🌱</span>
            <span>Regenerating Kenya's Agricultural Future</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="progress-text">{progress}%</div>
        </div>

        {/* Loading Animation */}
        <div className="loading-dots">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
      </div>

      <style>{
        `
        .splash-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          overflow: hidden;
        }

        .splash-content {
          text-align: center;
          color: white;
          position: relative;
        }

        .logo-container {
          position: relative;
          margin-bottom: 2rem;
          opacity: 0;
          transform: scale(0.5) rotate(-180deg);
          transition: all 1s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        .logo-container.visible {
          opacity: 1;
          transform: scale(1) rotate(0deg);
        }

        .logo-main {
          position: relative;
          width: 120px;
          height: 120px;
          margin: 0 auto;
        }

        .logo-svg {
          width: 100%;
          height: 100%;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,0.3));
        }

        .leaf-path {
          animation: leafPulse 3s ease-in-out infinite;
        }

        .leaf-vein {
          animation: veinGlow 2s ease-in-out infinite alternate;
        }

        .particle {
          animation: float 4s ease-in-out infinite;
        }

        .particle.p1 { animation-delay: 0s; }
        .particle.p2 { animation-delay: 1s; }
        .particle.p3 { animation-delay: 2s; }

        .logo-rings {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }

        .ring {
          position: absolute;
          border: 2px solid rgba(255,255,255,0.1);
          border-radius: 50%;
          animation: ripple 3s ease-out infinite;
        }

        .ring-1 {
          width: 140px;
          height: 140px;
          margin: -70px 0 0 -70px;
          animation-delay: 0s;
        }

        .ring-2 {
          width: 180px;
          height: 180px;
          margin: -90px 0 0 -90px;
          animation-delay: 1s;
        }

        .ring-3 {
          width: 220px;
          height: 220px;
          margin: -110px 0 0 -110px;
          animation-delay: 2s;
        }

        .brand-text {
          opacity: 0;
          transform: translateY(30px);
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          margin-bottom: 3rem;
        }

        .brand-text.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .brand-title {
          font-size: 3.5rem;
          font-weight: 900;
          margin: 0 0 0.5rem 0;
          background: linear-gradient(135deg, #ffffff, #f0f9ff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.02em;
          text-shadow: 0 4px 8px rgba(0,0,0,0.3);
        }

        .brand-subtitle {
          font-size: 1.2rem;
          font-weight: 400;
          margin: 0 0 1rem 0;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.05em;
        }

        .brand-tagline {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: rgba(255,255,255,0.7);
          font-weight: 500;
        }

        .tagline-icon {
          font-size: 1.2rem;
          animation: bounce 2s ease-in-out infinite;
        }

        .progress-container {
          margin: 2rem 0;
          width: 300px;
          margin-left: auto;
          margin-right: auto;
        }

        .progress-bar {
          width: 100%;
          height: 4px;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4CAF50, #81C784);
          border-radius: 2px;
          transition: width 0.3s ease;
          box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
        }

        .progress-text {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          text-align: center;
        }

        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .dot {
          width: 8px;
          height: 8px;
          background: rgba(255,255,255,0.6);
          border-radius: 50%;
          animation: dotPulse 1.5s ease-in-out infinite;
        }

        .dot:nth-child(1) { animation-delay: 0s; }
        .dot:nth-child(2) { animation-delay: 0.2s; }
        .dot:nth-child(3) { animation-delay: 0.4s; }

        @keyframes leafPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }

        @keyframes veinGlow {
          0% { stroke-opacity: 0.3; }
          100% { stroke-opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes dotPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        @media (max-width: 768px) {
          .brand-title {
            font-size: 2.5rem;
          }
          
          .logo-main {
            width: 100px;
            height: 100px;
          }
          
          .progress-container {
            width: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;