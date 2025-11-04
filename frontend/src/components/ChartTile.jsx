import React from 'react';
import PropTypes from 'prop-types';

function ChartTile({ data }) {
  if (!data || data.length === 0) {
    return <div className="chart-tile">No data available</div>;
  }



  return (
    <div className="chart-tile">
      <h3> Trend Analysis</h3>
      <div className="chart-container">
        <svg width="100%" height="300" viewBox="0 0 600 300">
          {/* Grid lines */}
          {[0, 1, 2, 3, 4].map(i => (
            <line
              key={`grid-${i}`}
              x1="50"
              y1={50 + i * 50}
              x2="550"
              y2={50 + i * 50}
              stroke="#e2e8f0"
              strokeWidth="1"
            />
          ))}
          
          {/* Y-axis labels */}
          {[0, 0.25, 0.5, 0.75, 1].map((val, i) => (
            <text
              key={`label-${val}`}
              x="40"
              y={255 - i * 50}
              fontSize="12"
              fill="#718096"
              textAnchor="end"
            >
              {val.toFixed(2)}
            </text>
          ))}

          {/* Vegetation line */}
          <polyline
            points={data.map((d, i) => 
              `${50 + (i * 500 / (data.length - 1))},${250 - (d.vegetation_index * 200)}`
            ).join(' ')}
            fill="none"
            stroke="#4CAF50"
            strokeWidth="3"
          />

          {/* Erosion line */}
          <polyline
            points={data.map((d, i) => 
              `${50 + (i * 500 / (data.length - 1))},${250 - (d.erosion_index * 200)}`
            ).join(' ')}
            fill="none"
            stroke="#f44336"
            strokeWidth="3"
          />

          {/* Moisture line */}
          <polyline
            points={data.map((d, i) => 
              `${50 + (i * 500 / (data.length - 1))},${250 - ((d.moisture_level / 100) * 200)}`
            ).join(' ')}
            fill="none"
            stroke="#2196F3"
            strokeWidth="3"
          />

          {/* Data points */}
          {data.map((d, i) => (
            <g key={`point-${i}-${d.timestamp || i}`}>
              <circle
                cx={50 + (i * 500 / (data.length - 1))}
                cy={250 - (d.vegetation_index * 200)}
                r="4"
                fill="#4CAF50"
              />
              <circle
                cx={50 + (i * 500 / (data.length - 1))}
                cy={250 - (d.erosion_index * 200)}
                r="4"
                fill="#f44336"
              />
              <circle
                cx={50 + (i * 500 / (data.length - 1))}
                cy={250 - ((d.moisture_level / 100) * 200)}
                r="4"
                fill="#2196F3"
              />
            </g>
          ))}
        </svg>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#4CAF50'}}></span>
            {' '}Vegetation Index
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#f44336'}}></span>
            {' '}Erosion Index
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{backgroundColor: '#2196F3'}}></span>
            {' '}Moisture Level
          </div>
        </div>
      </div>
    </div>
  );
}

ChartTile.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      vegetation_index: PropTypes.number.isRequired,
      erosion_index: PropTypes.number.isRequired,
      moisture_level: PropTypes.number.isRequired,
      timestamp: PropTypes.string
    })
  )
};

export default ChartTile;