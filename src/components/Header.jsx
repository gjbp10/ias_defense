import React from 'react';
import { MapPin, Waves, ChevronDown } from 'lucide-react';

export default function Header() {
  return (
    <header className="app-header">
      <div className="logo-section">
        <div className="logo-text">
          {/* Map Pin + River Waves Icon combination */}
          <div style={{ display: 'flex', alignItems: 'center', marginRight: '8px', color: '#0284c7' }}>
            <MapPin size={24} style={{ marginRight: '-12px', zIndex: 2 }} />
            <Waves size={16} style={{ marginTop: '12px', color: '#10b981', zIndex: 1 }} />
          </div>
          Rescu<span>AR</span>
        </div>
      </div>
      
      <div className="user-profile-badge">
        <div className="avatar-circle">BP</div>
        <div className="user-info">
          <span className="user-name">Brian Lawrence Pasco</span>
          <span className="user-email">qblcpasco@tip.edu.ph</span>
        </div>
        <ChevronDown size={16} className="dropdown-arrow" />
      </div>
    </header>
  );
}
