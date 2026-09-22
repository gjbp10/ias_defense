import mysql from 'mysql2/promise';

// Central connection pool. Every query in every route file goes through
// this pool using parameterized ("?") placeholders -- never string-built
// SQL -- which is what keeps this app safe from SQL injection.
export const pool = mysql.createPool({
  host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
  user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || 'ias_defense_db',
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

