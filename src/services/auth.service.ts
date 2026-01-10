import crypto from 'crypto';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../utils/tokens';
import { jwtConfig } from '../config/jwt';

export class AuthService {
  /**
   * Регистрация нового пользователя
   */
  static async signup(login: string, password: string) {
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        login,
        passwordHash,
      },
    });

    // создаём сессию сразу после регистрации
    return this.createSession(user.id);
  }

  /**
   * Авторизация пользователя
   */
  static async signin(login: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { login },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    return this.createSession(user.id);
  }

  /**
   * Обновление access токена по refresh токену
   */
  static async refresh(refreshToken: string) {
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

    const session = await prisma.session.findFirst({
      where: {
        refreshTokenHash,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!session) {
      throw new Error('Invalid refresh token');
    }

    const accessToken = generateAccessToken({
      sub: session.userId,
      sid: session.id,
    });

    return { accessToken };
  }

  /**
   * Logout (отзыв сессии)
   */
  static async logout(sessionId: string) {
    await prisma.session.update({
      where: { id: sessionId },
      data: { revoked: true },
    });
  }

  // =========================
  // ВНУТРЕННИЕ МЕТОДЫ
  // =========================

  private static async createSession(userId: string) {
    const refreshToken = generateRefreshToken();
    const refreshTokenHash = this.hashRefreshToken(refreshToken);

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
