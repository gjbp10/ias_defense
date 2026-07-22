import React, { useState } from 'react';
import { 
  Search, 
  Phone, 
  Copy, 
  Check, 
  Shield, 
  Flame, 
  Heart, 
  HelpCircle,
  AlertTriangle,
  Building,
  ExternalLink,
  PhoneCall
} from 'lucide-react';

const HOTLINES = [
  {
    id: 1,
    name: 'Marikina Rescue (MDRRMO)',
    number: '02-8646-2436',
    mobile: '0917-825-9721',
    description: 'Primary disaster response, flood evacuation, and emergency medical rescue services.',
    tag: 'Rescue',
    priority: true
  },
  {
    id: 2,
    name: 'Marikina Police Station',
    number: '02-8941-8401',
    mobile: '0915-456-7890',
    description: 'Law enforcement, security, and public order alerts.',
    tag: 'Police',
    priority: true
  },
  {
    id: 3,
    name: 'Marikina Fire Station',
    number: '02-8941-8402',
    mobile: '0918-234-5678',
    description: 'Fire suppression, search and rescue, and hazard containment.',
    tag: 'Fire',
    priority: true
  },
  {
    id: 4,
    name: 'Amang Rodriguez Medical Center',
    number: '02-8941-5854',
    mobile: '0920-345-6789',
    description: 'Public hospital with fully-equipped trauma center and emergency room.',
    tag: 'Medical',
    priority: false
  },
  {
    id: 5,
    name: 'Barangay Tumana Hall',
    number: '02-8646-5555',
    mobile: '0917-123-4567',
    description: 'Local barangay coordination, sub-rescue outposts, and local evacuation assistance.',
    tag: 'Barangay',
    priority: false
  },
  {
    id: 6,
    name: 'Barangay Nangka Hall',
    number: '02-8646-7777',
    mobile: '0918-765-4321',
    description: 'Local barangay coordination, flood warning sirens, and neighborhood rescue.',
    tag: 'Barangay',
    priority: false
  },
  {
    id: 7,
    name: 'Barangay Malanday Hall',
    number: '02-8646-8888',
    mobile: '0915-111-2222',
    description: 'Local barangay coordination, evacuation center deployment, and safety patrols.',
    tag: 'Barangay',
    priority: false
  },
  {
    id: 8,
    name: 'Philippine Red Cross - Marikina',
    number: '02-8942-0120',
    mobile: '0909-567-8901',
    description: 'First aid assistance, blood supply, and humanitarian welfare relief packages.',
    tag: 'Rescue',
    priority: false
  }
];

export default function EmergencyHotlines() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [dialingHotline, setDialingHotline] = useState(null);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulateCall = (hotline) => {
    setDialingHotline(hotline);
    setTimeout(() => {
      setDialingHotline(null);
    }, 3000);
  };

  const filteredHotlines = HOTLINES.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.number.includes(searchQuery) ||
                          item.mobile.includes(searchQuery);
    const matchesTag = selectedTag ? item.tag === selectedTag : true;
    return matchesSearch && matchesTag;
  });

  const getTagColor = (tag) => {
    switch (tag) {
      case 'Rescue': return { color: '#dc2626', bg: '#fef2f2' };
      case 'Police': return { color: '#0284c7', bg: '#f0f9ff' };
      case 'Fire': return { color: '#ea580c', bg: '#fff7ed' };
      case 'Medical': return { color: '#16a34a', bg: '#f0fdf4' };
      default: return { color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  const getTagIcon = (tag) => {
    switch (tag) {
      case 'Rescue': return <AlertTriangle size={16} />;
      case 'Police': return <Shield size={16} />;
      case 'Fire': return <Flame size={16} />;
      case 'Medical': return <Heart size={16} />;
      default: return <Building size={16} />;
    }
  };

  return (
    <div className="main-view">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-container">
          <h1>Emergency Hotlines</h1>
          <span className="view-subtitle">Quick contacts for early warning responders, emergency services, and city hotlines</span>
        </div>
      </div>

      {/* Quick Search and Filter tags */}
      <div className="stations-card">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-input-wrapper" style={{ flex: 1, minWidth: '250px' }}>
            <input 
              type="text" 
              placeholder="Search by hotline name, description, or phone number..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button 
              className={`time-range-select ${selectedTag === '' ? 'active' : ''}`}
              onClick={() => setSelectedTag('')}
              style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: selectedTag === '' ? 'var(--bg-active)' : 'white', fontWeight: selectedTag === '' ? '600' : 'normal' }}
            >
              All Hotlines
            </button>
            {['Rescue', 'Police', 'Fire', 'Medical', 'Barangay'].map(tag => (
              <button
                key={tag}
                className={`time-range-select ${selectedTag === tag ? 'active' : ''}`}
                onClick={() => setSelectedTag(tag)}
                style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid var(--color-border)', cursor: 'pointer', backgroundColor: selectedTag === tag ? 'var(--bg-active)' : 'white', fontWeight: selectedTag === tag ? '600' : 'normal' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hotlines Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredHotlines.map(item => {
          const tagStyle = getTagColor(item.tag);
          return (
            <div 
              key={item.id} 
              className="stations-card" 
              style={{ 
                borderLeft: item.priority ? '4px solid #dc2626' : '1px solid var(--color-border)',
                padding: '20px',
                justifyContent: 'space-between',
                minHeight: '220px'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span style={{ 
                    color: tagStyle.color, 
                    backgroundColor: tagStyle.bg, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {getTagIcon(item.tag)}
                    {item.tag}
                  </span>
                  {item.priority && (
                    <span style={{ color: '#dc2626', backgroundColor: '#fef2f2', padding: '3px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '800', border: '1px solid #fca5a5' }}>
                      24/7 PRIORITY
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-main)', marginBottom: '6px' }}>{item.name}</h3>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4', marginBottom: '16px' }}>{item.description}</p>
              </div>

              {/* Numbers Section */}
              <div style={{ borderTop: '1px solid var(--color-border-light)', paddingTop: '12px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  
                  {/* Landline */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Phone size={14} style={{ color: 'var(--text-light)' }} />
                      <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600' }}>{item.number}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button 
                        onClick={() => handleCopy(item.id + '-land', item.number)} 
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                        title="Copy Landline"
                      >
                        {copiedId === item.id + '-land' ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                      </button>
                      <button 
                        onClick={() => handleSimulateCall(item.name)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-brand)' }}
                        title="Dial Simulation"
                      >
                        <PhoneCall size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Mobile */}
                  {item.mobile && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} style={{ color: 'var(--text-light)' }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '13px', fontWeight: '600' }}>{item.mobile}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => handleCopy(item.id + '-mob', item.mobile)} 
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-light)' }}
                          title="Copy Mobile"
                        >
                          {copiedId === item.id + '-mob' ? <Check size={14} style={{ color: '#16a34a' }} /> : <Copy size={14} />}
                        </button>
                        <button 
                          onClick={() => handleSimulateCall(item.name)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--color-brand)' }}
                          title="Dial Simulation"
                        >
                          <PhoneCall size={14} />
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dialer Overlay Simulation */}
      {dialingHotline && (
        <div style={{ 
          position: 'fixed', 
          bottom: '24px', 
          right: '24px', 
          backgroundColor: '#0f172a', 
          color: 'white', 
          padding: '16px 24px', 
          borderRadius: '12px', 
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 2000,
          animation: 'fadeIn 0.3s ease'
        }}>
          <div style={{ 
            width: '12px', 
            height: '12px', 
            borderRadius: '50%', 
            backgroundColor: '#10b981', 
            animation: 'ping 1s infinite'
          }}></div>
          <span style={{ fontSize: '13px', fontWeight: '600' }}>Simulating call connection to: <strong>{dialingHotline}</strong>...</span>
        </div>
      )}
    </div>
  );
}
