import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MonitoringStations from './components/MonitoringStations';
import RiverLevel from './components/RiverLevel';
import InundationPrediction from './components/InundationPrediction';
import SmsParserConsole from './components/SmsParserConsole';
import ReportsModeration from './components/ReportsModeration';
import { 
  ResidentsDirectory, 
  BroadcastLogs, 
  SystemSettings, 
  SystemLogs, 
  Advisories, 
  Documentation,
  EmergencyHotlines
} from './components/Placeholders';
import { 
  AdvisoryModal, 
  NotifyModal, 
  PredictModal 
} from './components/Modals';

export default function App() {
  const [activeView, setActiveView] = useState('monitoring-stations');
  
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
      case 'content-news':
        return <Advisories />;
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
