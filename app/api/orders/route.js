import { NextResponse } from 'next/server';
import { buildQuote } from '@/lib/quote';
import { getSession } from '@/lib/auth';
import { putOrder, nextOrderNumber } from '@/lib/db';
import { limitedRedis } from '@/lib/ratelimit';
export const dynamic = 'force-dynamic';

// Cria PEDIDO DE DEMONSTRAÇÃO. Não existe cobrança: payment_status = 'desativado' e is_test = true.
export async function POST(req) {
  if (await limitedRedis(req, 'orders', 10, 600)) return NextResponse.json({ error: 'Muitas requisições. Aguarde um instante.' }, { status: 429 });
  let b; try { b = await req.json(); } catch { return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 }); }
  const a = b.address || {}, s = (v, n = 120) => String(v || '').trim().slice(0, n);
  const addr = { cep: s(a.cep, 9).replace(/\D/g, ''), street: s(a.street), number: s(a.number, 20), complement: s(a.complement, 60), district: s(a.district), city: s(a.city), state: s(a.state, 2).toUpperCase() };
  const name = s(b.name), email = s(b.email, 160).toLowerCase();
  if (name.length < 3 || !/^\S+@\S+\.\S+$/.test(email)) return NextResponse.json({ error: 'Informe nome e e-mail válidos.' }, { status: 400 });
  if (addr.cep.length !== 8 || !addr.street || !addr.number || !addr.district || !addr.city || addr.state.length !== 2) return NextResponse.json({ error: 'Preencha o endereço completo.' }, { status: 400 });
  const q = await buildQuote({ items: b.items, coupon: b.coupon, cep: addr.cep });
  if (!q.lines.length) return NextResponse.json({ error: 'Carrinho vazio ou itens indisponíveis.' }, { status: 400 });
  if (!q.shipping) return NextResponse.json({ error: 'Frete indisponível para consulta no momento.' }, { status: 400 });
  const { user, role } = await getSession();
  const number = await nextOrderNumber();
  await putOrder({
    id: crypto.randomUUID(), number, user_email: role === 'customer' ? user.email : null, email, customer_name: name,
    status: 'demo', payment_status: 'desativado', is_test: true, address: addr,
    subtotal: q.subtotal, discount: q.discount, shipping_cost: q.shipping.price, shipping_label: q.shipping.label + ' (estimativa interna)', total: q.total,
    coupon_code: q.coupon?.ok ? q.coupon.code : null,
    items: q.lines.map((l) => ({ product_id: l.id, name: l.name, sku: l.sku, unit_price: l.unit, qty: l.qty })),
    created_at: new Date().toISOString(),
  });
  return NextResponse.json({ number, total: q.total });
}
