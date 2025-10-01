import { z } from 'zod';
import type { Request, Response, NextFunction } from 'express';

export class HttpError extends Error {
  status: number;
  code: string;
  details?: unknown;
  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const zParse =
  <T extends z.ZodTypeAny>(schema: T) =>
  (data: unknown) => {
    const res = schema.safeParse(data);
    if (!res.success) {
      throw new HttpError(400, 'BAD_REQUEST', 'Validation failed', res.error.flatten());
    }
    return res.data as z.infer<T>;
  };

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: { code: err.code, message: err.message, details: err.details } });
  }
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: { code: 'INTERNAL', message: 'Unexpected error' } });
}
