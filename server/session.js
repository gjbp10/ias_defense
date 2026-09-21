import session from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import { pool } from './db.js';

const MySQLStore = MySQLStoreFactory(session);

// Sessions live in MySQL (the `sessions` table -- see ias_defense_db.sql)
// instead of in-memory, so logins survive a server restart and work
// correctly once there's more than one server instance.
export const sessionStore = new MySQLStore(
  {
    createDatabaseTable: true,
    expiration: 1000 * 60 * 60 * 8, // 8 hours
    schema: {
      tableName: 'sessions',
      columnNames: {
        session_id: 'session_id',
        expires: 'expires',
        data: 'data',
      },
    },
  },
  pool
);

const isProduction = process.env.NODE_ENV === 'production';

// NOTE on cross-origin cookies: the frontend (Vercel) and this API (Railway)
// are different origins, so the session cookie must be SameSite=None; Secure
// in production for the browser to send it at all. That also means
// SameSite gives us zero built-in CSRF protection here -- the explicit
// double-submit CSRF token (server/middleware/csrf.js) is the real defense,
// not a redundant one. See the refactor plan for why this matters.
export const sessionMiddleware = session({
  name: 'aucres.sid',
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  store: sessionStore,
  resave: false,
  // true so an anonymous session (and its id) exists as soon as the app
  // loads -- the CSRF token issued before login needs a stable session id
  // to bind to, otherwise the login/register POST itself couldn't be
  // protected against CSRF.
  saveUninitialized: true,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 8,
  },
});
