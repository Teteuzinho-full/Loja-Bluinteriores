import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { safeEqualStr } from '@/lib/password';
import { signSession, COOKIE, cookieOpts } from '@/lib/session';
import { limitedRedis } from '@/lib/ratelimit';
export const dynamic = 'force-dynamic';
// Acesso do administrador: credenciais ficam SOMENTE nas variáveis de ambiente do servidor.
export async function POST(req) {
  if (await limitedRedis(req, 'adminlogin', 5, 900)) return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 });
  const E = process.env.ADMIN_EMAIL, P = process.env.ADMIN_PASSWORD;
  if (!E || !P) return NextResponse.json({ error: 'Admin não configurado. Defina ADMIN_EMAIL, ADMIN_PASSWORD e SESSION_SECRET.' }, { status: 503 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const okE = safeEqualStr(String(b.email || '').trim().toLowerCase(), E.toLowerCase()), okP = safeEqualStr(String(b.password || ''), P);
  if (!(okE && okP)) return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  cookies().set(COOKIE, await signSession({ sub: E, role: 'admin' }, 1), cookieOpts(1));
  return NextResponse.json({ ok: true });
}
