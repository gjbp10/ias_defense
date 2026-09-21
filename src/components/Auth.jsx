import React, { useState } from 'react';
import { GraduationCap, Lock, Mail, AlertCircle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../apiClient';

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [isHovered, setIsHovered] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLocked) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (mode === 'register') {
      try {
        // The server always assigns role = 'student' here, regardless of
        // anything the client sends -- registrar/admin accounts can only be
        // provisioned separately, never through public self-registration.
        const { user } = await apiClient.register(fullName, email, password);
        setSuccessMsg('Account created successfully!');
        if (onLogin) onLogin(user);
      } catch (error) {
        setErrorMsg(error.message || 'Registration failed.');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const { user } = await apiClient.login(email, password);
      if (onLogin) onLogin(user);
    } catch (error) {
      // Lockout (HTTP 423) and remaining-attempts counts are tracked
      // server-side in MySQL now, not in local component state -- so they
      // can't be reset just by refreshing the page.
      if (error.status === 423) {
        setIsLocked(true);
        setErrorMsg(error.message);
        setTimeout(() => {
          setIsLocked(false);
          setErrorMsg('');
        }, 5 * 60 * 1000);
      } else if (error.data && typeof error.data.attemptsRemaining === 'number') {
        setErrorMsg(`${error.message} You have ${error.data.attemptsRemaining} attempt(s) remaining.`);
      } else {
        setErrorMsg(error.message || 'Login failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    wrapper: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: 'var(--bg-app)',
      padding: '20px'
    },
    card: {
      width: '100%',
      maxWidth: '420px',
      padding: '40px 32px',
      backgroundColor: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: 'var(--shadow-lg)',
      border: '1px solid var(--color-border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    },
    logoContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: '24px'
    },
    logoText: {
      fontSize: '36px',
      fontWeight: 800,
      color: 'var(--text-main)',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    logoSpan: {
      color: '#10b981'
    },
    subtitle: {
      fontSize: '14px',
      color: 'var(--text-muted)',
      textAlign: 'center',
      lineHeight: 1.5
    },
    tabContainer: {
      display: 'flex',
      width: '100%',
      backgroundColor: '#f1f5f9',
      borderRadius: 'var(--radius-md)',
      padding: '4px',
      marginBottom: '20px'
    },
    tab: (active) => ({
      flex: 1,
      padding: '8px 12px',
      border: 'none',
      borderRadius: 'calc(var(--radius-md) - 2px)',
      fontSize: '14px',
      fontWeight: 600,
      cursor: 'pointer',
      backgroundColor: active ? '#ffffff' : 'transparent',
      color: active ? 'var(--color-brand)' : 'var(--text-muted)',
      boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
      transition: 'all 0.2s ease'
    }),
    form: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
    },
    label: {
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--text-main)'
    },
    inputWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center'
    },
    inputIcon: (isFocused) => ({
      position: 'absolute',
      left: '14px',
      color: isFocused ? 'var(--color-brand)' : 'var(--text-light)',
      transition: 'color 0.2s ease'
    }),
    input: (isFocused) => ({
      width: '100%',
      padding: '12px 16px',
      paddingLeft: '44px',
      border: isFocused ? '1px solid var(--color-brand)' : '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      fontSize: '14px',
      outline: 'none',
      backgroundColor: isFocused ? '#ffffff' : '#fafafa',
      boxShadow: isFocused ? '0 0 0 3px rgba(2, 132, 199, 0.1)' : 'none',
      transition: 'all 0.2s ease'
    }),
    btn: {
      width: '100%',
      padding: '14px',
      backgroundColor: isHovered && !loading && !isLocked ? '#0369a1' : (isLocked ? '#9ca3af' : 'var(--color-brand)'),
      color: 'white',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontSize: '15px',
      fontWeight: 600,
      cursor: (loading || isLocked) ? 'not-allowed' : 'pointer',
      marginTop: '8px',
      transition: 'all 0.2s ease',
      transform: isHovered && !loading && !isLocked ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: isHovered && !loading && !isLocked ? '0 4px 6px -1px rgba(2, 132, 199, 0.2)' : 'none',
      opacity: (loading || isLocked) ? 0.7 : 1
    },
    errorBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: 'var(--color-offline-bg)',
      color: 'var(--color-offline)',
      borderRadius: 'var(--radius-md)',
      fontSize: '13px',
      fontWeight: 500,
      width: '100%'
    },
    successBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px',
      backgroundColor: '#ecfdf5',
      color: '#047857',
      borderRadius: 'var(--radius-md)',
      fontSize: '13px',
      fontWeight: 500,
      width: '100%'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        
        {/* Centered Logo & Branding */}
        <div style={styles.logoContainer}>
          <div style={styles.logoText}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '48px', 
              height: '48px', 
              backgroundColor: '#1e3a8a', 
              borderRadius: '10px', 
              color: '#ffffff',
              marginRight: '12px'
            }}>
              <GraduationCap size={30} />
            </div>
            <div>
              <span style={{ color: '#1e3a8a', fontWeight: 800 }}>AUC</span>
              <span style={{ color: '#059669', fontWeight: 800 }}>RES</span>
            </div>
          </div>
          <p style={styles.subtitle}>
            {mode === 'login' 
              ? 'Automated University Course Registration & Enrollment System'
              : 'Create a new student or university account for AUCRES.'}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div style={styles.tabContainer}>
          <button 
            type="button" 
            style={styles.tab(mode === 'login')} 
            onClick={() => { setMode('login'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            style={styles.tab(mode === 'register')} 
            onClick={() => { setMode('register'); setErrorMsg(''); setSuccessMsg(''); }}
          >
            Register
          </button>
        </div>

        {/* Authentication Form */}
        <form style={styles.form} onSubmit={handleSubmit}>
          
          {errorMsg && (
            <div style={styles.errorBox}>
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div style={styles.successBox}>
              {successMsg}
            </div>
          )}

          {mode === 'register' && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Full Name</label>
              <div style={styles.inputWrapper}>
                <Mail size={18} style={styles.inputIcon(focusedInput === 'fullName')} />
                <input 
                  type="text" 
                  style={styles.input(focusedInput === 'fullName')} 
                  placeholder="John Doe" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onFocus={() => setFocusedInput('fullName')}
                  onBlur={() => setFocusedInput(null)}
                  required 
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <div style={styles.inputWrapper}>
              <Mail size={18} style={styles.inputIcon(focusedInput === 'email')} />
              <input 
                type="email" 
                style={styles.input(focusedInput === 'email')} 
                placeholder="user.aucres@gmail.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setFocusedInput('email')}
                onBlur={() => setFocusedInput(null)}
                required 
                disabled={loading || (mode === 'login' && isLocked)}
              />
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrapper}>
              <Lock size={18} style={styles.inputIcon(focusedInput === 'password')} />
              <input 
                type="password" 
                style={styles.input(focusedInput === 'password')} 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setFocusedInput('password')}
                onBlur={() => setFocusedInput(null)}
                required 
                disabled={loading || (mode === 'login' && isLocked)}
              />
            </div>
          </div>

          <button 
            type="submit" 
            style={styles.btn}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            disabled={loading || (mode === 'login' && isLocked)}
          >
            {loading 
              ? (mode === 'login' ? 'Authenticating...' : 'Creating Account...') 
              : (mode === 'login' && isLocked ? 'Locked' : (mode === 'login' ? 'Sign In' : 'Create Account'))}
          </button>
        </form>

      </div>
    </div>
  );
}
