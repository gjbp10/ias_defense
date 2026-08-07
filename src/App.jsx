import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

// Core Layout & Dashboards
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';

// Monitoring Components
import MonitoringStations from './components/MonitoringStations';
import RiverLevel from './components/RiverLevel';
import InundationPrediction from './components/InundationPrediction';

// Community & Reports Components
import ReportsModeration from './components/ReportsModeration';
import BroadcastLogs from './components/UserManagement';

// Content & Management Components
import Advisories from './components/Advisories';
import EvacuationCenters from './components/EvacuationCenters';
import EmergencyHotlines from './components/EmergencyHotlines';

// System Components
import SystemSettings from './components/SystemSettings';
import SystemLogs from './components/SystemLogs';
import Documentation from './components/Documentation';

// Modals
import {
  AdvisoryModal,
  NotifyModal,
  PredictModal
} from './components/Modals';

// Auth Components
import Login from './components/Login';
import Register from './components/Register';

export default function App() {
  const [session, setSession] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isLoginView, setIsLoginView] = useState(true);
  const [activeView, setActiveView] = useState('monitoring-stations');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Modal states
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isPredictOpen, setIsPredictOpen] = useState(false);
  const [activeStationData, setActiveStationData] = useState(null);

  const handleActionClick = (actionType, data = null) => {
    if (actionType === 'advisory') {
      if (data) setActiveStationData(data);
      setIsAdvisoryOpen(true);
    } else if (actionType === 'notify') {
      setIsNotifyOpen(true);
    } else if (actionType === 'predict') {
      setIsPredictOpen(true);
    }
  };

  // View router combining both configurations
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={setActiveView} onActionClick={handleActionClick} />;
      case 'monitoring-stations':
        return <MonitoringStations />;
      case 'monitoring-river-level':
        return <RiverLevel onActionClick={handleActionClick} />;
      case 'monitoring-inundation':
        return <InundationPrediction />;
      case 'community-reports-moderation':
        return <ReportsModeration />;
      case 'community-residents':
        return <ResidentsDirectory />;
      case 'community-sms-parser':
        return <SmsParserConsole />;
      case 'community-alerts':
        return <BroadcastLogs />;
      case 'content-advisories':
      case 'content-news': // Mapped to Advisories as per the second version
        return <Advisories onOpenAdvisoryModal={() => setIsAdvisoryOpen(true)} />;
      case 'content-evacuation':
        return <EvacuationCenters />;
      case 'content-hotlines':
        return <EmergencyHotlines />;
      case 'system-settings':
        return <SystemSettings />;
      case 'system-logs':
        return <SystemLogs />;
      case 'documentation':
        return <Documentation />;
      default:
        return <MonitoringStations />;
    }
  };

  if (isAuthLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-app)' }}>
        <Loader2 size={32} className="spin-icon" color="var(--color-brand)" />
      </div>
    );
  }

  if (!session) {
    return isLoginView 
      ? <Login onSwitchToRegister={() => setIsLoginView(false)} />
      : <Register onSwitchToLogin={() => setIsLoginView(true)} />;
  }

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header user={session.user} />

      {/* Main Layout Content */}
      <div className="app-content">
        {/* Sidebar Nav */}
        <Sidebar activeView={activeView} onViewChange={setActiveView} />

        {/* Dynamic Main Workspace Panel */}
        {renderView()}
      </div>

      {/* Action Simulation Modals */}
      <AdvisoryModal
        isOpen={isAdvisoryOpen}
        onClose={() => setIsAdvisoryOpen(false)}
        stationData={activeStationData}
        onViewAdvisories={() => setActiveView('content-advisories')}
      />
      <NotifyModal
        isOpen={isNotifyOpen}
        onClose={() => setIsNotifyOpen(false)}
      />
      <PredictModal
        isOpen={isPredictOpen}
        onClose={() => setIsPredictOpen(false)}
      />
    </div>
  );
}
