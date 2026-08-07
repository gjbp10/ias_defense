import React, { useState } from 'react';
import { MapPin, Waves, ChevronDown, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Header({ user }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const getInitials = (email) => {
    if (!email) return 'U';
    return email.charAt(0).toUpperCase();
  };

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
      
      <div style={{ position: 'relative' }}>
        <div 
          className="user-profile-badge"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="avatar-circle">{getInitials(user?.email)}</div>
          <div className="user-info">
            <span className="user-name">{user?.email ? user.email.split('@')[0] : 'User'}</span>
            <span className="user-email">{user?.email || 'user@example.com'}</span>
          </div>
          <ChevronDown size={16} className="dropdown-arrow" />
        </div>

        {isDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            backgroundColor: '#ffffff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
            padding: '8px',
            minWidth: '200px',
            zIndex: 100
          }}>
            <button 
              onClick={handleSignOut}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--color-offline)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                borderRadius: 'var(--radius-sm)',
                transition: 'background-color 0.2s',
                textAlign: 'left'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--color-offline-bg)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
