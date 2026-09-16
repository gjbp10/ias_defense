const API_BASE_URL = 'http://localhost:5000/api';

export const apiClient = {
  // Students
  getStudents: async () => {
    const res = await fetch(`${API_BASE_URL}/students`);
    if (!res.ok) throw new Error('Failed to fetch students from MySQL');
    return res.json();
  },

  // Courses
  getCourses: async () => {
    const res = await fetch(`${API_BASE_URL}/courses`);
    if (!res.ok) throw new Error('Failed to fetch courses from MySQL');
    return res.json();
  },

  addCourse: async (courseData) => {
    const res = await fetch(`${API_BASE_URL}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(courseData)
    });
    if (!res.ok) throw new Error('Failed to insert course into MySQL');
    return res.json();
  },

  deleteCourse: async (id) => {
    const res = await fetch(`${API_BASE_URL}/courses/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Failed to delete course from MySQL');
    return res.json();
  },

  // Enrollments
  getEnrollments: async (studentNumber) => {
    const res = await fetch(`${API_BASE_URL}/enrollments/${studentNumber}`);
    if (!res.ok) throw new Error('Failed to fetch study load from MySQL');
    return res.json();
  },

  enrollCourse: async (student_number, course_code) => {
    const res = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_number, course_code })
    });
    if (!res.ok) throw new Error('Failed to complete registration in MySQL');
    return res.json();
  },

  dropCourse: async (student_number, course_code) => {
    const res = await fetch(`${API_BASE_URL}/enrollments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ student_number, course_code })
    });
    if (!res.ok) throw new Error('Failed to drop course from MySQL');
    return res.json();
  }
};
