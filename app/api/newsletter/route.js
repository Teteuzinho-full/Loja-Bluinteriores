import { NextResponse } from 'next/server';
import { getNews, putNews } from '@/lib/db';
import { limitedRedis } from '@/lib/ratelimit';
export const dynamic = 'force-dynamic';
const TEXT = 'Concordo em receber comunicações da Blu Interiores por e-mail e aceito a Política de Privacidade. Posso cancelar a qualquer momento.';
export async function POST(req) {
  if (await limitedRedis(req, 'news', 5, 600)) return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em instantes.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const email = String(b.email || '').trim().toLowerCase().slice(0, 160);
  if (!/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe um e-mail válido.' }, { status: 400 });
  if (b.consent !== true) return NextResponse.json({ error: 'É necessário aceitar o consentimento para se inscrever.' }, { status: 400 });
  const cur = await getNews(email);
  if (cur && !cur.unsubscribed_at) return NextResponse.json({ ok: true, message: 'Este e-mail já está inscrito.' });
  await putNews({ email, consent_text: TEXT, consent_at: new Date().toISOString(), source: 'site', unsubscribe_token: cur?.unsubscribe_token || crypto.randomUUID(), unsubscribed_at: null });
  // Nenhum e-mail é enviado automaticamente: configure um provedor de e-mail para isso.
  return NextResponse.json({ ok: true, message: 'Inscrição registrada. Obrigado!' });
}
