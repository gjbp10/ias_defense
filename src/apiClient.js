const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// In-memory CSRF token cache. It's intentionally NOT stored in
// localStorage/sessionStorage -- it only needs to live as long as the tab
// does, and it gets invalidated (see below) whenever the session changes.
let csrfToken = null;

async function fetchCsrfToken() {
  const res = await fetch(`${API_BASE_URL}/auth/csrf-token`, { credentials: 'include' });
  const data = await res.json();
  csrfToken = data.csrfToken;
  return csrfToken;
}

// Every mutating request goes through here so credentials + the CSRF header
// are never something an individual component has to remember to add.
async function request(path, { method = 'GET', body } = {}) {
  const isMutating = method !== 'GET';

  if (isMutating && !csrfToken) {
    await fetchCsrfToken();
  }

  const headers = { 'Content-Type': 'application/json' };
  if (isMutating && csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

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
  getCsrfToken: fetchCsrfToken,

  register: async (fullName, email, password) => {
    const result = await request('/auth/register', { method: 'POST', body: { fullName, email, password } });
    csrfToken = null; // session was regenerated server-side; force a fresh token next call
    return result;
  },
  login: async (email, password) => {
    const result = await request('/auth/login', { method: 'POST', body: { email, password } });
    csrfToken = null;
    return result;
  },
  logout: async () => {
    const result = await request('/auth/logout', { method: 'POST' });
    csrfToken = null;
    return result;
  },
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
