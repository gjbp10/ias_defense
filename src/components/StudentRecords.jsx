import React, { useState, useEffect } from 'react';
import { BookOpen, User, CheckCircle, FileText, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { apiClient } from '../apiClient';

export default function StudentRecords({ session }) {
  const [student, setStudent] = useState({
    student_number: '2026-0001',
    full_name: 'Juan Dela Cruz',
    email: 'juan.delacruz@university.edu.ph',
    program: 'BS Computer Science',
    year_level: 3,
    status: 'Enrolled'
  });

  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [notification, setNotification] = useState('');

  const fetchRecords = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Try MySQL API
      try {
        const mysqlEnrolled = await apiClient.getEnrollments(student.student_number);
        if (mysqlEnrolled && Array.isArray(mysqlEnrolled)) {
          setEnrolledCourses(mysqlEnrolled);
          setLoading(false);
          return;
        }
      } catch (mErr) {
        console.warn('MySQL enrollment fetch notice:', mErr.message);
      }

      // 2. Supabase fallback
      const { data: studentData } = await supabase
        .from('students')
        .select('*')
        .eq('student_number', student.student_number)
        .maybeSingle();

      if (studentData) {
        setStudent(studentData);
      }

      const { data: enrollments, error: enrollErr } = await supabase
        .from('enrollments')
        .select('course_code, enrolled_at')
        .eq('student_number', student.student_number);

      if (enrollErr) throw enrollErr;

      if (enrollments && enrollments.length > 0) {
        const codes = enrollments.map(e => e.course_code);
        const { data: courseDetails } = await supabase
          .from('courses')
          .select('*')
          .in('course_code', codes);

        setEnrolledCourses(courseDetails || []);
      } else {
        setEnrolledCourses([]);
      }
    } catch (err) {
      console.error('Fetch study load error:', err);
      setErrorMsg(err.message || 'Failed to load study load records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDropCourse = async (courseCode) => {
    if (!window.confirm(`Are you sure you want to drop ${courseCode} from your study load?`)) return;

    try {
      const { error } = await supabase
        .from('enrollments')
        .delete()
        .eq('student_number', student.student_number)
        .eq('course_code', courseCode);

      if (error) throw error;

      setEnrolledCourses(enrolledCourses.filter(c => c.course_code !== courseCode));
      setNotification(`Dropped ${courseCode} from your current semester study load.`);
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Drop course error:', err);
      setErrorMsg(err.message || 'Could not drop course.');
    }
  };

  const totalUnits = enrolledCourses.reduce((sum, c) => sum + (c.units || 0), 0);

  return (
    <div style={{ padding: '24px', backgroundColor: '#f8fafc', minHeight: 'calc(100vh - 60px)' }}>
      
      {/* Student Profile Card */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '24px',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: '#1e3a8a',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 800
          }}>
            {student.full_name?.substring(0, 2).toUpperCase()}
          </div>

          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {student.full_name}
            </h2>
            <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '13px', color: '#64748b' }}>
              <span>Student ID: <strong style={{ color: '#1e3a8a' }}>{student.student_number}</strong></span>
              <span>•</span>
              <span>{student.program}</span>
              <span>•</span>
              <span>{student.year_level}rd Year</span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span style={{
            padding: '6px 14px',
            borderRadius: '20px',
            backgroundColor: '#f0fdf4',
            color: '#166534',
            border: '1px solid #bbf7d0',
            fontSize: '13px',
            fontWeight: 700
          }}>
            Status: {student.status}
          </span>
        </div>
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

      {/* Enrolled Courses Table */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
            Official Enrolled Study Load (1st Semester 2026-2027)
          </h3>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#1e3a8a' }}>
            Total Units: {totalUnits}
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0' }}>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Subject Code</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Descriptive Title</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Units</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Instructor</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Schedule</th>
              <th style={{ padding: '14px 18px', fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrolledCourses.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '32px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
                  No registered courses found for this semester.
                </td>
              </tr>
            ) : (
              enrolledCourses.map((c, index) => (
                <tr key={c.course_code} style={{ borderBottom: index < enrolledCourses.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
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
                    {c.schedule}
                  </td>
                  <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDropCourse(c.course_code)}
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
                      <Trash2 size={14} /> Drop
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
