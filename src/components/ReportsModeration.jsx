import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

export default function ReportsModeration() {
  const [lastUpdated] = useState('June 18, 2026 • 08:42 AM');

  // Dummy data matching the screenshot
  const reports = [
    {
      id: 1,
      report: 'Flooded Street',
      user: 'John Doe',
      severity: 'High',
      status: 'Pending'
    }
  ];

  return (
    <div className="main-view">
      {/* View Header */}
      <div className="view-header">
        <div className="view-title-container">
          <h1>Reports Moderation</h1>
          <span className="view-subtitle">Last updated: {lastUpdated}</span>
        </div>
      </div>

      <div className="stations-split-layout" style={{ marginTop: '24px', alignItems: 'flex-start' }}>
        
        {/* Left Column: Queue & Map */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Reports Queue Section */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)' }}>
              Reports Queue
            </h2>
            
            {/* Search Bar */}
            <div style={{ marginBottom: '24px' }}>
              <input 
                type="text" 
                placeholder="Search for a report..." 
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid var(--color-border)',
                  backgroundColor: '#fff',
                  fontSize: '14px',
                  color: 'var(--text-main)',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                }}
              />
            </div>

            {/* Table Card */}
            <div className="stations-card" style={{ padding: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <div className="table-container" style={{ margin: '0' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid var(--color-border)' }}>
                    <tr>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', fontSize: '13px' }}>Report</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', fontSize: '13px' }}>User</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', fontSize: '13px' }}>Severity</th>
                      <th style={{ padding: '12px 24px', textAlign: 'left', fontWeight: '700', color: 'var(--text-main)', fontSize: '13px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reports.map((report) => (
                      <tr key={report.id} className="table-row-hover" style={{ borderBottom: '1px solid var(--color-border)', cursor: 'pointer' }}>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-main)' }}>{report.report}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', color: 'var(--text-main)' }}>{report.user}</td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: report.severity === 'High' ? '#dc2626' : 'inherit' }}>
                          {report.severity}
                        </td>
                        <td style={{ padding: '16px 24px', fontSize: '14px', fontWeight: '600', color: report.status === 'Pending' ? '#0284c7' : 'inherit' }}>
                          {report.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {/* Empty space to match the height in the screenshot */}
                <div style={{ height: '140px' }}></div>
              </div>

              {/* Pagination Footer */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                padding: '16px 24px', 
                borderTop: '1px solid var(--color-border)',
                backgroundColor: '#fff'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>1 of 1 record</span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ 
                    padding: '6px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--color-border)', 
                    backgroundColor: '#fff', 
                    color: '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'not-allowed'
                  }}>
                    <ChevronLeft size={16} />
                  </button>
                  <button style={{ 
                    padding: '4px 16px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--color-border)', 
                    backgroundColor: '#fff', 
                    color: 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    1
                  </button>
                  <button style={{ 
                    padding: '6px', 
                    borderRadius: '6px', 
                    border: '1px solid var(--color-border)', 
                    backgroundColor: '#fff', 
                    color: '#d1d5db',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'not-allowed'
                  }}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Map View Section */}
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: 'var(--text-main)' }}>
              Map View
            </h2>
            <div className="stations-card" style={{ padding: '0', overflow: 'hidden', height: '400px', backgroundColor: '#e5e7eb' }}>
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=121.07%2C14.62%2C121.12%2C14.66&amp;layer=mapnik" 
                style={{ border: 0, display: 'block' }}
                title="Map View"
              ></iframe>
            </div>
          </div>
          
        </div>

        {/* Right Column: Report Details */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-main)', margin: 0 }}>
              Report Details
            </h2>
            <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--color-border)', backgroundColor: '#f8fafc', fontSize: '13px', fontWeight: '600', color: 'var(--text-main)', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
              <RefreshCw size={14} />
              <span>Refresh</span>
            </button>
          </div>
          
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '600px' }}>
            <span style={{ fontSize: '16px', fontWeight: '600', color: '#9ca3af' }}>
              Select a report first to view details.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
