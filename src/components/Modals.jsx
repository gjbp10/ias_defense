import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Play, AlertTriangle } from 'lucide-react';

/* --- MODAL WRAPPER COMPONENT --- */
function BaseModal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-close-modal" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* --- GENERATE ADVISORY MODAL --- */
export function AdvisoryModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const [subject, setSubject] = useState('PUBLIC WARNING: Marikina River Alert Level 2 (PREPARE)');
  const [message, setMessage] = useState(
    `RESIDENTS IN BARANGAYS TUMANA & NANGKA:\n\nPlease be advised that the Marikina River has reached Alert Level 2 (16.2 meters) at 08:42 AM. Water levels are rising.\n\nAction required:\n1. Secure all electrical equipment.\n2. Prepare emergency go-bags.\n3. Be ready for evacuation if Alert Level 3 (18.0m) is declared.\n\n- Marikina LGU early warning service`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${subject}\n\n${message}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = () => {
    alert('Advisory draft published successfully.');
    onClose();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Generate Advisory Template">
      <div className="modal-body">
        <div className="form-group">
          <label className="form-label">Advisory Subject Header</label>
          <input 
            type="text" 
            className="form-input" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
          />
        </div>
        <div className="form-group">
          <label className="form-label">Advisory Body Text</label>
          <textarea 
            className="form-textarea" 
            rows="6"
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
          />
        </div>
      </div>
      <div className="modal-footer">
        <button className="btn-secondary" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {copied ? <Check size={14} style={{ color: 'var(--color-online)' }} /> : <Copy size={14} />}
          <span>{copied ? 'Copied!' : 'Copy Text'}</span>
        </button>
        <button className="btn-primary" onClick={handleSend} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Send size={14} />
          <span>Publish Advisory</span>
        </button>
      </div>
    </BaseModal>
  );
}

/* --- NOTIFY RESIDENTS MODAL --- */
export function NotifyModal({ isOpen, onClose }) {
  const [sectors, setSectors] = useState({
    Tumana: true,
    Nangka: true,
    Malanday: false,
    Provident: false
  });
  const [channel, setChannel] = useState('SMS');
  const [sendingState, setSendingState] = useState('idle'); // idle, sending, done
  const [progress, setProgress] = useState(0);

  const handleSectorChange = (sector) => {
    setSectors(prev => ({ ...prev, [sector]: !prev[sector] }));
  };

  const startBroadcast = () => {
    setSendingState('sending');
    setProgress(0);
  };

  useEffect(() => {
    let interval;
    if (sendingState === 'sending') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setSendingState('done');
            return 100;
          }
          return prev + 5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [sendingState]);

  const targetCount = Object.values(sectors).filter(Boolean).length;

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Notify Residents Broadcast">
      <div className="modal-body">
        {sendingState === 'idle' && (
          <>
            <div className="form-group">
              <label className="form-label">Target Barangay Sectors</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {Object.keys(sectors).map((sector) => (
                  <label key={sector} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={sectors[sector]} 
                      onChange={() => handleSectorChange(sector)} 
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>Barangay {sector}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Broadcast Delivery Channel</label>
              <select 
                className="form-input" 
                value={channel} 
                onChange={(e) => setChannel(e.target.value)}
                style={{ backgroundColor: '#ffffff', cursor: 'pointer' }}
              >
                <option value="SMS">Emergency SMS Broadcast</option>
                <option value="Push">Mobile App Push Notification</option>
                <option value="Siren">LGU Voice Siren Alert Trigger</option>
              </select>
            </div>
            
            <div style={{ fontSize: '12px', color: 'var(--text-light)', borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              You are preparing to broadcast warning triggers to residents in <strong>{targetCount}</strong> sector(s) using the <strong>{channel}</strong> gateway.
            </div>
          </>
        )}

        {sendingState === 'sending' && (
          <div className="simulation-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
              <span>Transmitting alert packets...</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Queue batch processing: Sending SMS to {Math.round(progress * 12.4)} / 1240 subscribers.
            </div>
          </div>
        )}

        {sendingState === 'done' && (
          <div style={{ textAlign: 'center', padding: '16px 0', display: 'flex', flexDirection: 'column', align: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--color-online-bg)', color: 'var(--color-online)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Check size={28} />
              </div>
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: '700' }}>Broadcast Completed!</h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              SMS transmission logs have been saved. A total of 1,240 coordinators and residents have been alerted.
            </p>
          </div>
        )}
      </div>
      
      <div className="modal-footer">
        {sendingState === 'idle' && (
          <>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button 
              className="btn-primary" 
              onClick={startBroadcast} 
              disabled={targetCount === 0}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <Send size={14} />
              <span>Send Warning Alerts</span>
            </button>
          </>
        )}
        {sendingState === 'sending' && (
          <button className="btn-secondary" disabled>Sending...</button>
        )}
        {sendingState === 'done' && (
          <button className="btn-primary" onClick={onClose}>Done</button>
        )}
      </div>
    </BaseModal>
  );
}

/* --- RUN INUNDATION MODAL --- */
export function PredictModal({ isOpen, onClose }) {
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState('idle'); // idle, running, done
  const [log, setLog] = useState([]);

  const startSimulation = () => {
    setRunning('running');
    setProgress(0);
    setLog(['Initializing simulation engine...', 'Syncing water levels at 16.2m...']);
  };

  useEffect(() => {
    let interval;
    if (running === 'running') {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setRunning('done');
            setLog(logs => [...logs, 'Calculation completed.', 'Identified critical threats: Barangays Tumana, Provident.']);
            return 100;
          }
          
          if (prev === 20) {
            setLog(logs => [...logs, 'Loading topographical height meshes...']);
          } else if (prev === 50) {
            setLog(logs => [...logs, 'Simulating flood front velocity paths...']);
          } else if (prev === 80) {
            setLog(logs => [...logs, 'Evaluating risk factor ratios for residential grids...']);
          }
          return prev + 10;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [running]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Hydrologic Inundation Simulation">
      <div className="modal-body">
        {running === 'idle' && (
          <>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <AlertTriangle size={24} style={{ color: 'var(--color-alert-2)', flexShrink: 0 }} />
              <div style={{ fontSize: '13px', lineHeight: '1.4', color: 'var(--text-muted)' }}>
                You are about to execute the <strong>Inundation Prediction Simulation</strong>. This uses real-time telemetry elevations to compute flooding boundaries along the river basin.
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Simulation Time Horizon</label>
              <select className="form-input" style={{ backgroundColor: 'white' }}>
                <option>Next 6 Hours (Standard)</option>
                <option>Next 12 Hours (Extended)</option>
                <option>Next 24 Hours (Full forecast)</option>
              </select>
            </div>
          </>
        )}

        {(running === 'running' || running === 'done') && (
          <div className="simulation-box">
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: '600' }}>
              <span>Hydro-Modeling Engine</span>
              <span>{progress}%</span>
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="simulation-log">
              {log.map((entry, idx) => (
                <div key={idx} style={{ marginBottom: '2px' }}>&gt; {entry}</div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="modal-footer">
        {running === 'idle' && (
          <>
            <button className="btn-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={startSimulation} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={14} fill="white" />
              <span>Start Simulation</span>
            </button>
          </>
        )}
        {running === 'running' && (
          <button className="btn-secondary" disabled>Simulating...</button>
        )}
        {running === 'done' && (
          <button className="btn-primary" onClick={onClose}>Close Simulation</button>
        )}
      </div>
    </BaseModal>
  );
}
