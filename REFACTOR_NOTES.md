# AUCRES / IAS Defense Web — Security Refactor Notes

This refactor removes Supabase entirely and replaces it with custom,
server-verified authentication, plus fixes and live-tests mitigations for
brute force, SQL injection, and CSRF. See the conversation this shipped
from for the full plan; this file is the quick-start + what-changed summary.

## What changed, in one paragraph

Every route that used to hit Supabase now hits the Express/MySQL API in
`server/`. Auth is now bcrypt + server-side sessions (stored in MySQL) +
CSRF double-submit tokens, instead of Supabase Auth. The broken-access-control
bug (any self-registered account could reach the full registrar console by
clicking a client-side "switch portal" button) is fixed: every registrar-only
route is now gated server-side by `requireRole('registrar', 'admin')`, and
public registration always hardcodes `role = 'student'` no matter what a
client sends. All of this was verified against a real, running MySQL-backed
instance of this server, not just reviewed by reading the code — see the
test log in the conversation for the exact requests/responses.

## Running it locally

1. Install MySQL/MariaDB locally (or point `.env` at Railway) and load the schema:
   ```
   mysql -u root < ../../ias_defense_db.sql
   ```
   This seeds one registrar account:
   - email: `registrar@aucres.local`
   - password: `Registrar#2026`
   **Change this password on first login in any real deployment** — it's a
   known demo credential, not a secret.

2. Install dependencies and start the API:
   ```
   npm install
   npm run server        # or: npm run server:watch
   ```

3. In another terminal, start the frontend:
   ```
   npm run dev
   ```
   Set `VITE_API_URL` (see `.env.frontend.example`) if the API isn't at
   `http://localhost:8080/api`.

## Deploying

- Frontend → Vercel, same as before. Set `VITE_API_URL` to wherever the API
  below ends up.
- API (`server/`) → Railway (alongside the MySQL database), since it needs a
  persistent Node process for sessions/connection pooling — not a serverless
  function.
- Set real random values for `SESSION_SECRET` and `CSRF_SECRET` in the
  Railway environment (the `.env` placeholders are dev-only):
  ```
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- Set `CLIENT_ORIGIN` to your actual Vercel URL(s) (comma-separated if more
  than one), and `NODE_ENV=production` — this switches cookies to
  `Secure; SameSite=None`, which cross-origin cookies need to work at all.

## Additional hardening (2026-10-28)

- Account password checks and failed-attempt updates now share a transaction
  and `SELECT ... FOR UPDATE` lock. Five failures lock the account for five
  minutes, including concurrent guesses and guesses through other server
  instances. This requires the `users` table to use InnoDB and all instances
  to share the same database. The existing per-IP limiter remains in memory.
- API and audit queries use MySQL2 `execute()` with bound values. Dynamic
  columns still come only from fixed allowlists; multiple statements are disabled.
- CSRF validation runs before every API write. Tokens remain signed and bound
  to the session, and the token endpoint disables response caching.
- Environment configuration loads before security modules. Production refuses
  missing or shorter-than-32-byte `CSRF_SECRET` and `SESSION_SECRET` values;
  generate separate random values using the command above. Development uses
  temporary random secrets when these values are absent.

Verification for this additional pass: `node --test tests/security.test.js`
passed 12 unit checks, and `npm run build` passed. Server syntax checks passed;
targeted lint reported one existing unused-parameter warning. The concurrency
checks use a database double, so live MySQL, browser and deployment behavior
have not been verified by this pass. No database migration was run.

## Known follow-up (not part of this security pass)

Student-facing screens (`StudentCourseRegistration.jsx`, `StudentRecords.jsx`)
still show a hardcoded demo student (`2026-0001`) regardless of which account
is logged in — there's no link between `users` and `students` yet. Wiring
that up (e.g. a `user_id` column on `students`, or matching by email) is a
data-model/product decision outside the scope of "fix the three threats and
remove Supabase," so it was deliberately left alone rather than guessed at.

## What was tested live (not just reviewed)

Against a real MySQL-backed instance of `server/index.js`:
- Registering with `"role": "admin"` injected into the request body still
  creates a `student` account — the privilege-escalation bug is fixed.
- A student account gets `403` on every registrar-only route, including via
  a direct API call bypassing the UI entirely.
- 5 wrong passwords lock the account for 5 minutes (`423`), logged attempt by
  attempt in `login_attempts` — including that even the *correct* password
  is rejected while locked.
- Classic SQL injection payloads (`' OR '1'='1`, `'; DROP TABLE students; --`)
  in login and course-creation fields fail safely / are stored as inert
  text — the schema is untouched.
- A state-changing POST with a valid session cookie but no CSRF header is
  rejected (`403`) and creates nothing; the same request with the correct
  `X-CSRF-Token` header succeeds.
