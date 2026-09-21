import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  GraduationCap, 
  UserCheck, 
  Building2, 
  ShieldAlert, 
  FileText,
  Settings
} from 'lucide-react';

export default function Sidebar({ activeView, onViewChange }) {
  const [expandedGroups, setExpandedGroups] = useState({
    academic: true,
    registrar: true,
    security: true
  });

  const toggleGroup = (group) => {
    setExpandedGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-menu-list">
        {/* Student Portal Overview */}
        <div 
          className={`sidebar-link ${activeView === 'dashboard' ? 'active' : ''}`}
          onClick={() => onViewChange('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Portal Dashboard</span>
        </div>

        {/* Student Academic Services */}
        <div>
          <div 
            className={`menu-group-header ${activeView.startsWith('academic-') ? 'active' : ''}`}
            onClick={() => toggleGroup('academic')}
          >
            <div className="menu-group-title">
              <GraduationCap size={18} />
              <span>Student Services</span>
            </div>
            {expandedGroups.academic ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          
          {expandedGroups.academic && (
            <div className="menu-group-sublist">
              <div 
                className={`sidebar-link ${activeView === 'academic-courses' ? 'active' : ''}`}
                onClick={() => onViewChange('academic-courses')}
              >
                <BookOpen size={16} />
                <span>Course Registration</span>
              </div>
              <div 
                className={`sidebar-link ${activeView === 'academic-records' ? 'active' : ''}`}
                onClick={() => onViewChange('academic-records')}
              >
                <UserCheck size={16} />
                <span>Study Load & Records</span>
              </div>
            </div>
          )}
        </div>

        {/* Registrar Administration (Target for V3 Privilege Escalation) */}
        <div>
          <div 
            className={`menu-group-header ${activeView.startsWith('registrar-') ? 'active' : ''}`}
            onClick={() => toggleGroup('registrar')}
          >
            <div className="menu-group-title">
              <Building2 size={18} />
              <span>Registrar Office</span>
            </div>
            {expandedGroups.registrar ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          
          {expandedGroups.registrar && (
            <div className="menu-group-sublist">
              <div 
                className={`sidebar-link ${activeView === 'registrar-courses' ? 'active' : ''}`}
                onClick={() => onViewChange('registrar-courses')}
              >
                <Settings size={16} />
                <span>Course Management</span>
              </div>
              <div 
                className={`sidebar-link ${activeView === 'registrar-students' ? 'active' : ''}`}
                onClick={() => onViewChange('registrar-students')}
              >
                <FileText size={16} />
                <span>Master Enrollment List</span>
              </div>
            </div>
          )}
        </div>

        {/* IAS2 Security Laboratory & Vulnerability Audit */}
        <div>
          <div 
            className={`menu-group-header ${activeView.startsWith('security-') ? 'active' : ''}`}
            onClick={() => toggleGroup('security')}
          >
            <div className="menu-group-title">
              <ShieldAlert size={18} />
              <span>IAS2 Testing Environment</span>
            </div>
            {expandedGroups.security ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
          
          {expandedGroups.security && (
            <div className="menu-group-sublist">
              <div 
                className={`sidebar-link ${activeView === 'security-lab' ? 'active' : ''}`}
                onClick={() => onViewChange('security-lab')}
              >
                <ShieldAlert size={16} style={{ color: '#ef4444' }} />
                <span>Vulnerability Lab Panel</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
