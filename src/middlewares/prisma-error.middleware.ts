import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export function prismaErrorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    let status = 500;
    let message = 'Database error';

    switch (err.code) {
      case 'P2002':
        status = 409;
        message = 'Unique constraint violation';
        break;
      case 'P2025':
        status = 404;
        message = 'Record not found';
        break;
      case 'P2021':
        status = 500;
        message = 'Database schema is not initialized';
        break;
      case 'P2003':
        status = 409;
        message = 'Invalid relation reference';
        break;
    }

    return res.status(status).json({
      statusCode: status,
      message,
      prismaCode: err.code,
    });
  }

  next(err);
}
