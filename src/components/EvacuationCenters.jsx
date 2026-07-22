import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Users, 
  Check, 
  Building2, 
  Phone, 
  ChevronLeft, 
  ChevronRight,
  Shield,
  ShieldAlert,
  RefreshCw,
  Zap,
  Coffee,
  Heart,
  Droplet
} from 'lucide-react';

const INITIAL_CENTERS = [
  {
    id: 1,
    name: 'Malanday Elementary School',
    status: 'Open',
    capacity: 500,
    occupancy: 320,
    barangay: 'Malanday',
    manager: 'Kagawad Juan Dela Cruz',
    contact: '0917-123-4567',
    amenities: ['First Aid Clinic', 'Mobile Kitchen', 'Washrooms', 'Power Charging Outlets']
  },
  {
    id: 2,
    name: 'Nangka High School',
    status: 'Open',
    capacity: 300,
    occupancy: 215,
    barangay: 'Nangka',
    manager: 'Maria Santos',
    contact: '0918-234-5678',
    amenities: ['First Aid Clinic', 'Water Station', 'Washrooms']
  },
  {
    id: 3,
    name: 'Marikina Sports Center',
    status: 'Full',
    capacity: 1000,
    occupancy: 1000,
    barangay: 'Sto. Niño',
    manager: 'LGU CDCC Team',
    contact: '0920-345-6789',
    amenities: ['First Aid Clinic', 'Mobile Kitchen', 'Washrooms', 'Backup Generator', 'Sleeping Mats']
  }
];

export default function EvacuationCenters() {
  const [centers, setCenters] = useState(INITIAL_CENTERS);
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [barangayFilter, setBarangayFilter] = useState('');
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);

  // Simulation state
  const [addOccupantsNum, setAddOccupantsNum] = useState('');

  const selectedCenter = centers.find(c => c.id === selectedId);

  const handleRefresh = () => {
    setIsRefreshSpinning(true);
    setTimeout(() => {
      setIsRefreshSpinning(false);
    }, 800);
  };

  const handleAddOccupants = (e) => {
    e.preventDefault();
    if (!addOccupantsNum || isNaN(addOccupantsNum)) return;
    const num = parseInt(addOccupantsNum);
    
    setCenters(prev => prev.map(c => {
      if (c.id === selectedId) {
        const newOcc = Math.min(c.capacity, Math.max(0, c.occupancy + num));
        return {
          ...c,
          occupancy: newOcc,
          status: newOcc >= c.capacity ? 'Full' : 'Open'
        };
      }
      return c;
    }));
    setAddOccupantsNum('');
  };

  const handleToggleStatus = () => {
    setCenters(prev => prev.map(c => {
      if (c.id === selectedId) {
        const nextStatus = c.status === 'Open' ? 'Full' : 'Open';
        return {
          ...c,
          status: nextStatus,
          occupancy: nextStatus === 'Full' ? c.capacity : c.occupancy
        };
      }
      return c;
    }));
  };

  const filteredCenters = centers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.barangay.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter ? c.status === statusFilter : true;
    const matchesBarangay = barangayFilter ? c.barangay === barangayFilter : true;
    return matchesSearch && matchesStatus && matchesBarangay;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Open': return { color: '#16a34a', bg: '#f0fdf4' };
      case 'Full': return { color: '#dc2626', bg: '#fef2f2' };
      default: return { color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  const getOccupancyPercent = (occ, cap) => {
    return Math.round((occ / cap) * 100);
  };

  const getProgressBarColor = (percent) => {
    if (percent >= 100) return '#dc2626'; // Red
    if (percent >= 80) return '#ea580c';  // Orange
    return '#16a34a';                     // Green
  };

  const getAmenityIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('clinic') || n.includes('aid')) return <Heart size={14} style={{ color: '#dc2626' }} />;
    if (n.includes('kitchen') || n.includes('food')) return <Coffee size={14} style={{ color: '#854d0e' }} />;
    if (n.includes('water')) return <Droplet size={14} style={{ color: '#0284c7' }} />;
    if (n.includes('generator') || n.includes('power')) return <Zap size={14} style={{ color: '#eab308' }} />;
    return <Check size={14} style={{ color: '#16a34a' }} />;
  };

  return (
    <div className="main-view">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-container">
          <h1>Evacuation Centers</h1>
          <span className="view-subtitle">Last updated: June 18, 2026 • 08:42 AM</span>
        </div>
        <button className="btn-refresh" onClick={handleRefresh}>
          <RefreshCw size={13} className={isRefreshSpinning ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="stations-split-layout">

        {/* Left Side: Evacuation Centers List */}
        <div className="stations-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="stations-card-title">List of Evacuation Centers</h2>
          </div>

          {/* Search & Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="Search for an evacuation center..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="time-range-select"
              style={{ padding: '10px 14px', borderRadius: '10px', width: '130px', fontSize: '13px' }}
            >
              <option value="">Status...</option>
              <option value="Open">Open</option>
              <option value="Full">Full</option>
            </select>

            <select 
              value={barangayFilter}
              onChange={(e) => setBarangayFilter(e.target.value)}
              className="time-range-select"
              style={{ padding: '10px 14px', borderRadius: '10px', width: '130px', fontSize: '13px' }}
            >
              <option value="">Barangay...</option>
              <option value="Malanday">Malanday</option>
              <option value="Nangka">Nangka</option>
              <option value="Sto. Niño">Sto. Niño</option>
            </select>
          </div>

          {/* Evacuation Centers Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Center</th>
                  <th>Status</th>
                  <th>Capacity</th>
                  <th>Occupancy</th>
                </tr>
              </thead>
              <tbody>
                {filteredCenters.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-light)' }}>
                      No evacuation centers found.
                    </td>
                  </tr>
                ) : (
                  filteredCenters.map((c) => {
                    const statusStyle = getStatusColor(c.status);
                    return (
                      <tr 
                        key={c.id} 
                        className={selectedId === c.id ? 'selected' : ''}
                        onClick={() => setSelectedId(c.id)}
                      >
                        <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{c.name}</td>
                        <td>
                          <span style={{ 
                            color: statusStyle.color, 
                            backgroundColor: statusStyle.bg, 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            fontWeight: '700' 
                          }}>
                            {c.status}
                          </span>
                        </td>
                        <td>{c.capacity}</td>
                        <td>
                          <span style={{ 
                            fontWeight: '600',
                            color: c.occupancy >= c.capacity ? '#dc2626' : 'var(--text-muted)'
                          }}>
                            {c.occupancy}
                          </span>
                          <span style={{ color: 'var(--text-light)', fontSize: '11px', marginLeft: '4px' }}>
                            ({getOccupancyPercent(c.occupancy, c.capacity)}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-footer">
            <span>{filteredCenters.length} of {centers.length} records</span>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled><ChevronLeft size={14} /></button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn" disabled><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Right Side: Evacuation Center Details */}
        <div className="details-panel">
          {!selectedCenter ? (
            <div className="details-empty-state">
              <Shield size={32} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
              <p>Select an evacuation center first to view details.</p>
            </div>
          ) : (
            <div className="details-content">
              <div className="details-header">
                <span className="details-station-name">{selectedCenter.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '13px', color: 'var(--text-muted)' }}>
                  <MapPin size={14} style={{ color: 'var(--color-brand)' }} />
                  <span>Barangay {selectedCenter.barangay}</span>
                </div>
              </div>

              {/* Occupancy Progress Bar */}
              <div style={{ backgroundColor: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid var(--color-border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '700', marginBottom: '8px' }}>
                  <span style={{ color: 'var(--text-main)' }}>Center Occupancy</span>
                  <span style={{ color: getProgressBarColor(getOccupancyPercent(selectedCenter.occupancy, selectedCenter.capacity)) }}>
                    {getOccupancyPercent(selectedCenter.occupancy, selectedCenter.capacity)}% Full
                  </span>
                </div>
                <div style={{ height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    backgroundColor: getProgressBarColor(getOccupancyPercent(selectedCenter.occupancy, selectedCenter.capacity)),
                    width: `${getOccupancyPercent(selectedCenter.occupancy, selectedCenter.capacity)}%`,
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-light)', marginTop: '6px' }}>
                  <span>{selectedCenter.occupancy} Evacuees</span>
                  <span>{selectedCenter.capacity} Capacity limit</span>
                </div>
              </div>

              {/* Details Grid */}
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Current Status</span>
                  <span style={{ 
                    display: 'inline-block',
                    color: getStatusColor(selectedCenter.status).color, 
                    fontWeight: '700',
                    fontSize: '13px',
                    marginTop: '2px'
                  }}>
                    {selectedCenter.status === 'Full' ? '⚠️ At Capacity (Full)' : '✓ Open & Accepting'}
                  </span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Designated Manager</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>
                    <Building2 size={12} />
                    <span>{selectedCenter.manager}</span>
                  </div>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Coordinator Contact Hotline</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700', color: 'var(--text-main)', marginTop: '2px' }}>
                    <Phone size={13} style={{ color: 'var(--color-brand)' }} />
                    <span style={{ fontFamily: 'monospace' }}>{selectedCenter.contact}</span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <span className="detail-label" style={{ display: 'block', marginBottom: '8px' }}>Available Center Amenities</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  {selectedCenter.amenities.map((amenity, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)' }}>
                      {getAmenityIcon(amenity)}
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Simulation Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <form onSubmit={handleAddOccupants} style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="number"
                    className="form-input"
                    placeholder="Enter evacuees delta (e.g. 50 or -30).."
                    value={addOccupantsNum}
                    onChange={(e) => setAddOccupantsNum(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                  />
                  <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '12px', whiteSpace: 'nowrap' }}>
                    Record Occupants
                  </button>
                </form>

                <button 
                  className="action-row-btn"
                  onClick={handleToggleStatus}
                  style={{ 
                    justifyContent: 'center', 
                    gap: '8px',
                    borderColor: selectedCenter.status === 'Full' ? '#cbd5e1' : '#fca5a5',
                    backgroundColor: selectedCenter.status === 'Full' ? '#ffffff' : '#fef2f2',
                    color: selectedCenter.status === 'Full' ? 'var(--text-muted)' : '#dc2626'
                  }}
                >
                  {selectedCenter.status === 'Full' ? <Check size={14} /> : <ShieldAlert size={14} />}
                  <span>{selectedCenter.status === 'Full' ? 'Mark Center as Open' : 'Mark Center as Full'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
