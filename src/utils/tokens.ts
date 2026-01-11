import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt';
import { AccessTokenPayload } from '../shared/types/auth';

/**
 * Access token (JWT)
 */
export function generateAccessToken(
  payload: AccessTokenPayload
): string {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.ttl,
  });
}

/**
 * Refresh token (opaque string)
 */
export function generateRefreshToken(): string {
  return crypto.randomBytes(48).toString('hex');
}

/**
 * Hash refresh token for DB
 */
export function hashRefreshToken(token: string): string {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
}

