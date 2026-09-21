import { rateLimit } from 'express-rate-limit';

// Layer 1 of brute-force defense: throttle by IP address, regardless of
// which account is being targeted. This catches an attacker spraying
// guesses across many different email addresses, which the per-account
// lockout in auth.routes.js alone would not.
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts from this network. Please try again later.' },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration attempts. Please try again later.' },
});
