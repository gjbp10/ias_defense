import React, { useState } from 'react';
import { 
  RefreshCw, 
  Droplet, 
  Waves, 
  AlertTriangle, 
  Info, 
  BarChart2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

// Mock station data matching the screenshot
const INITIAL_STATIONS = [
  { id: 1, name: 'Rodriguez Station', level: 27.5, status: 'Normal' },
  { id: 2, name: 'San Jose Station', level: 21.5, status: 'Normal' },
  { id: 3, name: 'Batasan Station', level: 14.6, status: 'Normal' },
  { id: 4, name: 'Nangka Station', level: 15.7, status: 'Normal' },
  { id: 5, name: 'Tumana Station', level: 12.0, status: 'Normal' },
  { id: 6, name: 'Sto. Niño Station', level: 11.7, status: 'Normal' }
];

export default function MonitoringStations() {
  const [stations, setStations] = useState(INITIAL_STATIONS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('June 18, 2026 • 08:42 AM');
  const [showSummary, setShowSummary] = useState(true);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      const now = new Date();
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateStr = now.toLocaleDateString('en-US', options);
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setLastUpdated(`${dateStr} • ${timeStr}`);
      
      // Keep levels aligned with initial but simulate slight variance if desired, 
      // or just refresh timestamp. Let's keep it clean.
    }, 800);
  };

  // Sorting Handler
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    } else if (sortConfig.key === key && sortConfig.direction === 'descending') {
      direction = null; // Reset to default order
    }
    setSortConfig({ key, direction });
  };

  // Get Sorted Stations
  const getSortedStations = () => {
    if (!sortConfig.key || !sortConfig.direction) {
      return [...stations];
    }
    return [...stations].sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }

      if (valA < valB) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (valA > valB) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown size={12} className="sort-icon-inactive" />;
    }
    if (sortConfig.direction === 'ascending') {
      return <ArrowUp size={12} className="sort-icon-active" />;
    }
    return <ArrowDown size={12} className="sort-icon-active" />;
  };

  // Sort bar chart data by level descending as shown in the screenshot
  const barChartData = [...stations].sort((a, b) => b.level - a.level);
  const sortedStations = getSortedStations();

  return (
    <div className="main-view">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-container">
          <h1>Monitoring Stations</h1>
          <span className="view-subtitle">Last updated: {lastUpdated}</span>
        </div>
        <button 
          className="btn-refresh" 
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Point Cards Grid */}
      <div className="station-points-grid">
        {/* Card 1: Tumana */}
        <div className="point-card">
          <div className="point-card-left">
            <span className="point-card-title">TUMANA MONITORING POINT</span>
            <span className="point-card-value">12.00 m</span>
            <div className="point-card-badge-row">
              <span className="status-badge-pill normal">Normal</span>
              <span className="live-feed-text">
                <span className="live-feed-dot"></span>Live Feed
              </span>
            </div>
          </div>
          <div className="point-card-right">
            <div className="point-card-icon-wrapper droplet">
              <Droplet size={20} />
            </div>
          </div>
        </div>

        {/* Card 2: Nangka */}
        <div className="point-card">
          <div className="point-card-left">
            <span className="point-card-title">NANGKA MONITORING POINT</span>
            <span className="point-card-value">15.70 m</span>
            <div className="point-card-badge-row">
              <span className="status-badge-pill normal">Normal</span>
              <span className="live-feed-text">
                <span className="live-feed-dot"></span>Live Feed
              </span>
            </div>
          </div>
          <div className="point-card-right">
            <div className="point-card-icon-wrapper waves">
              <Waves size={20} />
            </div>
          </div>
        </div>

        {/* Card 3: Sto. Niño */}
        <div className="point-card">
          <div className="point-card-left">
            <span className="point-card-title">STO. NIÑO (MAIN NODE)</span>
            <span className="point-card-value">11.70 m</span>
            <div className="point-card-badge-row">
              <span className="status-badge-pill normal">Normal</span>
              <span className="live-feed-text">
                <span className="live-feed-dot"></span>Live Feed
              </span>
            </div>
          </div>
          <div className="point-card-right">
            <div className="point-card-icon-wrapper alert">
              <AlertTriangle size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="stations-split-layout">
        {/* Left Side: Levels Bar Chart */}
        <div className="stations-card">
          <h2 className="stations-card-title">Station Levels vs warning Thresholds</h2>
          
          <div className="chart-container-wrapper" style={{ height: '300px', marginTop: '16px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: '500' }}
                />
                <YAxis 
                  domain={[0, 30]}
                  ticks={[0, 10, 20]}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: 'var(--text-light)', fontSize: 11 }}
                  label={{ 
                    value: 'Water Gauge Level (meters)', 
                    angle: -90, 
                    position: 'insideLeft', 
                    style: { textAnchor: 'middle', fill: 'var(--text-muted)', fontSize: 11, fontWeight: '500' },
                    offset: 0
                  }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(241, 245, 249, 0.5)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{
                          backgroundColor: '#ffffff',
                          border: '1px solid var(--color-border)',
                          padding: '8px 12px',
                          borderRadius: 'var(--radius-md)',
                          boxShadow: 'var(--shadow-lg)',
                          fontSize: '12px'
                        }}>
                          <p style={{ fontWeight: '700', color: 'var(--text-main)' }}>{payload[0].payload.name}</p>
                          <p style={{ color: '#3b82f6', fontWeight: '600', marginTop: '4px' }}>
                            Level: {payload[0].value.toFixed(1)} m
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey="level" 
                  fill="#3b82f6" 
                  barSize={36}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="x-axis-title-centered">
            Gaging Network Station Node Location
          </div>

          <div className="graph-type-label">
            <BarChart2 size={14} />
            <span>Graph Type: Bar Chart</span>
          </div>

          <div className="checkbox-wrapper">
            <input 
              type="checkbox" 
              id="show-summary" 
              checked={showSummary} 
              onChange={(e) => setShowSummary(e.target.checked)} 
            />
            <label htmlFor="show-summary">Show Hydrological Summary</label>
          </div>

          {showSummary && (
            <div className="hydrological-summary-box">
              <Info size={16} className="summary-icon" />
              <div>
                <div className="summary-title">Hydrological Summary</div>
                <div className="summary-text">
                  The river channels are within safe operational bounds. Water flow is running normally and there is no active threat of overflow.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Telemetry Node Database */}
        <div className="stations-card">
          <h2 className="stations-card-title">Telemetry Node Database</h2>
          
          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('name')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>RIVER</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('level')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>LEVEL</span>
                      {getSortIcon('level')}
                    </div>
                  </th>
                  <th onClick={() => handleSort('status')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>STATUS</span>
                      {getSortIcon('status')}
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStations.map((station) => (
                  <tr key={station.id} className="table-row-hover">
                    <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{station.name}</td>
                    <td style={{ fontWeight: '500' }}>{station.level.toFixed(1)}</td>
                    <td>
                      <span className={`status-badge ${station.status.toLowerCase()}`}>
                        {station.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
