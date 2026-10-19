import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { revalidatePath, revalidateTag } from 'next/cache';
import { getSession } from '@/lib/auth';
import { getProduct, putProduct } from '@/lib/db';
export const dynamic = 'force-dynamic';
const EXT = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
const MAX = 4 * 1024 * 1024; // limite de corpo das funções da Vercel é ~4,5 MB
export async function POST(req) {
  const s = await getSession();
  if (s.role !== 'admin') return NextResponse.json({ error: 'Não autorizado.' }, { status: 403 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: 'Vercel Blob não configurado (BLOB_READ_WRITE_TOKEN).' }, { status: 503 });
  const fd = await req.formData(), id = String(fd.get('productId') || ''), f = fd.get('file');
  const p = await getProduct(id);
  if (!p || !f || typeof f === 'string') return NextResponse.json({ error: 'Requisição inválida.' }, { status: 400 });
  if (!EXT[f.type]) return NextResponse.json({ error: 'Use apenas JPG, PNG ou WebP.' }, { status: 400 });
  if (f.size > MAX) return NextResponse.json({ error: 'Cada imagem deve ter até 4 MB.' }, { status: 400 });
  const blob = await put(`products/${id}/${crypto.randomUUID()}.${EXT[f.type]}`, f, { access: 'public', contentType: f.type });
  p.images = [...(p.images || []), { id: crypto.randomUUID(), url: blob.url, alt: '', is_primary: !(p.images || []).length }];
  await putProduct(p);
  revalidateTag('catalog');
  revalidatePath('/', 'layout');
  return NextResponse.json({ ok: true });
}
