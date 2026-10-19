// Sessão assinada (HMAC-SHA256) via Web Crypto: funciona no middleware (edge) e no Node.
const enc = new TextEncoder();
const b64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));
function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === 'production') throw new Error('SESSION_SECRET não configurado');
  return s || 'dev-only-insecure-secret';
}
const key = () => crypto.subtle.importKey('raw', enc.encode(secret()), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
const sign = async (body) => b64(await crypto.subtle.sign('HMAC', await key(), enc.encode(body)));
const eq = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

export const COOKIE = 'blu_session';
export async function signSession(payload, days = 7) {
  const body = b64(enc.encode(JSON.stringify({ ...payload, exp: Date.now() + days * 864e5 })));
  return `${body}.${await sign(body)}`;
}
export async function verifySession(tok) {
  try {
    if (!tok || !tok.includes('.')) return null;
    const [body, sig] = tok.split('.');
    if (!eq(sig, await sign(body))) return null;
    const p = JSON.parse(unb64(body));
    return p.exp > Date.now() ? p : null;
  } catch { return null; }
}
export const cookieOpts = (days = 7) => ({ httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: days * 86400 });
