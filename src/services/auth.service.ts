import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken, hashRefreshToken,
} from '../utils/tokens';
import { jwtConfig } from '../config/jwt';

export class AuthService {
  /**
   * Регистрация
   */
  static async signup(login: string, password: string) {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        login,
        passwordHash,
      },
    });

    return this.createSession(user.id);
  }

  /**
   * Логин
   */
  static async signin(login: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      throw new Error('Invalid credentials');
    }

    return this.createSession(user.id);
  }

  /**
   * Обновление access token
   */
  static async refresh(refreshToken: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!session) {
      const err: any = new Error('Invalid refresh token');
      err.status = 401;
      throw err
    }

    // 🔥 ROTATION
    const newRefreshToken = crypto.randomBytes(64).toString('hex');
    const newRefreshTokenHash = this.hashRefreshToken(newRefreshToken);

    await prisma.session.update({
      where: { id: session.id },
      data: {
        refreshTokenHash: newRefreshTokenHash,
      },
    });

    const accessToken = generateAccessToken({
      sub: session.userId,
      sid: session.id,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logout — отзыв конкретной сессии
   */
  static async logout(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
  }

  // =========================
  // INTERNALS
  // =========================

  private static async createSession(userId: string) {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = hashRefreshToken(refreshToken);

    const session = await prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        expiresAt: new Date(
          Date.now() + jwtConfig.refresh.ttl * 1000
        ),
      },
    });

    const accessToken = generateAccessToken({
      sub: userId,
      sid: session.id,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  private static hashRefreshToken(token: string): string {
    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }
}
