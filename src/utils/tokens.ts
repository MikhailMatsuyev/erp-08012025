import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { jwtConfig } from '../config/jwt';

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, jwtConfig.access.secret, {
    expiresIn: jwtConfig.access.ttl,
  });
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(
    token,
    jwtConfig.access.secret
  ) as AccessTokenPayload;
}
