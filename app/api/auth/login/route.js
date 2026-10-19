import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser } from '@/lib/db';
import { verifyPassword } from '@/lib/password';
import { signSession, COOKIE, cookieOpts } from '@/lib/session';
import { limitedRedis } from '@/lib/ratelimit';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  if (await limitedRedis(req, 'login', 10, 900)) return NextResponse.json({ error: 'Muitas tentativas. Aguarde 15 minutos.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const email = String(b.email || '').trim().toLowerCase(), u = await getUser(email);
  const ok = u && (await verifyPassword(String(b.password || ''), u.passHash));
  if (!ok) return NextResponse.json({ error: 'E-mail ou senha incorretos.' }, { status: 401 });
  cookies().set(COOKIE, await signSession({ sub: email, role: 'customer' }), cookieOpts());
  return NextResponse.json({ ok: true });
}
