import 'server-only';
import { Redis } from '@upstash/redis';

const url = () => process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = () => process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
export const redisConfigured = () => !!(url() && token());

// Sem Redis configurado (ex.: npm run dev sem .env), usa memória local: tudo funciona, mas some ao reiniciar.
const mem = (globalThis.__blu_mem ||= new Map());
const cl = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
const memory = {
  async hgetall(k) { const h = mem.get(k); return h && Object.keys(h).length ? cl(h) : null; },
  async hget(k, f) { const h = mem.get(k); return h && f in h ? cl(h[f]) : null; },
  async hmget(k, ...fs) { const h = mem.get(k) || {}, o = {}; let any = false; fs.forEach((f) => { if (f in h) { o[f] = cl(h[f]); any = true; } }); return any ? o : null; },
  async hset(k, o) { const h = mem.get(k) || {}; Object.entries(o).forEach(([f, v]) => { h[f] = cl(v); }); mem.set(k, h); return 1; },
  async hdel(k, ...fs) { const h = mem.get(k) || {}; fs.forEach((f) => delete h[f]); return 1; },
  async hlen(k) { return Object.keys(mem.get(k) || {}).length; },
  async incr(k) { const n = (mem.get(k) || 0) + 1; mem.set(k, n); return n; },
  async expire() { return 1; },
  async lpush(k, v) { const l = mem.get(k) || []; l.unshift(cl(v)); mem.set(k, l); return l.length; },
  async ltrim(k, a, b) { mem.set(k, (mem.get(k) || []).slice(a, b + 1)); return 'OK'; },
  async lrange(k, a, b) { return cl((mem.get(k) || []).slice(a, b === -1 ? undefined : b + 1)); },
};
let real;
export function kv() {
  if (!redisConfigured()) return memory;
  return (real ||= new Redis({ url: url(), token: token() }));
}
