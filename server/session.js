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

export const sessionMiddleware = session({
  name: 'aucres.sid',
  secret: process.env.SESSION_SECRET || 'dev-session-secret-change-me',
  store: sessionStore,
  resave: false,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: false,
    maxAge: 1000 * 60 * 60 * 8,
  },
});
