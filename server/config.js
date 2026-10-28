import 'dotenv/config';
import { randomBytes } from 'node:crypto';

export const isProduction = process.env.NODE_ENV === 'production';

export function readSecret(name) {
  const secret = process.env[name];
  if (isProduction && (!secret || Buffer.byteLength(secret) < 32)) {
    throw new Error(`${name} must contain at least 32 bytes in production. Generate a random secret.`);
  }
  return secret || randomBytes(48).toString('hex');
}
