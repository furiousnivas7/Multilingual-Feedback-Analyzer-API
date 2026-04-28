import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Validation error',
      statusCode: 400,
      details: err.flatten(),
    });
    return;
  }

  if (err instanceof AppError && err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      statusCode: err.statusCode,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    });
    return;
  }

  const message = err instanceof Error ? err.message : 'Internal server error';
  console.error('[errorHandler] -> Unhandled error:', message, err instanceof Error ? err.stack : '');
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    statusCode: 500,
    ...(process.env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
  });
}
