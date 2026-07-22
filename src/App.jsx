import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MonitoringStations from './components/MonitoringStations';
import RiverLevel from './components/RiverLevel';
import InundationPrediction from './components/InundationPrediction';
import SmsParserConsole from './components/SmsParserConsole';
import { 
  ResidentsDirectory, 
  BroadcastLogs, 
  SystemSettings, 
  Documentation 
} from './components/Placeholders';
import Advisories from './components/Advisories';
import EvacuationCenters from './components/EvacuationCenters';
import EmergencyHotlines from './components/EmergencyHotlines';
import Analytics from './components/Analytics';
import AuditLogs from './components/AuditLogs';
import { 
  AdvisoryModal, 
  NotifyModal, 
  PredictModal 
} from './components/Modals';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  
  // Modal states
  const [isAdvisoryOpen, setIsAdvisoryOpen] = useState(false);
  const [isNotifyOpen, setIsNotifyOpen] = useState(false);
  const [isPredictOpen, setIsPredictOpen] = useState(false);

  const handleActionClick = (actionType) => {
    if (actionType === 'advisory') {
      setIsAdvisoryOpen(true);
    } else if (actionType === 'notify') {
      setIsNotifyOpen(true);
    } else if (actionType === 'predict') {
      setIsPredictOpen(true);
    }
  };

  // View router
  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onViewChange={setActiveView} />;
      case 'monitoring-stations':
        return <MonitoringStations />;
      case 'monitoring-river-level':
        return <RiverLevel onActionClick={handleActionClick} />;
      case 'monitoring-inundation':
        return <InundationPrediction />;
      case 'community-residents':
        return <ResidentsDirectory />;
      case 'community-sms-parser':
        return <SmsParserConsole />;
      case 'community-alerts':
        return <BroadcastLogs />;
      case 'content-advisories':
        return <Advisories />;
      case 'content-evacuation':
        return <EvacuationCenters />;
      case 'content-hotlines':
        return <EmergencyHotlines />;
      case 'system-analytics':
        return <Analytics />;
      case 'system-logs':
        return <AuditLogs />;
      case 'system-settings':
        return <SystemSettings />;
      case 'documentation':
        return <Documentation />;
      default:
        return <Dashboard onViewChange={setActiveView} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Header */}
      <Header />

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
