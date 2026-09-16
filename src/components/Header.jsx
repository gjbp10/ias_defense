import React from 'react';
import { GraduationCap, ShieldCheck, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Header({ session }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'student.aucres@university.edu.ph';
  const initials = userEmail.substring(0, 2).toUpperCase();

  return (
    <header className="app-header">
      <div className="logo-section">
        <div className="logo-text" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '38px', 
            height: '38px', 
            backgroundColor: '#1e3a8a', 
            borderRadius: '8px', 
            color: '#ffffff' 
          }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <span style={{ color: '#1e3a8a', fontWeight: 800 }}>AUC</span>
            <span style={{ color: '#059669', fontWeight: 800 }}>RES</span>
          </div>
        </div>
       
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div className="user-profile-badge" onClick={handleLogout} title="Sign Out">
          <div className="avatar-circle" style={{ backgroundColor: '#1e3a8a' }}>{initials}</div>
          <div className="user-info">
            <span className="user-name">User Account</span>
            <span className="user-email">{userEmail}</span>
          </div>
          <LogOut size={16} className="dropdown-arrow" style={{ marginLeft: '8px', color: '#ef4444' }} />
        </div>
      </div>
    </header>
  );
}
