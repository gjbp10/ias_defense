import React, { useState, useEffect } from 'react';
import { Search, Plus, CheckCircle, Clock, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { apiClient } from '../apiClient';

export default function StudentCourseRegistration({ session }) {
  const [courses, setCourses] = useState([]);
  const [enrolledCourseCodes, setEnrolledCourseCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registeringCode, setRegisteringCode] = useState(null);
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Default student ID or from logged in session
  const defaultStudentNumber = '2026-0001';

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Try MySQL API
      try {
        const mysqlCourses = await apiClient.getCourses();
        const mysqlEnrollments = await apiClient.getEnrollments(defaultStudentNumber);
        if (mysqlCourses && Array.isArray(mysqlCourses)) {
          setCourses(mysqlCourses);
          setEnrolledCourseCodes((mysqlEnrollments || []).map(e => e.course_code));
          setLoading(false);
          return;
        }
      } catch (mErr) {
        console.warn('MySQL catalog fetch notice:', mErr.message);
      }

      // 2. Supabase fallback
      const { data: courseData, error: courseErr } = await supabase
        .from('courses')
        .select('*')
        .order('course_code', { ascending: true });

      if (courseErr) throw courseErr;
      setCourses(courseData || []);

      const { data: enrollData, error: enrollErr } = await supabase
        .from('enrollments')
        .select('course_code')
        .eq('student_number', defaultStudentNumber);

      if (!enrollErr && enrollData) {
        setEnrolledCourseCodes(enrollData.map(e => e.course_code));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setErrorMsg(err.message || 'Error loading courses database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle course enrollment
  const handleEnroll = async (course) => {
    setRegisteringCode(course.course_code);
    setErrorMsg('');
    try {
      if (enrolledCourseCodes.includes(course.course_code)) {
        setErrorMsg(`You are already enrolled in ${course.course_code}.`);
        setRegisteringCode(null);
        return;
      }

      if (course.enrolled_seats >= course.max_seats) {
        setErrorMsg(`Course ${course.course_code} is already at full capacity.`);
        setRegisteringCode(null);
        return;
      }

      // Insert enrollment record
      const { error: insertErr } = await supabase
        .from('enrollments')
        .insert([{ student_number: defaultStudentNumber, course_code: course.course_code, status: 'Confirmed' }]);

      if (insertErr) throw insertErr;

      // Update seat count
      await supabase
        .from('courses')
        .update({ enrolled_seats: course.enrolled_seats + 1 })
        .eq('course_code', course.course_code);

      setEnrolledCourseCodes([...enrolledCourseCodes, course.course_code]);
      setNotification(`Successfully enrolled in ${course.course_code}: ${course.title}!`);
      setTimeout(() => setNotification(''), 4000);
      fetchData();
    } catch (err) {
      console.error('Enrollment error:', err);
      setErrorMsg(err.message || 'Failed to complete registration.');
    } finally {
      setRegisteringCode(null);
    }
  };

  const filteredCourses = courses.filter(c => 
    c.course_code.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.instructor.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
      
      {/* Banner */}
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
          <span style={{ padding: '2px 8px', backgroundColor: '#dbeafe', color: '#1e40af', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
            STUDENT PORTAL
          </span>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '4px 0 0 0' }}>
            Course Registration & Schedule Catalog
          </h1>
          <p style={{ color: '#64748b', fontSize: '13px', margin: '4px 0 0 0' }}>
            Select available course sections to register for 1st Semester 2026-2027.
          </p>
        </div>

        <button 
          onClick={fetchData}
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
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Refresh Catalog
        </button>
      </div>

      {notification && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
          <CheckCircle size={18} />
          {notification}
        </div>
      )}

      {errorMsg && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', backgroundColor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '8px', color: '#991b1b', fontSize: '14px', fontWeight: 600, marginBottom: '20px' }}>
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
            placeholder="Search catalog by subject code, title, or professor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '11px 16px 11px 42px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
          />
        </div>
      </div>

      {/* Course Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredCourses.map(course => {
          const isEnrolled = enrolledCourseCodes.includes(course.course_code);
          const isFull = course.enrolled_seats >= course.max_seats;

          return (
            <div key={course.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: isEnrolled ? '2px solid #10b981' : '1px solid #e2e8f0',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              position: 'relative'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#1e3a8a' }}>{course.course_code}</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: '#f1f5f9', color: '#475569' }}>
                    {course.units} Units
                  </span>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', marginBottom: '8px', lineHeight: 1.4 }}>
                  {course.title}
                </h3>

                <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '12px' }}>
                  Instructor: <strong>{course.instructor}</strong>
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569', marginBottom: '16px' }}>
                  <Clock size={14} />
                  {course.schedule}
                </div>
              </div>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: isFull ? '#dc2626' : '#166534' }}>
                  Slots: {course.enrolled_seats} / {course.max_seats} {isFull ? '(FULL)' : ''}
                </span>

                <button
                  onClick={() => handleEnroll(course)}
                  disabled={isEnrolled || isFull || registeringCode === course.course_code}
                  style={{
                    padding: '8px 14px',
                    backgroundColor: isEnrolled ? '#10b981' : isFull ? '#cbd5e1' : '#1e3a8a',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: (isEnrolled || isFull) ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {isEnrolled ? (
                    <> <CheckCircle size={14} /> Enrolled </>
                  ) : isFull ? (
                    'Section Full'
                  ) : registeringCode === course.course_code ? (
                    'Enrolling...'
                  ) : (
                    <> <Plus size={14} /> Add Class </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
