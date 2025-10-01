import rateLimit from 'express-rate-limit';

export const writesLimiter = rateLimit({
  windowMs: 60_000,
  max: 60, // 60 writes/min/IP
  standardHeaders: true,
  legacyHeaders: false,
});
