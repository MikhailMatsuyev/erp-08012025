import { Request, Response, NextFunction } from 'express';
import { BadRequestError } from "../utils/error";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone: string): boolean {
  return /^\+?\d{7,15}$/.test(phone);
}

export function validateAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {id, password} = req.body ?? {};

  if (typeof id !== 'string') {
    throw new BadRequestError('Invalid identifier');
  }

  const isEmail = isValidEmail(id);
  const isPhone = isValidPhone(id);

  if (!isEmail && !isPhone) {
    throw new BadRequestError('Invalid email or phone');
  }

  if (typeof password !== 'string' || password.length < 6) {
    throw new BadRequestError('Invalid email or password');
  }

  // нормализация
  if (isEmail) {
    req.body.email = id.toLowerCase().trim();
  }

  if (isPhone) {
    req.body.phone = id.replace(/\s+/g, '');
  }

  next();
}
