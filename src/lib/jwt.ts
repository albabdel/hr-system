
import jwt from "jsonwebtoken";
const SECRET = process.env.JWT_SECRET!;
export function signJwt(payload: object, expiresIn = "1d") {
  return jwt.sign(payload, SECRET, { expiresIn });
}
export function verifyJwt<T = any>(token: string) {
  return jwt.verify(token, SECRET) as T;
}
