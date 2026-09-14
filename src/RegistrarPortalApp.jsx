import React, { useState } from 'react';
import RegistrarCourses from './components/RegistrarCourses';
import RegistrarStudents from './components/RegistrarStudents';
import { Building2, Settings, Users, LogOut, ShieldAlert } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function RegistrarPortalApp({ session, onSwitchPortal }) {
  const [activeView, setActiveView] = useState('registrar-courses');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'registrar.admin@university.edu.ph';
  const initials = userEmail.substring(0, 2).toUpperCase();

  return (
    <div className="app-container" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Registrar Intranet Dedicated Header */}
      <header className="app-header" style={{ backgroundColor: '#0f172a', borderBottom: '1px solid #1e293b', padding: '0 24px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#ffffff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', backgroundColor: '#3b82f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Building2 size={24} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>
              <span style={{ color: '#60a5fa' }}>AUCRES</span> <span style={{ color: '#34d399' }}>Registrar Intranet</span>
            </div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>Administrative Management System</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Switcher Button for Testing */}
          <button
            onClick={onSwitchPortal}
            style={{
              padding: '6px 12px',
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#93c5fd',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🎓 Switch to Student Portal
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={handleLogout} title="Sign Out">
            <div style={{ backgroundColor: '#3b82f6', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{initials}</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>{userEmail}</span>
            <LogOut size={16} style={{ color: '#f87171' }} />
          </div>
        </div>
      </header>

      {/* Main Registrar Layout */}
      <div className="app-content" style={{ display: 'flex' }}>
        
        {/* Dedicated Registrar Sidebar */}
        <aside style={{ width: '240px', backgroundColor: '#1e293b', padding: '20px 12px', minHeight: 'calc(100vh - 64px)', color: '#f8fafc' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
            Registrar Console
          </div>

          <div 
            onClick={() => setActiveView('registrar-courses')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '4px', backgroundColor: activeView === 'registrar-courses' ? '#334155' : 'transparent', color: activeView === 'registrar-courses' ? '#60a5fa' : '#94a3b8' }}
          >
            <Settings size={18} />
            <span>Course Offerings</span>
          </div>

          <div 
            onClick={() => setActiveView('registrar-students')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '4px', backgroundColor: activeView === 'registrar-students' ? '#334155' : 'transparent', color: activeView === 'registrar-students' ? '#60a5fa' : '#94a3b8' }}
          >
            <Users size={18} />
            <span>Master Enrollment List</span>
          </div>
        </aside>

        {/* Registrar Active View Area */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeView === 'registrar-courses' ? (
            <RegistrarCourses />
          ) : (
            <RegistrarStudents />
          )}
        </main>
      </div>

    </div>
  );
}
