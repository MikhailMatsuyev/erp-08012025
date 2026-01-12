import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from "../utils/error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {email, password} = req.body ?? {};

  if (typeof email !== 'string' || !isValidEmail(email)) {
    throw new BadRequestError('Invalid email');
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new BadRequestError('Invalid email or password');
  }

  req.body.email = email.toLowerCase().trim();
  next();
}

