import React, { useRef, useEffect, useState } from 'react';

const CanvasChart = ({ data, zones = ['Murang\'a'], type = 'realtime' }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  useEffect(() => {
    const updateDimensions = () => {
      const isMobile = window.innerWidth < 768;
      const isTablet = window.innerWidth < 1024;
      const maxWidth = isMobile ? Math.min(window.innerWidth - 60, 320) : isTablet ? 500 : 600;
      
      setDimensions({
        width: maxWidth,
        height: isMobile ? 200 : isTablet ? 300 : 400
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !data?.length) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = dimensions;
    canvas.width = width;
    canvas.height = height;

    if (type === 'realtime') {
      startRealtimeAnimation(ctx, width, height);
    } else if (type === 'multizone') {
      drawMultiZoneOverlay(ctx, width, height);
    } else {
      drawHighDensityChart(ctx, width, height);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, zones, type]);

  const startRealtimeAnimation = (ctx, width, height) => {
    let frame = 0;
    setIsAnimating(true);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#f8fafc');
      gradient.addColorStop(1, '#e2e8f0');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const y = (height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Animated moisture waves
      const time = frame * 0.02;
      ctx.strokeStyle = '#2196F3';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      for (let x = 0; x < width; x += 2) {
        const moisture = data[0]?.moisture_level || 50;
        const wave1 = Math.sin((x * 0.01) + time) * 20;
        const wave2 = Math.sin((x * 0.02) + time * 1.5) * 10;
        const y = height - ((moisture + wave1 + wave2) / 100 * height);
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Vegetation particles
      ctx.fillStyle = '#4CAF50';
      const vegIndex = data[0]?.vegetation_index || 0.5;
      const particleCount = Math.floor(vegIndex * 50);
      
      for (let i = 0; i < particleCount; i++) {
        const x = (Math.sin(time + i) * 0.5 + 0.5) * width;
        const y = (Math.cos(time * 0.7 + i) * 0.3 + 0.7) * height;
        const size = Math.sin(time + i) * 2 + 3;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }

      // Erosion indicators
      const erosion = data[0]?.erosion_index || 0.5;
      if (erosion > 0.7) {
        ctx.fillStyle = `rgba(244, 67, 54, ${Math.sin(time * 3) * 0.3 + 0.4})`;
        ctx.fillRect(0, 0, width, height * 0.1);
      }

      frame++;
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const drawMultiZoneOverlay = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    const zoneWidth = width / zones.length;
    const colors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0'];

    zones.forEach((zone, index) => {
      const x = index * zoneWidth;
      const zoneData = data.filter(d => d.location === zone);
      
      if (zoneData.length === 0) return;

      // Zone background
      ctx.fillStyle = `${colors[index]}20`;
      ctx.fillRect(x, 0, zoneWidth, height);

      // Zone border
      ctx.strokeStyle = colors[index];
      ctx.lineWidth = 2;
      ctx.strokeRect(x, 0, zoneWidth, height);

      // Data visualization
      const latest = zoneData[0];
      const barHeight = (latest.vegetation_index * height * 0.8);
      
      ctx.fillStyle = colors[index];
      ctx.fillRect(x + 10, height - barHeight, zoneWidth - 20, barHeight);

      // Zone label
      ctx.fillStyle = '#2d3748';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(zone, x + zoneWidth/2, height - 10);

      // Metrics
      ctx.font = '12px Arial';
      ctx.fillText(`V: ${latest.vegetation_index.toFixed(2)}`, x + zoneWidth/2, 20);
      ctx.fillText(`E: ${latest.erosion_index.toFixed(2)}`, x + zoneWidth/2, 35);
      ctx.fillText(`M: ${latest.moisture_level}%`, x + zoneWidth/2, 50);
    });
  };

  const drawHighDensityChart = (ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);
    
    if (data.length < 2) return;

    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    // Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Grid
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const y = padding + (chartHeight / 10) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // High-density data points
    const pointsPerPixel = Math.max(1, Math.floor(data.length / chartWidth));
    
    for (let x = 0; x < chartWidth; x++) {
      const startIdx = x * pointsPerPixel;
      const endIdx = Math.min(startIdx + pointsPerPixel, data.length);
      const chunk = data.slice(startIdx, endIdx);
      
      if (chunk.length === 0) continue;

      // Aggregate chunk data
      const avgVeg = chunk.reduce((sum, d) => sum + d.vegetation_index, 0) / chunk.length;
      const avgErosion = chunk.reduce((sum, d) => sum + d.erosion_index, 0) / chunk.length;
      const avgMoisture = chunk.reduce((sum, d) => sum + d.moisture_level, 0) / chunk.length;

      const pixelX = padding + x;

      // Vegetation line
      ctx.fillStyle = '#4CAF50';
      const vegY = padding + chartHeight - (avgVeg * chartHeight);
      ctx.fillRect(pixelX, vegY, 1, 2);

      // Erosion line
      ctx.fillStyle = '#f44336';
      const erosionY = padding + chartHeight - ((avgErosion / 2) * chartHeight);
      ctx.fillRect(pixelX, erosionY, 1, 2);

      // Moisture line
      ctx.fillStyle = '#2196F3';
      const moistureY = padding + chartHeight - ((avgMoisture / 100) * chartHeight);
      ctx.fillRect(pixelX, moistureY, 1, 2);
    }

    // Labels
    ctx.fillStyle = '#2d3748';
    ctx.font = '12px Arial';
    ctx.fillText('High-Density Soil Data', padding, 20);
    ctx.fillText(`${data.length} data points`, padding, height - 10);
  };

  const toggleAnimation = () => {
    if (isAnimating) {
      cancelAnimationFrame(animationRef.current);
      setIsAnimating(false);
    } else {
      startRealtimeAnimation(canvasRef.current.getContext('2d'), 600, 400);
    }
  };

  return (
    <div className="canvas-chart">
      <div className="chart-controls" style={{
        marginBottom: '10px',
        display: 'flex',
        flexDirection: window.innerWidth < 768 ? 'column' : 'row',
        alignItems: window.innerWidth < 768 ? 'stretch' : 'center',
        gap: '8px'
      }}>
        <button 
          onClick={toggleAnimation}
          style={{
            padding: '8px 16px',
            background: isAnimating ? '#f44336' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: window.innerWidth < 768 ? '14px' : '16px',
            width: window.innerWidth < 768 ? '100%' : 'auto'
          }}
        >
          {isAnimating ? '⏸️ Pause' : '▶️ Play'}
        </button>
        <span style={{
          fontSize: window.innerWidth < 768 ? '11px' : '12px',
          color: '#666',
          textAlign: window.innerWidth < 768 ? 'center' : 'left'
        }}>
          {type === 'realtime' && 'Live moisture'}
          {type === 'multizone' && `${zones.length} zones`}
          {type === 'density' && `${data?.length || 0} points`}
        </span>
      </div>
      
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          background: '#ffffff',
          width: '100%',
          maxWidth: '100%',
          height: 'auto',
          touchAction: 'manipulation',
          display: 'block'
        }}
      />
      
      <div className="chart-legend" style={{
        marginTop: '10px',
        fontSize: window.innerWidth < 768 ? '11px' : '12px',
        display: 'flex',
        justifyContent: 'space-around',
        flexWrap: 'wrap',
        gap: '5px'
      }}>
        <span style={{color: '#4CAF50'}}>🟢 Vegetation</span>
        <span style={{color: '#f44336'}}>🔴 Erosion</span>
        <span style={{color: '#2196F3'}}>🔵 Moisture</span>
      </div>
    </div>
  );
};

export default CanvasChart;