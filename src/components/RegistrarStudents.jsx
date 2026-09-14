import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function RegistrarStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch students from Supabase
  const fetchStudents = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed default sample students if database table is empty
        const sampleStudents = [
          { student_number: '2026-0001', full_name: 'Juan Dela Cruz', email: 'juan.delacruz@university.edu.ph', program: 'BS Computer Science', year_level: 3, status: 'Enrolled' },
          { student_number: '2026-0002', full_name: 'Maria Santos', email: 'maria.santos@university.edu.ph', program: 'BS Information Technology', year_level: 2, status: 'Enrolled' },
          { student_number: '2026-0003', full_name: 'Alex Bonifacio', email: 'alex.bonifacio@university.edu.ph', program: 'BS Cybersecurity', year_level: 4, status: 'Pending Review' },
          { student_number: '2026-0004', full_name: 'Rizalina Mercado', email: 'rizal.mercado@university.edu.ph', program: 'BS Computer Engineering', year_level: 1, status: 'Enrolled' }
        ];

        const { data: seeded, error: seedErr } = await supabase.from('students').insert(sampleStudents).select();
        if (!seedErr && seeded) {
          setStudents(seeded);
        }
      } else {
        setStudents(data);
      }
    } catch (err) {
      console.error('Students fetch error:', err);
      setErrorMsg(err.message || 'Could not fetch students from Supabase database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(s => 
    (s.full_name || s.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.student_number || '').includes(search) ||
    (s.program || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
      
      {/* Header Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        backgroundColor: '#ffffff',
        padding: '20px 24px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ 
              padding: '2px 8px', 
              backgroundColor: '#dbeafe', 
              color: '#1e40af', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: 700 
            }}>
              REGISTRAR MASTER DIRECTORY
            </span>
            <span style={{ 
              padding: '2px 8px', 
              backgroundColor: '#fef2f2', 
              color: '#991b1b', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: 700 
            }}>
              V2 IDOR TARGET VIEW
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Master Enrollment List & Student Loads
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Review official student registration records, study load details, and enrollment status.
          </p>
        </div>

        <button 
          onClick={fetchStudents}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            backgroundColor: '#f1f5f9',
            color: '#334155',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '13px',
            cursor: 'pointer'
          }}
        >
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      {errorMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: '8px',
          color: '#991b1b',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          <AlertCircle size={18} />
          {errorMsg}
        </div>
      )}

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Search by student number, name, or degree program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '11px 16px 11px 42px',
              backgroundColor: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontSize: '14px',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Student List Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Student No.</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Student Name</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Degree Program</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Year Level</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s, index) => (
              <tr key={s.id || s.student_number} style={{ borderBottom: index < filteredStudents.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '14px' }}>
                  {s.student_number}
                </td>
                <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                  <div>{s.full_name || s.name}</div>
                  <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 400 }}>{s.email}</div>
                </td>
                <td style={{ padding: '14px 18px', color: '#334155', fontSize: '14px' }}>
                  {s.program}
                </td>
                <td style={{ padding: '14px 18px', color: '#475569', fontSize: '14px' }}>
                  {s.year_level ? `${s.year_level}th Year` : s.year}
                </td>
                <td style={{ padding: '14px 18px' }}>
                  <span style={{
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 700,
                    backgroundColor: s.status === 'Enrolled' ? '#f0fdf4' : '#fffbe6',
                    color: s.status === 'Enrolled' ? '#166534' : '#b45309',
                    border: s.status === 'Enrolled' ? '1px solid #bbf7d0' : '1px solid #fef08a'
                  }}>
                    {s.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
