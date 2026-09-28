import { doubleCsrf } from 'csrf-csrf';

const isProduction = process.env.NODE_ENV === 'production';

// Double-submit-cookie CSRF protection, bound to the session id.
// Frontend flow: GET /api/auth/csrf-token once -> send the returned token
// back in the X-CSRF-Token header on every POST/PUT/DELETE. A forged
// cross-site request has no way to read that token (browsers block
// cross-origin reads of it), so it can't reproduce the header even though
// the session cookie itself rides along automatically.
export const {
  generateCsrfToken,
  doubleCsrfProtection,
  invalidCsrfTokenError,
} = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || 'dev-csrf-secret-change-me',
  getSessionIdentifier: (req) => req.session.id,
  cookieName: isProduction ? '__Host-aucres.csrf-token' : 'aucres.csrf-token',
  cookieOptions: {
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    httpOnly: true,
    path: '/',
  },
  size: 64,
  getCsrfTokenFromRequest: (req) => req.headers['x-csrf-token'],
});
