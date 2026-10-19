import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getUser, putUser } from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { signSession, COOKIE, cookieOpts } from '@/lib/session';
import { limitedRedis } from '@/lib/ratelimit';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  if (await limitedRedis(req, 'signup', 10, 3600)) return NextResponse.json({ error: 'Muitas tentativas. Tente mais tarde.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const name = String(b.name || '').trim().slice(0, 120), email = String(b.email || '').trim().toLowerCase().slice(0, 160), pw = String(b.password || '');
  if (name.length < 2 || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe nome e e-mail válidos.' }, { status: 400 });
  if (pw.length < 8 || pw.length > 128) return NextResponse.json({ error: 'A senha deve ter de 8 a 128 caracteres.' }, { status: 400 });
  if (b.terms !== true) return NextResponse.json({ error: 'É necessário aceitar os termos e a política de privacidade.' }, { status: 400 });
  if (email === String(process.env.ADMIN_EMAIL || '').toLowerCase() || (await getUser(email))) return NextResponse.json({ error: 'Este e-mail já está cadastrado.' }, { status: 409 });
  await putUser({ id: crypto.randomUUID(), email, name, phone: '', passHash: await hashPassword(pw), marketing: false, terms_at: new Date().toISOString(), addresses: [], favs: [], created_at: new Date().toISOString() });
  cookies().set(COOKIE, await signSession({ sub: email, role: 'customer' }), cookieOpts());
  return NextResponse.json({ ok: true });
}
