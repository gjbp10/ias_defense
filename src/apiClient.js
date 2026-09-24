const API_BASE_URL = '/api';

async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include', // send/receive the session cookie cross-origin
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch (_err) {
    // No JSON body (e.g. some error responses) -- that's fine.
  }

  if (!res.ok) {
    const error = new Error((data && data.error) || `Request failed with status ${res.status}`);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const apiClient = {
  // --- Auth ---
  register: (fullName, email, password) =>
    request('/auth/register', { method: 'POST', body: { fullName, email, password } }),
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: { email, password } }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getSession: () => request('/auth/session'),

  // --- Students / Courses / Enrollments ---
  getStudents: () => request('/students'),
  getCourses: () => request('/courses'),
  addCourse: (data) => request('/courses', { method: 'POST', body: data }),
  deleteCourse: (id) => request(`/courses/${id}`, { method: 'DELETE' }),
  getEnrollments: (studentNumber) => request(`/enrollments/${studentNumber}`),
  enrollCourse: (student_number, course_code) =>
    request('/enrollments', { method: 'POST', body: { student_number, course_code } }),
  dropCourse: (student_number, course_code) =>
    request('/enrollments', { method: 'DELETE', body: { student_number, course_code } }),

  // --- Advisories ---
  getAdvisories: () => request('/advisories'),
  createAdvisory: (data) => request('/advisories', { method: 'POST', body: data }),
  updateAdvisory: (id, data) => request(`/advisories/${id}`, { method: 'PUT', body: data }),
  deleteAdvisory: (id) => request(`/advisories/${id}`, { method: 'DELETE' }),

  // --- Emergency hotlines ---
  getHotlines: () => request('/hotlines'),
  createHotline: (data) => request('/hotlines', { method: 'POST', body: data }),

  // --- Monitoring stations (read-only; fed by the telemetry pipeline) ---
  getMonitoringStations: (orderBy) => request(`/monitoring-stations${orderBy ? `?orderBy=${orderBy}` : ''}`),

  // --- Community reports ---
  getCommunityReports: () => request('/community-reports'),
  updateCommunityReportStatus: (id, status) =>
    request(`/community-reports/${id}`, { method: 'PUT', body: { status } }),
};
