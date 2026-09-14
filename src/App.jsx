import React, { useState } from 'react';
import StudentPortalApp from './StudentPortalApp';
import RegistrarPortalApp from './RegistrarPortalApp';

export default function App({ session }) {
  const [portalMode, setPortalMode] = useState('student'); // 'student' | 'registrar'

  if (portalMode === 'registrar') {
    return (
      <RegistrarPortalApp 
        session={session} 
        onSwitchPortal={() => setPortalMode('student')} 
      />
    );
  }

  return (
    <StudentPortalApp 
      session={session} 
      onSwitchPortal={() => setPortalMode('registrar')} 
    />
  );
}

