import bcrypt from 'bcrypt';
import crypto from 'crypto';

export function isLegacySha256(hash: string) {
  return /^[a-f0-9]{64}$/i.test(hash);
}

export async function hashPassword(pw: string) {
  const saltRounds = 12;
  return bcrypt.hash(pw, saltRounds);
}

export async function verifyPassword(password: string, storedHash: string) {
  if (isLegacySha256(storedHash)) {
    const sha = crypto.createHash('sha256').update(password).digest('hex');
    return sha === storedHash;
  }
  return bcrypt.compare(password, storedHash);
}
