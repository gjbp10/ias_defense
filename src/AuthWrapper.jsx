import React, { useState, useEffect } from 'react';
import App from './App';
import Auth from './components/Auth';
import { apiClient } from './apiClient';

export default function AuthWrapper() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Ask the server whether the session cookie in this browser is still
    // valid -- there's no client-side token to inspect, the server is the
    // only source of truth for auth state.
    apiClient.getSession()
      .then(({ user }) => {
        setSession(user ? { user } : null);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogin = (user) => {
    setSession({ user });
  };

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Loading...</div>;
  }

  if (!session) {
    return <Auth onLogin={handleLogin} />;
  }

  return <App session={session} />;
}
