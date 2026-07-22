import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Archive, 
  Copy, 
  X, 
  Check, 
  AlertTriangle,
  RefreshCw,
  Eye,
  Calendar,
  MapPin,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const INITIAL_ADVISORIES = [
  {
    id: 1,
    title: 'Heavy Rainfall Warning',
    category: 'Weather',
    severity: 'High',
    status: 'Active',
    published: 'June 18',
    description: 'Continuous moderate to heavy rainfall is expected within the next six hours. Localized flooding is possible in low-lying residential sectors.',
    recommendedAction: 'Residents near low-lying river channels should secure electrical outlets and prepare emergency go-bags.',
    durationStart: '2026-06-18T08:00',
    durationEnd: '2026-06-18T14:00',
    affectedAreas: 'Tumana, Nangka'
  },
  {
    id: 2,
    title: 'Flood Advisory',
    category: 'Flood',
    severity: 'Medium',
    status: 'Active',
    published: 'June 17',
    description: 'Water level at Marikina River Sto. Niño sensor is rising steadily at 16.0m. Alert Level 2 is declared active.',
    recommendedAction: 'Prepare for potential evacuation. LGU response teams are dispatched to emergency outposts.',
    durationStart: '2026-06-17T09:00',
    durationEnd: '2026-06-17T21:00',
    affectedAreas: 'Marikina City'
  },
  {
    id: 3,
    title: 'Road Closure Notice',
    category: 'Traffic',
    severity: 'Low',
    status: 'Archived',
    published: 'June 15',
    description: 'Sto. Niño overflow bypass road is closed temporarily to light vehicles due to minor gutter floods.',
    recommendedAction: 'Take alternative bypass routes via Marcos Highway or C5.',
    durationStart: '2026-06-15T12:00',
    durationEnd: '2026-06-15T18:00',
    affectedAreas: 'Sto. Niño Bypass'
  }
];

export default function Advisories() {
  const [advisories, setAdvisories] = useState(INITIAL_ADVISORIES);
  const [selectedId, setSelectedId] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isRefreshSpinning, setIsRefreshSpinning] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [formState, setFormState] = useState({
    id: null,
    title: '',
    category: 'Weather',
    severity: 'Low',
    status: 'Draft',
    affectedAreas: '',
    description: '',
    recommendedAction: '',
    durationStart: '',
    durationEnd: ''
  });

  const selectedAdvisory = advisories.find(a => a.id === selectedId);

  const handleRefresh = () => {
    setIsRefreshSpinning(true);
    setTimeout(() => {
      setIsRefreshSpinning(false);
    }, 800);
  };

  // Filter logic
  const filteredAdvisories = advisories.filter(adv => {
    const matchesSearch = adv.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          adv.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter ? adv.category === categoryFilter : true;
    const matchesSeverity = severityFilter ? adv.severity === severityFilter : true;
    const matchesStatus = statusFilter ? adv.status === statusFilter : true;
    return matchesSearch && matchesCategory && matchesSeverity && matchesStatus;
  });

  const getSeverityColor = (sev) => {
    switch (sev) {
      case 'High': return { color: '#dc2626', bg: '#fef2f2' };
      case 'Medium': return { color: '#ea580c', bg: '#fff7ed' };
      case 'Low': return { color: '#0284c7', bg: '#f0f9ff' };
      default: return { color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return { color: '#16a34a', bg: '#f0fdf4' };
      case 'Archived': return { color: '#6b7280', bg: '#f3f4f6' };
      case 'Draft': return { color: '#ca8a04', bg: '#fefce8' };
      default: return { color: '#4b5563', bg: '#f3f4f6' };
    }
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormState({
      id: null,
      title: '',
      category: 'Weather',
      severity: 'Low',
      status: 'Draft',
      affectedAreas: '',
      description: '',
      recommendedAction: '',
      durationStart: '',
      durationEnd: ''
    });
    setIsModalOpen(true);
  };

  const openEditModal = (adv) => {
    setModalMode('edit');
    setFormState({
      ...adv
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this advisory?')) {
      const updated = advisories.filter(a => a.id !== id);
      setAdvisories(updated);
      if (selectedId === id && updated.length > 0) {
        setSelectedId(updated[0].id);
      }
    }
  };

  const handleArchive = (id) => {
    setAdvisories(prev => prev.map(a => {
      if (a.id === id) {
        return { ...a, status: a.status === 'Archived' ? 'Active' : 'Archived' };
      }
      return a;
    }));
  };

  const handleDuplicate = (adv) => {
    const newId = Math.max(...advisories.map(a => a.id), 0) + 1;
    const duplicated = {
      ...adv,
      id: newId,
      title: `${adv.title} (Copy)`,
      published: 'Today',
      status: 'Draft'
    };
    setAdvisories(prev => [...prev, duplicated]);
    setSelectedId(newId);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === 'create') {
      const newId = Math.max(...advisories.map(a => a.id), 0) + 1;
      const newAdvisory = {
        ...formState,
        id: newId,
        published: 'Just now'
      };
      setAdvisories(prev => [...prev, newAdvisory]);
      setSelectedId(newId);
    } else {
      setAdvisories(prev => prev.map(a => a.id === formState.id ? formState : a));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="main-view">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-container">
          <h1>Advisories</h1>
          <span className="view-subtitle">Last updated: June 18, 2026 • 08:42 AM</span>
        </div>
        <button className="btn-refresh" onClick={handleRefresh}>
          <RefreshCw size={13} className={isRefreshSpinning ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="stations-split-layout">
        
        {/* Left Side: Advisories List */}
        <div className="stations-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="stations-card-title">List of Advisories</h2>
            <button className="btn-primary" onClick={openCreateModal} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', fontSize: '13px' }}>
              <Plus size={16} />
              <span>Publish an Advisory</span>
            </button>
          </div>

          {/* Search and Filters */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="search-input-wrapper" style={{ flex: 1, minWidth: '200px' }}>
              <input 
                type="text" 
                placeholder="Search for an advisory.." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="time-range-select"
              style={{ padding: '10px 14px', borderRadius: '10px', width: '130px', fontSize: '13px' }}
            >
              <option value="">Category...</option>
              <option value="Weather">Weather</option>
              <option value="Flood">Flood</option>
              <option value="Traffic">Traffic</option>
              <option value="Health">Health</option>
            </select>

            <select 
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="time-range-select"
              style={{ padding: '10px 14px', borderRadius: '10px', width: '130px', fontSize: '13px' }}
            >
              <option value="">Severity...</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="time-range-select"
              style={{ padding: '10px 14px', borderRadius: '10px', width: '130px', fontSize: '13px' }}
            >
              <option value="">Status...</option>
              <option value="Active">Active</option>
              <option value="Archived">Archived</option>
              <option value="Draft">Draft</option>
            </select>
          </div>

          {/* Advisories Table */}
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdvisories.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center', padding: '24px', color: 'var(--text-light)' }}>
                      No advisories match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredAdvisories.map((adv) => {
                    const sevStyle = getSeverityColor(adv.severity);
                    const statusStyle = getStatusColor(adv.status);
                    return (
                      <tr 
                        key={adv.id} 
                        className={selectedId === adv.id ? 'selected' : ''}
                        onClick={() => setSelectedId(adv.id)}
                      >
                        <td style={{ fontWeight: '600', color: 'var(--text-main)' }}>{adv.title}</td>
                        <td>{adv.category}</td>
                        <td>
                          <span style={{ 
                            color: sevStyle.color, 
                            backgroundColor: sevStyle.bg, 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            fontWeight: '700' 
                          }}>
                            {adv.severity}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            color: statusStyle.color, 
                            backgroundColor: statusStyle.bg, 
                            padding: '3px 8px', 
                            borderRadius: '12px', 
                            fontSize: '11px', 
                            fontWeight: '700' 
                          }}>
                            {adv.status}
                          </span>
                        </td>
                        <td className="text-muted">{adv.published}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="table-footer">
            <span>{filteredAdvisories.length} of {advisories.length} records</span>
            <div className="pagination-controls">
              <button className="pagination-btn" disabled><ChevronLeft size={14} /></button>
              <button className="pagination-btn active">1</button>
              <button className="pagination-btn" disabled><ChevronRight size={14} /></button>
            </div>
          </div>
        </div>

        {/* Right Side: Advisory Details */}
        <div className="details-panel">
          {!selectedAdvisory ? (
            <div className="details-empty-state">
              <Eye size={32} style={{ color: 'var(--text-light)', marginBottom: '8px' }} />
              <p>Select an advisory first to view details.</p>
            </div>
          ) : (
            <div className="details-content">
              <div className="details-header">
                <span className="details-station-name">{selectedAdvisory.title}</span>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <span style={{ 
                    color: getSeverityColor(selectedAdvisory.severity).color, 
                    backgroundColor: getSeverityColor(selectedAdvisory.severity).bg, 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    fontWeight: '700' 
                  }}>
                    {selectedAdvisory.severity} Severity
                  </span>
                  <span style={{ 
                    color: getStatusColor(selectedAdvisory.status).color, 
                    backgroundColor: getStatusColor(selectedAdvisory.status).bg, 
                    padding: '3px 8px', 
                    borderRadius: '12px', 
                    fontSize: '11px', 
                    fontWeight: '700' 
                  }}>
                    {selectedAdvisory.status}
                  </span>
                </div>
              </div>

              <div className="details-grid">
                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Advisory Description</span>
                  <p className="detail-value" style={{ fontWeight: 'normal', fontSize: '13px', lineHeight: '1.5', marginTop: '4px' }}>
                    {selectedAdvisory.description}
                  </p>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Recommended Action Plan</span>
                  <p className="detail-value" style={{ fontWeight: 'normal', fontSize: '13px', lineHeight: '1.5', marginTop: '4px', color: '#ea580c' }}>
                    {selectedAdvisory.recommendedAction}
                  </p>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Category Group</span>
                  <span className="detail-value">{selectedAdvisory.category}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Affected Area Sectors</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', marginTop: '2px' }}>
                    <MapPin size={12} style={{ color: 'var(--color-brand)' }} />
                    <span>{selectedAdvisory.affectedAreas}</span>
                  </div>
                </div>

                <div className="detail-item" style={{ gridColumn: 'span 2' }}>
                  <span className="detail-label">Valid Duration Period</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    <Calendar size={12} />
                    <span>
                      {selectedAdvisory.durationStart ? new Date(selectedAdvisory.durationStart).toLocaleString() : 'N/A'} to{' '}
                      {selectedAdvisory.durationEnd ? new Date(selectedAdvisory.durationEnd).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Panel */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    className="action-row-btn"
                    onClick={() => openEditModal(selectedAdvisory)}
                    style={{ justifyContent: 'center', gap: '8px' }}
                  >
                    <Edit3 size={14} />
                    <span>Edit</span>
                  </button>
                  <button 
                    className="action-row-btn"
                    onClick={() => handleArchive(selectedAdvisory.id)}
                    style={{ justifyContent: 'center', gap: '8px' }}
                  >
                    <Archive size={14} />
                    <span>{selectedAdvisory.status === 'Archived' ? 'Activate' : 'Archive'}</span>
                  </button>
                </div>
                
                <button 
                  className="action-row-btn"
                  onClick={() => handleDuplicate(selectedAdvisory)}
                  style={{ 
                    justifyContent: 'center', 
                    gap: '8px', 
                    backgroundColor: '#e0f2fe', 
                    borderColor: '#bae6fd', 
                    color: '#0369a1' 
                  }}
                >
                  <Copy size={14} />
                  <span>Duplicate</span>
                </button>

                <button 
                  className="action-row-btn"
                  onClick={() => handleDelete(selectedAdvisory.id)}
                  style={{ 
                    justifyContent: 'center', 
                    gap: '8px', 
                    backgroundColor: '#fef2f2', 
                    borderColor: '#fca5a5', 
                    color: '#dc2626' 
                  }}
                >
                  <Trash2 size={14} />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide-over / Modal for Create/Edit */}
      {isModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-container" style={{ width: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{modalMode === 'create' ? 'Create Advisory' : 'Edit Advisory'}</span>
              <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                
                <div className="form-group">
                  <label className="form-label">Title</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Advisory Title.." 
                    value={formState.title} 
                    onChange={(e) => setFormState({ ...formState, title: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>Example: Heavy Rainfall Warning</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select 
                      className="form-input"
                      value={formState.category}
                      onChange={(e) => setFormState({ ...formState, category: e.target.value })}
                      style={{ backgroundColor: 'white' }}
                    >
                      <option value="Weather">Weather</option>
                      <option value="Flood">Flood</option>
                      <option value="Traffic">Traffic</option>
                      <option value="Health">Health</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Severity</label>
                    <select 
                      className="form-input"
                      value={formState.severity}
                      onChange={(e) => setFormState({ ...formState, severity: e.target.value })}
                      style={{ backgroundColor: 'white' }}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Affected Areas</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Affected Areas in the advisory.." 
                    value={formState.affectedAreas} 
                    onChange={(e) => setFormState({ ...formState, affectedAreas: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    placeholder="Advisory description..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    required
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>Example: Continuous moderate to heavy rainfall is expected...</span>
                </div>

                <div className="form-group">
                  <label className="form-label">Recommended Action</label>
                  <textarea 
                    className="form-textarea" 
                    rows="3"
                    placeholder="Advisory action recommendations..."
                    value={formState.recommendedAction}
                    onChange={(e) => setFormState({ ...formState, recommendedAction: e.target.value })}
                  />
                  <span style={{ fontSize: '11px', color: 'var(--text-light)', marginTop: '2px' }}>Example: Residents near low-lying areas should prepare...</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Duration Start Date</label>
                    <input 
                      type="datetime-local" 
                      className="form-input" 
                      value={formState.durationStart}
                      onChange={(e) => setFormState({ ...formState, durationStart: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Duration End Date</label>
                    <input 
                      type="datetime-local" 
                      className="form-input" 
                      value={formState.durationEnd}
                      onChange={(e) => setFormState({ ...formState, durationEnd: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select 
                    className="form-input"
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: e.target.value })}
                    style={{ backgroundColor: 'white' }}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Archived">Archived</option>
                  </select>
                </div>

              </div>

              <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid var(--color-border)', backgroundColor: '#fafafa', marginTop: 'auto' }}>
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Close</button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Check size={16} />
                  <span>Publish Advisory</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
