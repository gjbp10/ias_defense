import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import bcrypt from 'bcrypt';
import { authenticate } from '../server/utils/authenticate.js';
import { generateCsrfToken, doubleCsrfProtection, invalidCsrfTokenError } from '../server/middleware/csrf.js';

const passwordHash = await bcrypt.hash('correct password', 4);

// In-memory database double: honors row locking and transaction boundaries.
// This tests application concurrency logic without a running MySQL server.
function fakePool({ missing = false, failOnUpdate = false } = {}) {
  const state = {
    row: missing ? null : { id: 1, email: 'student@example.test', password: passwordHash, failed_attempts: 0, lockedUntil: 0 },
    now: 1000, reads: [], writes: 0, commits: 0, rollbacks: 0, releases: 0,
  };
  let lock = Promise.resolve();
  return {
    state,
    async getConnection() {
      let unlock;
      let before;
      const finish = () => { unlock?.(); unlock = undefined; };
      return {
        async beginTransaction() {},
        async execute(sql, values) {
          if (sql.startsWith('SELECT')) {
            if (sql.includes('FOR UPDATE')) {
              const previous = lock;
              lock = new Promise(resolve => { unlock = resolve; });
              await previous;
            }
            before = state.row && { ...state.row };
            state.reads.push({ sql, values });
            return [state.row ? [{ ...state.row, retry_after: Math.max(0, state.row.lockedUntil - state.now) }] : []];
          }
          if (failOnUpdate) throw new Error('Database write failed');
          const [attempts, retryAfter, duration, id] = values;
          assert.equal(id, state.row.id);
          state.row.failed_attempts = attempts;
          state.row.lockedUntil = retryAfter ? state.now + duration : 0;
          state.writes++;
          return [{ affectedRows: 1 }];
        },
        async commit() { state.commits++; finish(); },
        async rollback() { state.row = before; state.rollbacks++; finish(); },
        release() { state.releases++; finish(); },
      };
    },
  };
}

test('concurrent wrong passwords reach one shared account lock after five failures', async () => {
  const pool = fakePool();
  const results = await Promise.all(Array.from({ length: 12 }, () => authenticate(pool, 'student@example.test', 'wrong')));
  assert.equal(results.filter(result => result.retryAfter === 0).length, 4);
  assert.equal(results.filter(result => result.retryAfter === 300).length, 8);
  assert.equal(pool.state.writes, 5);
  assert.equal(pool.state.releases, 12);
});

test('correct password is rejected while locked and works after expiry', async () => {
  const pool = fakePool();
  pool.state.row.lockedUntil = pool.state.now + 300;
  assert.equal((await authenticate(pool, 'student@example.test', 'correct password')).user, null);
  assert.equal(pool.state.writes, 0);
  pool.state.now += 301;
  assert.equal((await authenticate(pool, 'student@example.test', 'correct password')).user.id, 1);
  assert.equal(pool.state.row.lockedUntil, 0);
});

test('successful login clears previous failures', async () => {
  const pool = fakePool();
  pool.state.row.failed_attempts = 4;
  assert.equal((await authenticate(pool, 'student@example.test', 'correct password')).user.id, 1);
  assert.equal(pool.state.row.failed_attempts, 0);
});

test('database failure rolls back, releases the connection, and never authenticates', async () => {
  const pool = fakePool({ failOnUpdate: true });
  await assert.rejects(authenticate(pool, 'student@example.test', 'correct password'), /Database write failed/);
  assert.equal(pool.state.rollbacks, 1);
  assert.equal(pool.state.commits, 0);
  assert.equal(pool.state.releases, 1);
  assert.equal(pool.state.row.failed_attempts, 0);
});

test('unknown account is rejected and SQL-like input stays in the bound parameter', async () => {
  const pool = fakePool({ missing: true });
  const email = "' OR 1=1 --";
  assert.deepEqual(await authenticate(pool, email, 'wrong'), { user: null, retryAfter: 0 });
  assert.deepEqual(pool.state.reads[0].values, [email]);
  assert.ok(!pool.state.reads[0].sql.includes(email));
  assert.equal(pool.state.writes, 0);
});

function csrfFixture() {
  const req = { method: 'POST', session: { id: 'session-one' }, headers: {}, cookies: {} };
  let cookieOptions;
  const token = generateCsrfToken(req, {
    cookie(name, value, options) { req.cookies[name] = value; cookieOptions = options; },
  });
  req.headers['x-csrf-token'] = token;
  return { req, token, cookieOptions };
}

function csrfError(req) {
  let error;
  doubleCsrfProtection(req, {}, value => { error = value; });
  return error;
}

test('signed CSRF token is accepted for its session on every write method', () => {
  const { req, cookieOptions } = csrfFixture();
  for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
    req.method = method;
    assert.equal(csrfError(req), undefined);
  }
  assert.equal(cookieOptions.httpOnly, true);
  assert.equal(cookieOptions.path, '/');
});

test('missing CSRF header is rejected even with valid cookies', () => {
  const { req } = csrfFixture();
  delete req.headers['x-csrf-token'];
  assert.equal(csrfError(req), invalidCsrfTokenError);
});

test('token from a previous or different session is rejected', () => {
  const { req } = csrfFixture();
  req.session.id = 'session-two';
  assert.equal(csrfError(req), invalidCsrfTokenError);
});

test('matching forged cookie and header are rejected without a valid signature', () => {
  const { req } = csrfFixture();
  const forged = '0'.repeat(64) + '.' + 'a'.repeat(128);
  req.cookies[Object.keys(req.cookies)[0]] = forged;
  req.headers['x-csrf-token'] = forged;
  assert.equal(csrfError(req), invalidCsrfTokenError);
});

test('safe read methods do not require a CSRF token', () => {
  for (const method of ['GET', 'HEAD', 'OPTIONS']) {
    assert.equal(csrfError({ method }), undefined);
  }
});

test('production refuses missing or short secrets for both CSRF and sessions', () => {
  for (const name of ['CSRF_SECRET', 'SESSION_SECRET']) {
    for (const value of ['', 'dev-secret']) {
      const result = spawnSync(process.execPath, ['--input-type=module', '-e',
        `import { readSecret } from './server/config.js'; readSecret('${name}');`], {
        cwd: new URL('..', import.meta.url), encoding: 'utf8',
        env: { ...process.env, NODE_ENV: 'production', DOTENV_CONFIG_QUIET: 'true', [name]: value },
      });
      assert.notEqual(result.status, 0);
      assert.match(result.stderr, /must contain at least 32 bytes/);
    }
  }
});

test('production uses secure host-only CSRF cookies when configured', () => {
  const result = spawnSync(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { generateCsrfToken } from './server/middleware/csrf.js';
    generateCsrfToken({ session: { id: 'session' }, cookies: {} }, {
      cookie(name, value, options) {
        assert.ok(name.startsWith('__Host-'));
        assert.equal(options.secure, true);
        assert.equal(options.httpOnly, true);
        assert.equal(options.path, '/');
        assert.equal(options.domain, undefined);
      }
    });
  `], {
    cwd: new URL('..', import.meta.url), encoding: 'utf8',
    env: { ...process.env, NODE_ENV: 'production', DOTENV_CONFIG_QUIET: 'true', CSRF_SECRET: 'a'.repeat(64) },
  });
  assert.equal(result.status, 0, result.stderr);
});
