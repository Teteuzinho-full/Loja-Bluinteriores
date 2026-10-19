import { NextResponse } from 'next/server';
import { buildQuote } from '@/lib/quote';
import { limited } from '@/lib/ratelimit';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  if (limited(req, 'quote', 60)) return NextResponse.json({ error: 'Muitas requisições. Aguarde um instante.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const q = await buildQuote({ items: b.items, coupon: b.coupon, cep: String(b.cep || '').replace(/\D/g, '') });
  return NextResponse.json(q);
}
