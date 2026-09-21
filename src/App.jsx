import React, { useState } from 'react';
import StudentPortalApp from './StudentPortalApp';
import RegistrarPortalApp from './RegistrarPortalApp';

export default function App({ session }) {
  const [portalMode, setPortalMode] = useState('student');

  const role = session?.user?.role;
  const canAccessRegistrar = role === 'registrar' || role === 'admin';

  // portalMode is UI convenience ONLY. It is not what keeps a student out of
  // the registrar console -- every registrar-only API route is independently
  // gated server-side by requireRole('registrar', 'admin'). Even if someone
  // forced portalMode to 'registrar' via devtools, every fetch behind that
  // screen would come back 403. This replaces the previous version, where
  // this toggle was the *only* thing standing between a self-registered
  // account and full admin access.
  const effectiveMode = portalMode === 'registrar' && canAccessRegistrar ? 'registrar' : 'student';

  if (effectiveMode === 'registrar') {
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
      onSwitchPortal={canAccessRegistrar ? () => setPortalMode('registrar') : undefined}
    />
  );
}
