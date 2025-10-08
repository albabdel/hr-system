import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;

if (!SECRET) {
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export function signJwt(payload: object, expiresIn = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn });
}

export function verifyJwt<T = any>(token: string): T {
  try {
    return jwt.verify(token, SECRET) as T;
  } catch (error) {
    console.error("JWT Verification failed:", error);
    throw new Error("Invalid token");
  }
}
