import React, { useState } from 'react';
import StudentCourseRegistration from './components/StudentCourseRegistration';
import StudentRecords from './components/StudentRecords';
import Header from './components/Header';
import { LayoutDashboard, BookOpen, UserCheck, LogOut, GraduationCap } from 'lucide-react';
import { supabase } from './supabaseClient';

export default function StudentPortalApp({ session, onSwitchPortal }) {
  const [activeView, setActiveView] = useState('academic-courses');

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const userEmail = session?.user?.email || 'student.aucres@university.edu.ph';
  const initials = userEmail.substring(0, 2).toUpperCase();

  return (
    <div className="app-container" style={{ backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Student Portal Dedicated Header */}
      <header className="app-header" style={{ backgroundColor: '#ffffff', borderBottom: '1px solid #e2e8f0', padding: '0 24px', height: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '38px', height: '38px', backgroundColor: '#1e3a8a', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <GraduationCap size={24} />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 800 }}>
              <span style={{ color: '#1e3a8a' }}>AUCRES</span> <span style={{ color: '#059669' }}>Student Portal</span>
            </div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Independent Student Services System</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Portal Switcher Button for Testing */}
          <button
            onClick={onSwitchPortal}
            style={{
              padding: '6px 12px',
              backgroundColor: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px',
              color: '#1e40af',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            🏛️ Switch to Registrar Admin Portal
          </button>

          <div className="user-profile-badge" onClick={handleLogout} title="Sign Out" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <div className="avatar-circle" style={{ backgroundColor: '#1e3a8a', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 700 }}>{initials}</div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155' }}>{userEmail}</span>
            <LogOut size={16} style={{ color: '#ef4444' }} />
          </div>
        </div>
      </header>

      {/* Main Student Portal Layout */}
      <div className="app-content" style={{ display: 'flex' }}>
        
        {/* Dedicated Student Sidebar */}
        <aside className="app-sidebar" style={{ width: '240px', backgroundColor: '#ffffff', borderRight: '1px solid #e2e8f0', padding: '20px 12px', minHeight: 'calc(100vh - 64px)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
            Student Navigation
          </div>

          <div 
            className={`sidebar-link ${activeView === 'academic-courses' ? 'active' : ''}`}
            onClick={() => setActiveView('academic-courses')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '4px', backgroundColor: activeView === 'academic-courses' ? '#eff6ff' : 'transparent', color: activeView === 'academic-courses' ? '#1e40af' : '#475569' }}
          >
            <BookOpen size={18} />
            <span>Course Registration</span>
          </div>

          <div 
            className={`sidebar-link ${activeView === 'academic-records' ? 'active' : ''}`}
            onClick={() => setActiveView('academic-records')}
            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '6px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', marginBottom: '4px', backgroundColor: activeView === 'academic-records' ? '#eff6ff' : 'transparent', color: activeView === 'academic-records' ? '#1e40af' : '#475569' }}
          >
            <UserCheck size={18} />
            <span>Study Load & Records</span>
          </div>
        </aside>

        {/* Student Active View Area */}
        <main style={{ flex: 1, overflowY: 'auto' }}>
          {activeView === 'academic-courses' ? (
            <StudentCourseRegistration session={session} />
          ) : (
            <StudentRecords session={session} />
          )}
        </main>
      </div>

    </div>
  );
}
