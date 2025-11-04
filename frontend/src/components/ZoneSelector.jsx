import React from 'react';

const ZoneSelector = ({ selectedZone, onZoneChange, zones }) => {
  const defaultZones = [
    { id: 'muranga', name: 'Murang\'a', status: 'active' },
    { id: 'kiambu', name: 'Kiambu', status: 'active' },
    { id: 'thika', name: 'Thika', status: 'maintenance' },
    { id: 'nyeri', name: 'Nyeri', status: 'inactive' }
  ];

  const availableZones = zones || defaultZones;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'maintenance': return 'Maintenance';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  const handleZoneSelect = (zoneName) => {
    try {
      if (!zoneName || typeof zoneName !== 'string') {
        console.error('Invalid zone name provided');
        return;
      }
      if (typeof onZoneChange !== 'function') {
        console.error('onZoneChange is not a function');
        return;
      }
      onZoneChange(zoneName);
    } catch (error) {
      console.error('Error selecting zone:', error);
    }
  };

  return (
    <div className="zone-selector">
      <h3>Select Monitoring Zone</h3>
      
      {/* Dropdown Selector */}
      <div className="zone-dropdown">
        <select 
          value={selectedZone} 
          onChange={(e) => handleZoneSelect(e.target.value)}
          className="zone-select"
        >
          {availableZones.map(zone => (
            <option key={zone.id} value={zone.name}>
              {zone.name}
            </option>
          ))}
        </select>
      </div>

      {/* Zone Cards */}
      <div className="zone-cards">
        {availableZones.map(zone => (
          <div 
            key={zone.id}
            className={`zone-card ${selectedZone === zone.name ? 'selected' : ''} ${zone.status}`}
            onClick={() => handleZoneSelect(zone.name)}
          >
            <div className="zone-header">
              <span className="zone-status">{getStatusIcon(zone.status)}</span>
              <span className="zone-name">{zone.name}</span>
            </div>
            <div className="zone-info">
              <span className="zone-status-text">
                {zone.status.charAt(0).toUpperCase() + zone.status.slice(1)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Map View Placeholder */}
      <div className="zone-map">
        <div className="map-placeholder">
          <h4>{selectedZone} Region</h4>
          <div className="map-visual">
            <div className="region-outline">
              <div className="monitoring-points">
                <div className="point active">Station 1</div>
                <div className="point active">Station 2</div>
                <div className="point maintenance">Station 3</div>
              </div>
            </div>
          </div>
          <p>3 monitoring stations active</p>
        </div>
      </div>
    </div>
  );
};

export default ZoneSelector;