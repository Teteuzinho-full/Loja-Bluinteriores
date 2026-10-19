import 'server-only';
import { scrypt, randomBytes, timingSafeEqual, createHash } from 'node:crypto';
const sc = (pw, salt) => new Promise((res, rej) => scrypt(pw, salt, 64, (e, k) => (e ? rej(e) : res(k))));
export async function hashPassword(pw) { const salt = randomBytes(16); return `${salt.toString('hex')}:${(await sc(pw, salt)).toString('hex')}`; }
export async function verifyPassword(pw, stored) {
  const [s, h] = String(stored || '').split(':');
  if (!s || !h) return false;
  const k = await sc(pw, Buffer.from(s, 'hex')), b = Buffer.from(h, 'hex');
  return b.length === k.length && timingSafeEqual(k, b);
}
export function safeEqualStr(a, b) {
  const x = createHash('sha256').update(String(a)).digest(), y = createHash('sha256').update(String(b)).digest();
  return timingSafeEqual(x, y);
}
