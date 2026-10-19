import 'server-only';
import { kv } from './redis';
const ipOf = (req) => (req.headers.get('x-forwarded-for') || 'local').split(',')[0].trim();
// Em memória (rotas públicas de leitura): melhor esforço em serverless.
const hits = new Map();
export function limited(req, key, max = 30, windowMs = 60000) {
  const k = key + ':' + ipOf(req), now = Date.now();
  const arr = (hits.get(k) || []).filter((t) => now - t < windowMs);
  arr.push(now); hits.set(k, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}
// Em Redis (login, cadastro, pedido, newsletter): vale entre instâncias.
export async function limitedRedis(req, key, max, windowSec) {
  try {
    const k = `blu:rl:${key}:${ipOf(req)}`;
    const n = await kv().incr(k);
    if (n === 1) await kv().expire(k, windowSec);
    return n > max;
  } catch { return false; }
}
