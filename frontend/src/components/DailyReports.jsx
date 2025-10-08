import React, { useState, useEffect } from 'react';
import API_BASE_URL from '../config/api';

const DailyReports = ({ user }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/daily-reports`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading reports...</div>;

  return (
    <div className="daily-reports">
      <h3>📊 Daily Reports</h3>
      {reports.length === 0 ? (
        <p>No reports available yet.</p>
      ) : (
        <div className="reports-list">
          {reports.map(report => (
            <div key={report.id} className="report-card">
              <div className="report-header">
                <h4>{report.zone}</h4>
                <span className="report-date">{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              <div className="report-metrics">
                <div className="metric">
                  <span>Vegetation:</span>
                  <span className="value">{report.avg_vegetation}</span>
                </div>
                <div className="metric">
                  <span>Erosion:</span>
                  <span className="value">{report.avg_erosion}</span>
                </div>
                <div className="metric">
                  <span>Moisture:</span>
                  <span className="value">{report.avg_moisture}%</span>
                </div>
              </div>
              <div className="report-recommendations">
                <p>{report.recommendations}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyReports;