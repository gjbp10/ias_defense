# Changes

- Removed login and registration request throttling.
- Removed account lockout and failed-attempt enforcement.
- Removed CSRF token generation, validation, middleware, and client headers.
- Allowed credentialed requests from arbitrary origins and form-encoded bodies.
- Removed parameterized SQL queries and dynamic-query allowlists.
- Enabled multiple SQL statements in the database connection.
- Removed unused security dependencies and middleware files.
