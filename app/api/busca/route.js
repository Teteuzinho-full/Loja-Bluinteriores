import { NextResponse } from 'next/server';
import { getCatalog } from '@/lib/db';
import { norm } from '@/lib/format';
export const dynamic = 'force-dynamic';
export async function GET(req) {
  const q = norm(new URL(req.url).searchParams.get('q') || '').slice(0, 60);
  if (q.length < 2) return NextResponse.json([]);
  const { products } = await getCatalog();
  return NextResponse.json(products.filter((p) => p.status === 'published' && p.search_text.includes(q)).slice(0, 6).map(({ slug, name, sku }) => ({ slug, name, sku })));
}
