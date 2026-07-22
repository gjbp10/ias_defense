import React from 'react';
import { 
  Radio, 
  Waves, 
  ShieldAlert, 
  Users, 
  Bell, 
  MapPin,
  CheckCircle,
  BatteryCharging
} from 'lucide-react';

export default function Dashboard({ onViewChange }) {
  const stats = [
    { 
      label: 'Monitoring Stations', 
      value: '4 Stations', 
      sub: '3 Online • 1 Offline', 
      icon: <Radio size={24} />, 
      color: '#0284c7', 
      bg: 'rgba(2, 132, 199, 0.1)',
      target: 'monitoring-stations'
    },
    { 
      label: 'Marikina River Level', 
      value: '16.2 meters', 
      sub: 'Alert Level 2 (Rising)', 
      icon: <Waves size={24} />, 
      color: '#ea580c', 
      bg: 'rgba(234, 88, 12, 0.1)',
      target: 'monitoring-river-level'
    },
    { 
      label: 'Inundation Threat', 
      value: 'Medium Risk', 
      sub: '2 Sectors at Risk', 
      icon: <ShieldAlert size={24} />, 
      color: '#dc2626', 
      bg: 'rgba(220, 38, 38, 0.1)',
      target: 'monitoring-inundation'
    },
    { 
      label: 'Community Reach', 
      value: '1,420 Residents', 
      sub: '24 Broadcast Coordinators', 
      icon: <Users size={24} />, 
      color: '#16a34a', 
      bg: 'rgba(22, 163, 74, 0.1)',
      target: 'community-residents'
    }
  ];

  const logs = [
    { time: '08:42 AM', type: 'warning', text: 'Marikina River water level reading updated to 16.20m (Alert Level 2).' },
    { time: '08:30 AM', type: 'info', text: 'Resident Notification Broadcast system initialized for Tumana & Nangka sectors.' },
    { time: '08:15 AM', type: 'alert', text: 'Low Battery Alert: Station 4 (Provident) reported at 12%. Connection offline.' },
    { time: '07:00 AM', type: 'system', text: 'Daily diagnostic check: All primary telemetry subsystems operating within nominal limits.' },
    { time: '06:30 AM', type: 'info', text: 'Station 2 (Nangka) reported a water level delta of +0.45m in the last 60 minutes.' }
  ];

  return (
    <div className="main-view">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-container">
          <h1>Dashboard Overview</h1>
          <span className="view-subtitle">Real-time status of Marikina River early warning telemetry systems</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="dashboard-grid">
        {stats.map((stat, idx) => (
          <div 
            key={idx} 
            className="dashboard-card" 
            style={{ cursor: 'pointer' }}
            onClick={() => onViewChange(stat.target)}
          >
            <div className="dashboard-card-icon" style={{ backgroundColor: stat.bg, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="dashboard-card-info">
              <span className="dashboard-card-num">{stat.value}</span>
              <span className="dashboard-card-lbl" style={{ fontWeight: '600', color: '#1f2937', marginBottom: '2px' }}>{stat.label}</span>
              <span className="dashboard-card-lbl">{stat.sub}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Layout Splitting */}
      <div className="stations-split-layout">
        
        {/* Left Side: Recent System Events Timeline */}
        <div className="stations-card">
          <h2 className="stations-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} style={{ color: 'var(--color-brand)' }} />
            <span>Recent System Events</span>
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px' }}>
            {logs.map((log, idx) => (
              <div 
                key={idx} 
                style={{ 
                  display: 'flex', 
                  gap: '16px', 
                  paddingBottom: '16px', 
                  borderBottom: idx === logs.length - 1 ? 'none' : '1px solid var(--color-border-light)' 
                }}
              >
                <div style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  color: 'var(--text-light)', 
                  width: '65px', 
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  {log.time}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: log.type === 'alert' ? 'var(--color-offline)' : log.type === 'warning' ? 'var(--color-alert-2)' : 'var(--text-main)' 
                  }}>
                    {log.type === 'alert' ? 'Telemetry Alert' : log.type === 'warning' ? 'Hydrology Warning' : 'System Information'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                    {log.text}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Quick Reference Info Card */}
        <div className="stations-card">
          <h2 className="stations-card-title">Telemetry Reference</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '8px', fontSize: '13px', lineHeight: '1.5', color: 'var(--text-muted)' }}>
            <p>
              The <strong>RescuAR</strong> system automatically aggregates telemetry data from ultrasonic and radar water level sensors positioned along the Marikina River.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MapPin size={16} style={{ color: 'var(--color-brand)' }} />
                <span>Primary flow checkpoint: <strong>Santo Niño Station</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle size={16} style={{ color: 'var(--color-online)' }} />
                <span>API Telemetry Frequency: <strong>Every 10 minutes</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BatteryCharging size={16} style={{ color: '#eab308' }} />
                <span>Secondary power source: <strong>Solar photovoltaic array</strong></span>
              </div>
            </div>
            <p style={{ fontSize: '12px', borderTop: '1px solid var(--color-border)', paddingTop: '12px', color: 'var(--text-light)' }}>
              For manual data override or to calibrate water level readings, please visit the System Configuration section.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
