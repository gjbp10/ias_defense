import mysql from 'mysql2/promise';

// Central connection pool. Every query in every route file goes through
// this pool using parameterized ("?") placeholders -- never string-built
// SQL -- which is what keeps this app safe from SQL injection.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ias_defense_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
