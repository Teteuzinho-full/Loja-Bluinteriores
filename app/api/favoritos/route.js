import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { putUser } from '@/lib/db';
export const dynamic = 'force-dynamic';
export async function POST(req) {
  const s = await getSession();
  if (s.role !== 'customer') return NextResponse.json({ error: 'Faça login para favoritar.' }, { status: 401 });
  const { id } = await req.json().catch(() => ({}));
  if (!/^[\w-]{1,64}$/.test(String(id))) return NextResponse.json({ error: 'Inválido.' }, { status: 400 });
  const u = s.record, favs = new Set(u.favs || []);
  favs.has(id) ? favs.delete(id) : favs.add(id);
  u.favs = [...favs].slice(0, 200);
  await putUser(u);
  return NextResponse.json({ favs: u.favs });
}
