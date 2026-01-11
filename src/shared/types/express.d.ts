import { AccessTokenPayload } from './auth';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
      sessionId?: string;
    }
  }
}

export {};
