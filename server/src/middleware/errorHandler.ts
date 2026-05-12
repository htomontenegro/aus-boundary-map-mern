import { Request, Response, NextFunction } from 'express';

interface HttpError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (
  err: HttpError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(err);
  const status = err.status ?? err.statusCode ?? 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
};
