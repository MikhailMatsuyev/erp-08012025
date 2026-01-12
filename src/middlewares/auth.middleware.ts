import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { jwtConfig } from '../config/jwt';
import { JwtPayload, isJwtPayload, AccessTokenPayload } from '../shared/types/auth';

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = header.split(' ')[1];

  try {
    const decoded: AccessTokenPayload = jwt.verify(
      token,
      jwtConfig.access.secret
    ) as AccessTokenPayload;

    req.user = {
      sub: decoded.sub,
      sid: decoded.sid,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
