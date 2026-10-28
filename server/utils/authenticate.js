import bcrypt from 'bcrypt';

const LOCK_THRESHOLD = 5;
const LOCK_DURATION_SECONDS = 5 * 60;
// Valid cost-12 hash: unknown accounts still perform password-verification work.
const DUMMY_HASH = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxN7X.EcP71yNwvGr0m5Y4TzWvG';

export async function authenticate(pool, email, password) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [rows] = await connection.execute(
      `SELECT id, full_name, email, password, role, failed_attempts,
       GREATEST(0, TIMESTAMPDIFF(SECOND, NOW(), locked_until)) AS retry_after
       FROM users WHERE email = ? FOR UPDATE`,
      [email]
    );
    const user = rows[0];
    if (user?.retry_after > 0) {
      await connection.commit();
      return { user: null, retryAfter: user.retry_after };
    }

    const matches = await bcrypt.compare(password, user?.password || DUMMY_HASH);
    if (!user) {
      await connection.commit();
      return { user: null, retryAfter: 0 };
    }

    const attempts = matches ? 0 : Number(user.failed_attempts || 0) + 1;
    const retryAfter = attempts >= LOCK_THRESHOLD ? LOCK_DURATION_SECONDS : 0;
    await connection.execute(
      `UPDATE users SET failed_attempts = ?,
       locked_until = IF(? > 0, TIMESTAMPADD(SECOND, ?, NOW()), NULL) WHERE id = ?`,
      [retryAfter ? 0 : attempts, retryAfter, retryAfter, user.id]
    );
    await connection.commit();
    return { user: matches ? user : null, retryAfter };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
