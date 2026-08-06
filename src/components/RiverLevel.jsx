import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { calculateAlertStatus } from '../utils/waterLevelUtils';
import {
  RefreshCw,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Megaphone,
  Bell,
  Compass,
  Waves,
  Clock,
  Activity,
  Zap,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea
} from 'recharts';

// 24 Hour Mock Telemetry Data
const MOCK_DATA_24H = [
  { time: '00:00', observed: 10.5, predicted: 10.2 },
  { time: '02:00', observed: 11.0, predicted: 10.7 },
  { time: '04:00', observed: 11.8, predicted: 11.3 },
  { time: '06:00', observed: 12.9, predicted: 12.3 },
  { time: '08:00', observed: 14.2, predicted: 13.5 },
  { time: '10:00', observed: 15.3, predicted: 14.6 },
  { time: '12:00', observed: 16.2, predicted: 15.4 }, // Current Peak
  { time: '14:00', observed: null, predicted: 16.1 },
  { time: '16:00', observed: null, predicted: 16.6 },
  { time: '18:00', observed: null, predicted: 17.1 },
  { time: '20:00', observed: null, predicted: 17.4 },
  { time: '22:00', observed: null, predicted: 17.6 }
];

// 7 Day Historical Data
const MOCK_DATA_7D = [
  { time: 'Mon', observed: 12.1, predicted: 12.3 },
  { time: 'Tue', observed: 13.5, predicted: 13.2 },
  { time: 'Wed', observed: 14.8, predicted: 14.9 },
  { time: 'Thu', observed: 16.2, predicted: 16.0 },
  { time: 'Fri', observed: 15.1, predicted: 15.3 },
  { time: 'Sat', observed: 14.0, predicted: 14.2 },
  { time: 'Sun', observed: 13.2, predicted: 13.5 }
];

export default function RiverLevel({ onActionClick }) {
  const [timeRange, setTimeRange] = useState('24h');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('Loading live data...');
  const [currentLevel, setCurrentLevel] = useState(16.2);
  const [currentAlert, setCurrentAlert] = useState(calculateAlertStatus(16.2));

  const fetchStoNinoData = async () => {
    try {
      const { data, error } = await supabase
        .from('monitoring_stations')
        .select('*')
        .ilike('station_name', '%Sto%')
        .single();

      if (data) {
        const level = Number(data.level);
        setCurrentLevel(level);
        setCurrentAlert(calculateAlertStatus(level, data.station_name));
        
        const latestTimestamp = data.updated_at ? new Date(data.updated_at) : new Date();
        const dateStr = latestTimestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = latestTimestamp.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        setLastUpdated(`${dateStr} • ${timeStr}`);
      }
    } catch (err) {
      console.error('Error fetching Sto. Niño station telemetry:', err);
    }
  };

  useEffect(() => {
    fetchStoNinoData();

    const channel = supabase
      .channel('river-level-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'monitoring_stations' }, () => {
        fetchStoNinoData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const chartData = timeRange === '24h' ? MOCK_DATA_24H : MOCK_DATA_7D;

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStoNinoData().finally(() => {
      setIsRefreshing(false);
    });
  };

  // Glassmorphic Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const obsVal = payload.find(p => p.dataKey === 'observed')?.value;
      const predVal = payload.find(p => p.dataKey === 'predicted')?.value;
      const currentVal = obsVal ?? predVal ?? 0;

      let statusText = 'Normal Level';
      let statusColor = '#16a34a';
      if (currentVal >= 18) {
        statusText = 'Alarm Level 3 (Evacuation)';
        statusColor = '#dc2626';
      } else if (currentVal >= 16) {
        statusText = 'Alarm Level 2 (Preparation)';
        statusColor = '#ea580c';
      } else if (currentVal >= 15) {
        statusText = 'Alarm Level 1 (Monitoring)';
        statusColor = '#ca8a04';
      }

      return (
        <div className="river-chart-glass-tooltip">
          <div className="tooltip-header">
            <Clock size={12} />
            <span>Time Stamp: {label}</span>
          </div>

          <div className="tooltip-metrics">
            {obsVal !== undefined && obsVal !== null && (
              <div className="tooltip-row observed">
                <span className="tooltip-dot blue"></span>
                <span className="tooltip-label">Observed Level:</span>
                <span className="tooltip-value">{obsVal.toFixed(1)} m</span>
              </div>
            )}

            {predVal !== undefined && predVal !== null && (
              <div className="tooltip-row predicted">
                <span className="tooltip-dot orange"></span>
                <span className="tooltip-label">Predicted Forecast:</span>
                <span className="tooltip-value">{predVal.toFixed(1)} m</span>
              </div>
            )}
          </div>

          <div
            className="tooltip-footer-badge"
            style={{ color: statusColor, backgroundColor: `${statusColor}15`, borderColor: `${statusColor}30` }}
          >
            {statusText}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="river-level-view">
      {/* Page Header */}
      <div className="river-header">
        <div className="title-group">
          <div className="title-row">
            <h1 className="river-title">Marikina River Level</h1>
            <span className="live-telemetry-badge">
              <span className="pulse-dot-green"></span>
              Sto. Niño Telemetry Active
            </span>
          </div>
          <p className="river-subtitle">Last updated: {lastUpdated}</p>
        </div>

        <div className="header-actions">
          <button
            className="refresh-btn"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-icon' : ''} />
            <span>Refresh Telemetry</span>
          </button>
        </div>
      </div>

      {/* Top 3 Cards Grid */}
      <div className="river-metrics-grid">

        {/* Card 1: Current Level */}
        <div className="river-card current-level-card">
          <div className="card-top-label">
            <Waves size={16} className="text-brand" />
            <span>CURRENT WATER LEVEL</span>
          </div>

          <div className="level-hero-group">
            <div className="hero-number-wrapper">
              <span className="hero-number">{currentLevel.toFixed(1)}</span>
              <span className="hero-unit">meters</span>
            </div>

            <div className="trend-chip rising">
              <ArrowUpRight size={16} />
              <span>Sto. Niño Gauge</span>
            </div>
          </div>

          <div 
            className="level-status-pill"
            style={{ backgroundColor: `${currentAlert.color}15`, color: currentAlert.color, borderColor: `${currentAlert.color}40`, fontWeight: '700' }}
          >
            <AlertTriangle size={14} />
            <span>{currentAlert.label.toUpperCase()}</span>
          </div>
        </div>

        {/* Card 2: Threshold Gauge Breakdown */}
        <div className="river-card thresholds-card">
          <div className="card-top-label">
            <ShieldAlert size={16} className="text-brand" />
            <span>MARIKINA ALERT THRESHOLDS</span>
          </div>

          <div className="thresholds-progress-stack">
            {/* Level 1 */}
            <div className="threshold-bar-item level-1">
              <div className="threshold-info">
                <span className="thresh-name">Alert Level 1 (Alarm)</span>
                <span className="thresh-val">15.0 meters</span>
              </div>
              <div className="thresh-track">
                <div className="thresh-fill fill-level-1" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Level 2 */}
            <div className="threshold-bar-item level-2 active">
              <div className="threshold-info">
                <span className="thresh-name">
                  Alert Level 2 (Prepare)
                  <span className="active-tag">CURRENT</span>
                </span>
                <span className="thresh-val">16.0 meters</span>
              </div>
              <div className="thresh-track">
                <div className="thresh-fill fill-level-2" style={{ width: '100%' }}></div>
              </div>
            </div>

            {/* Level 3 */}
            <div className="threshold-bar-item level-3">
              <div className="threshold-info">
                <span className="thresh-name">Alert Level 3 (Evacuate)</span>
                <span className="thresh-val">18.0 meters</span>
              </div>
              <div className="thresh-track">
                <div className="thresh-fill fill-level-3" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Action Center */}
        <div className="river-card actions-card">
          <div className="card-top-label">
            <Zap size={16} className="text-brand" />
            <span>DISPATCH & ACTIONS</span>
          </div>

          <div className="action-buttons-stack">
            <button className="action-tile advisory" onClick={() => onActionClick('advisory')}>
              <div className="tile-icon-box blue">
                <Megaphone size={16} />
              </div>
              <div className="tile-text">
                <span className="tile-title">Generate Advisory</span>
                <span className="tile-sub">Draft public flood warning</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>

            <button className="action-tile notify" onClick={() => onActionClick('notify')}>
              <div className="tile-icon-box amber">
                <Bell size={16} />
              </div>
              <div className="tile-text">
                <span className="tile-title">Notify Residents</span>
                <span className="tile-sub">Send SMS & push broadcast</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>

            <button className="action-tile predict" onClick={() => onActionClick('predict')}>
              <div className="tile-icon-box teal">
                <Compass size={16} />
              </div>
              <div className="tile-text">
                <span className="tile-title">Run Inundation Sim</span>
                <span className="tile-sub">Model affected barangays</span>
              </div>
              <ChevronRight size={16} className="tile-arrow" />
            </button>
          </div>
        </div>

      </div>

      {/* Main Hydrodynamic Graph Card */}
      <div className="river-card chart-main-card">
        <div className="chart-header-row">
          <div className="chart-title-group">
            <Activity size={18} className="text-brand" />
            <div>
              <h2 className="chart-heading">Hydrodynamic Telemetry & 12-Hour Forecast</h2>
              <span className="chart-subheading">Sto. Niño Monitoring Station • Real-time stream gauge data</span>
            </div>
          </div>

          <div className="chart-controls">
            <div className="pill-selector">
              <button
                className={`pill-btn ${timeRange === '24h' ? 'active' : ''}`}
                onClick={() => setTimeRange('24h')}
              >
                24-Hour View
              </button>
              <button
                className={`pill-btn ${timeRange === '7d' ? 'active' : ''}`}
                onClick={() => setTimeRange('7d')}
              >
                7-Day Trend
              </button>
            </div>
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="chart-canvas-container">
          <ResponsiveContainer width="100%" height={380}>
            <AreaChart
              data={chartData}
              margin={{ top: 20, right: 35, left: 0, bottom: 10 }}
            >
              <defs>
                {/* Observed Water Gradient */}
                <linearGradient id="gradientObserved" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>

                {/* Predicted Water Gradient */}
                <linearGradient id="gradientPredicted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.01} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />

              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={{ stroke: '#cbd5e1' }}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dy={8}
              />

              <YAxis
                domain={[10, 24]}
                ticks={[10, 12, 14, 16, 18, 20, 22, 24]}
                tickFormatter={(val) => `${val}m`}
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
                dx={-6}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Critical Danger Reference Areas */}
              <ReferenceArea y1={18} y2={24} fill="#ef4444" fillOpacity={0.04} />

              {/* Threshold Lines */}
              <ReferenceLine
                y={15}
                stroke="#ca8a04"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ value: 'ALARM 1 (15m)', position: 'right', fill: '#ca8a04', fontSize: 11, fontWeight: '800' }}
              />
              <ReferenceLine
                y={16}
                stroke="#ea580c"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'ALARM 2 (16m)', position: 'right', fill: '#ea580c', fontSize: 11, fontWeight: '800' }}
              />
              <ReferenceLine
                y={18}
                stroke="#dc2626"
                strokeDasharray="6 4"
                strokeWidth={2}
                label={{ value: 'ALARM 3 (18m)', position: 'right', fill: '#dc2626', fontSize: 11, fontWeight: '800' }}
              />

              {/* Observed Fill & Line */}
              <Area
                type="monotone"
                dataKey="observed"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#gradientObserved)"
                dot={{ r: 5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 3 }}
                connectNulls={false}
              />

              {/* Predicted Forecast Fill & Line */}
              <Area
                type="monotone"
                dataKey="predicted"
                stroke="#f97316"
                strokeWidth={2.5}
                strokeDasharray="6 6"
                fillOpacity={1}
                fill="url(#gradientPredicted)"
                dot={{ r: 4, fill: '#f97316', stroke: '#ffffff', strokeWidth: 2 }}
                activeDot={{ r: 7, fill: '#f97316', stroke: '#ffffff', strokeWidth: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Modern Interactive Chart Footer Legend */}
        <div className="chart-footer-bar">
          <div className="chart-legend-items">
            <div className="legend-chip">
              <span className="chip-indicator solid-blue"></span>
              <span className="chip-text">Observed Water Level (Gauge)</span>
            </div>
            <div className="legend-chip">
              <span className="chip-indicator dashed-orange"></span>
              <span className="chip-text">AI Hydrodynamic Forecast</span>
            </div>
          </div>

          <div className="chart-info-note">
            <Info size={13} />
            <span>Data synchronized with Marikina City Disaster Risk Reduction & Management Office (MCDRRMO)</span>
          </div>
        </div>

      </div>
    </div>
  );
}
