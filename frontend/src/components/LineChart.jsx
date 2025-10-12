import React, { useEffect, useRef } from 'react';

const LineChart = ({ data, location, dateRange }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Chart dimensions
    const padding = 60;
    const chartWidth = width - 2 * padding;
    const chartHeight = height - 2 * padding;

    // Prepare data
    const sortedData = [...data].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const dates = sortedData.map(d => {
      const date = new Date(d.timestamp);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: data.length > 30 ? undefined : '2-digit'
      });
    });

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();

    // Y-axis labels
    ctx.fillStyle = '#718096';
    ctx.font = '12px Arial';
    for (let i = 0; i <= 10; i++) {
      const y = padding + chartHeight - (i / 10) * chartHeight;
      ctx.fillText((i / 10).toFixed(1), 20, y + 4);
      
      if (i > 0) {
        ctx.strokeStyle = '#f7fafc';
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(padding + chartWidth, y);
        ctx.stroke();
      }
    }

    // X-axis labels (show every nth label to avoid crowding)
    const labelStep = Math.max(1, Math.floor(dates.length / 8));
    dates.forEach((date, i) => {
      if (i % labelStep === 0 || i === dates.length - 1) {
        const x = padding + (i * chartWidth / (dates.length - 1));
        ctx.save();
        ctx.translate(x, padding + chartHeight + 15);
        ctx.rotate(-Math.PI / 6); // Less rotation for better readability
        ctx.fillStyle = '#4a5568';
        ctx.font = '11px Inter, Arial';
        ctx.textAlign = 'start';
        ctx.fillText(date, 0, 0);
        ctx.restore();
      }
    });

    // Draw lines
    const metrics = [
      { key: 'vegetation_index', color: '#4CAF50', label: 'Vegetation' },
      { key: 'erosion_index', color: '#f44336', label: 'Erosion' },
      { key: 'moisture_level', color: '#2196F3', label: 'Moisture', scale: 100 }
    ];

    metrics.forEach(metric => {
      ctx.strokeStyle = metric.color;
      ctx.lineWidth = 3;
      ctx.beginPath();

      sortedData.forEach((point, i) => {
        const x = padding + (i * chartWidth / (sortedData.length - 1));
        const value = metric.scale ? point[metric.key] / metric.scale : point[metric.key];
        const y = padding + chartHeight - (value * chartHeight);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();

      // Draw points
      ctx.fillStyle = metric.color;
      sortedData.forEach((point, i) => {
        const x = padding + (i * chartWidth / (sortedData.length - 1));
        const value = metric.scale ? point[metric.key] / metric.scale : point[metric.key];
        const y = padding + chartHeight - (value * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    });

    // Legend
    metrics.forEach((metric, i) => {
      const legendY = 20 + i * 25;
      ctx.fillStyle = metric.color;
      ctx.fillRect(width - 150, legendY, 15, 15);
      ctx.fillStyle = '#2d3748';
      ctx.fillText(metric.label, width - 130, legendY + 12);
    });

  }, [data]);

  return (
    <div className="line-chart">
      <h3>📈 Soil Health Trends - {location}</h3>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400}
        className="chart-canvas"
        aria-label="Soil health trends"
      />
    </div>
  );
};

export default LineChart;