import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const status = err.status || err.statusCode || 500;

  const response = {
    status: 'error',
    message: err.message || 'Internal Server Error',
    path: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  // Логируем ПОЛНОСТЬЮ (для Docker / logs)
  console.error('[ERROR]', {
    status,
    error: err,
  });

  res.status(status).json(response);
}
