import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Trash2, 
  Clock, 
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { apiClient } from '../apiClient';

export default function RegistrarCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newCourse, setNewCourse] = useState({
    course_code: '',
    title: '',
    units: 3,
    instructor: '',
    schedule: '',
    max_seats: 40
  });

  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch courses from MySQL or Supabase database
  const fetchCourses = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Try fetching from local MySQL API backend
      try {
        const mysqlData = await apiClient.getCourses();
        if (mysqlData && Array.isArray(mysqlData)) {
          setCourses(mysqlData);
          setLoading(false);
          return;
        }
      } catch (mysqlErr) {
        console.warn('MySQL API fetch failed, trying Supabase fallback:', mysqlErr.message);
      }

      // 2. Supabase Fallback
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (!data || data.length === 0) {
        // Seed default sample courses into database if table is empty
        const sampleCourses = [
          { course_code: 'CS 101', title: 'Introduction to Computer Science', units: 3, instructor: 'Dr. Alan Turing', schedule: 'MWF 09:00 - 10:00 AM', max_seats: 40, enrolled_seats: 38 },
          { course_code: 'IAS 202', title: 'Information Assurance & Security 2', units: 3, instructor: 'Prof. Ada Lovelace', schedule: 'TTH 01:30 - 03:00 PM', max_seats: 35, enrolled_seats: 35 },
          { course_code: 'CS 305', title: 'Database Management Systems', units: 4, instructor: 'Dr. Edgar Codd', schedule: 'MWF 11:00 - 12:30 PM', max_seats: 40, enrolled_seats: 28 },
          { course_code: 'NET 401', title: 'Computer Networks & Distributed Systems', units: 3, instructor: 'Prof. Vint Cerf', schedule: 'TTH 09:00 - 10:30 AM', max_seats: 30, enrolled_seats: 19 }
        ];

        const { data: seeded, error: seedErr } = await supabase.from('courses').insert(sampleCourses).select();
        if (!seedErr && seeded) {
          setCourses(seeded);
        }
      } else {
        setCourses(data);
      }
    } catch (err) {
      console.error('Database fetch error:', err);
      setErrorMsg(err.message || 'Could not connect to courses database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Insert course into Supabase
  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourse.course_code || !newCourse.title) return;

    setErrorMsg('');
    try {
      const payload = {
        ...newCourse,
        units: Number(newCourse.units),
        max_seats: Number(newCourse.max_seats),
        enrolled_seats: 0
      };

      const { data, error } = await supabase
        .from('courses')
        .insert([payload])
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setCourses([data[0], ...courses]);
      } else {
        await fetchCourses();
      }

      setShowModal(false);
      setNewCourse({ course_code: '', title: '', units: 3, instructor: '', schedule: '', max_seats: 40 });
      setNotification(`Course ${payload.course_code} successfully saved to Supabase database.`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Database insert error:', err);
      setErrorMsg(err.message || 'Failed to insert course into database.');
    }
  };

  // Delete course from Supabase
  const handleDeleteCourse = async (id, code) => {
    if (!window.confirm(`Are you sure you want to delete ${code} from the database?`)) return;

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCourses(courses.filter(c => c.id !== id));
      setNotification(`Course ${code} deleted from Supabase database.`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Database delete error:', err);
      setErrorMsg(err.message || 'Failed to delete course from database.');
    }
  };

  const filteredCourses = courses.filter(c => 
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
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
              REGISTRAR ADMIN CONSOLE
            </span>
            <span style={{ 
              padding: '2px 8px', 
              backgroundColor: '#fef2f2', 
              color: '#991b1b', 
              borderRadius: '4px', 
              fontSize: '11px', 
              fontWeight: 700 
            }}>
              V3 TARGET ROUTE
            </span>
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Curriculum & Course Management
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Create and edit course offerings, section capacities, and instructor assignments.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={fetchCourses}
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
          
          <button 
            onClick={() => setShowModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#1e3a8a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(30, 58, 138, 0.2)'
            }}
          >
            <Plus size={18} /> Add New Course
          </button>
        </div>
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

      {notification && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          backgroundColor: '#ecfdf5',
          border: '1px solid #a7f3d0',
          borderRadius: '8px',
          color: '#065f46',
          fontSize: '14px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          <CheckCircle size={18} />
          {notification}
        </div>
      )}

      {/* Search & Statistics Bar */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', alignItems: 'center' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
          <input 
            type="text"
            placeholder="Search by course code, title, or instructor..."
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

        <div style={{
          padding: '10px 16px',
          backgroundColor: '#ffffff',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: 600,
          color: '#334155'
        }}>
          Total Offerings: <span style={{ color: '#1e3a8a', fontWeight: 800 }}>{filteredCourses.length}</span>
        </div>
      </div>

      {/* Course List Table */}
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
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Course Code</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Course Title</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Units</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Instructor</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Schedule</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Slots</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((c, index) => {
              const isFull = c.enrolled_seats >= c.max_seats;
              return (
                <tr key={c.id} style={{ borderBottom: index < filteredCourses.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                  <td style={{ padding: '14px 18px', fontWeight: 700, color: '#1e3a8a', fontSize: '14px' }}>
                    {c.course_code}
                  </td>
                  <td style={{ padding: '14px 18px', fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>
                    {c.title}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#475569', fontSize: '14px' }}>
                    {c.units} Units
                  </td>
                  <td style={{ padding: '14px 18px', color: '#334155', fontSize: '14px' }}>
                    {c.instructor}
                  </td>
                  <td style={{ padding: '14px 18px', color: '#64748b', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      {c.schedule}
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px' }}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 700,
                      backgroundColor: isFull ? '#fef2f2' : '#f0fdf4',
                      color: isFull ? '#991b1b' : '#166534',
                      border: isFull ? '1px solid #fca5a5' : '1px solid #bbf7d0'
                    }}>
                      {c.enrolled_seats} / {c.max_seats} {isFull ? '(FULL)' : ''}
                    </span>
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteCourse(c.id, c.course_code)}
                      style={{
                        padding: '6px 10px',
                        backgroundColor: '#fff1f2',
                        color: '#e11d48',
                        border: '1px solid #fecdd3',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal for Adding Course */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            width: '100%',
            maxWidth: '480px',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '16px' }}>
              Add New Course Offering
            </h2>

            <form onSubmit={handleAddCourse} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Course Code
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. IAS 301" 
                  value={newCourse.course_code}
                  onChange={(e) => setNewCourse({ ...newCourse, course_code: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Course Title
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Ethical Hacking & Penetration Testing" 
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Units
                  </label>
                  <input 
                    type="number" 
                    value={newCourse.units}
                    onChange={(e) => setNewCourse({ ...newCourse, units: parseInt(e.target.value) || 3 })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    required
                  />
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                    Seat Limit
                  </label>
                  <input 
                    type="number" 
                    value={newCourse.max_seats}
                    onChange={(e) => setNewCourse({ ...newCourse, max_seats: parseInt(e.target.value) || 40 })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Instructor Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Dr. Kevin Mitnick" 
                  value={newCourse.instructor}
                  onChange={(e) => setNewCourse({ ...newCourse, instructor: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '4px' }}>
                  Schedule & Room
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. MWF 01:00 - 02:30 PM (Lab 3)" 
                  value={newCourse.schedule}
                  onChange={(e) => setNewCourse({ ...newCourse, schedule: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 16px', backgroundColor: '#f1f5f9', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  style={{ padding: '10px 16px', backgroundColor: '#1e3a8a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Save & Publish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
