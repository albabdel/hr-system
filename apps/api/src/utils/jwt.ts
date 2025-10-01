import jwt from 'jsonwebtoken';
import { env } from '../env.js';
import type { Role } from '@prisma/client';

type AccessClaims = { sub: string; tid: string; role: Role; typ: 'access' };
type RefreshClaims = { sub: string; tid: string; typ: 'refresh'; jti: string };

export function signAccessToken(payload: Omit<AccessClaims, 'typ'>) {
  return jwt.sign({ ...payload, typ: 'access' } as AccessClaims, env.JWT_SECRET, { expiresIn: '15m' });
}

export function signRefreshToken(payload: Omit<RefreshClaims, 'typ'>, expires: string = '30d') {
  return jwt.sign({ ...payload, typ: 'refresh' } as RefreshClaims, env.JWT_SECRET, { expiresIn: expires });
}

export function verifyToken<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}
