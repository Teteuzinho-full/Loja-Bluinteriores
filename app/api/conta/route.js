import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { putUser } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
export const dynamic = 'force-dynamic';
const s = (v, n = 120) => String(v || '').trim().slice(0, n);
export async function POST(req) {
  const ses = await getSession();
  if (ses.role !== 'customer') return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
  const b = await req.json().catch(() => ({})), u = ses.record;
  if (b.action === 'profile') {
    if (s(b.name).length < 2) return NextResponse.json({ error: 'Informe o nome.' }, { status: 400 });
    Object.assign(u, { name: s(b.name), phone: s(b.phone, 20), marketing: !!b.marketing });
  } else if (b.action === 'address_add') {
    const a = { id: crypto.randomUUID(), recipient: s(b.recipient), cep: s(b.cep, 9).replace(/\D/g, ''), street: s(b.street), number: s(b.number, 20), complement: s(b.complement, 60), district: s(b.district), city: s(b.city), state: s(b.state, 2).toUpperCase() };
    if (a.cep.length !== 8 || !a.recipient || !a.street || !a.number || !a.district || !a.city || a.state.length !== 2) return NextResponse.json({ error: 'Confira os campos (CEP com 8 dígitos e UF com 2 letras).' }, { status: 400 });
    u.addresses = [...(u.addresses || []), a].slice(0, 10);
  } else if (b.action === 'address_del') {
    u.addresses = (u.addresses || []).filter((x) => x.id !== b.id);
  } else if (b.action === 'password') {
    if (!(await verifyPassword(String(b.current || ''), u.passHash))) return NextResponse.json({ error: 'Senha atual incorreta.' }, { status: 400 });
    if (String(b.next || '').length < 8) return NextResponse.json({ error: 'A nova senha deve ter pelo menos 8 caracteres.' }, { status: 400 });
    u.passHash = await hashPassword(String(b.next));
  } else return NextResponse.json({ error: 'Ação inválida.' }, { status: 400 });
  await putUser(u);
  return NextResponse.json({ ok: true });
}
