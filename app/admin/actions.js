'use server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { del } from '@vercel/blob';
import { requireAdmin, logAdmin } from '@/lib/auth';
import * as db from '@/lib/db';
import { hashPassword } from '@/lib/password';
import { slugify, norm } from '@/lib/format';

// TODA action começa com requireAdmin(): autorização validada no servidor, não só ocultando menus.
const num = (v) => (v === '' || v == null ? null : Number(v));
const str = (v) => (String(v ?? '').trim() || null);
const bust = () => { ['catalog', 'settings', 'pages', 'orders'].forEach((t) => revalidateTag(t)); revalidatePath('/', 'layout'); };

export async function saveProduct(fd) {
  const { user } = await requireAdmin();
  const id = fd.get('id') || null, back = `/admin/produtos/${id || 'novo'}`;
  let variations = [];
  try { variations = JSON.parse(String(fd.get('variations') || '[]')); if (!Array.isArray(variations)) throw 0; } catch { redirect(`${back}?erro=${encodeURIComponent('Variações precisam ser uma lista JSON válida')}`); }
  const name = String(fd.get('name') || '').trim(), sku = String(fd.get('sku') || '').trim(), slug = slugify(String(fd.get('slug') || name));
  const price = num(fd.get('price')) ?? 0, sale = num(fd.get('sale_price')), cats = await db.allCategories();
  if (!name || !sku || !slug || !cats.some((c) => c.id === fd.get('category_id')) || price < 0 || (sale != null && sale > price)) redirect(`${back}?erro=${encodeURIComponent('Confira nome, SKU, categoria e preços')}`);
  const all = await db.allProducts();
  if (all.some((p) => p.id !== id && (p.sku === sku || p.slug === slug))) redirect(`${back}?erro=${encodeURIComponent('SKU ou slug já existe')}`);
  const cur = id ? await db.getProduct(id) : null;
  const p = {
    ...(cur || { id: crypto.randomUUID(), images: [], created_at: new Date().toISOString(), stock: Math.max(0, parseInt(fd.get('stock')) || 0) }),
    name, sku, slug, category_id: fd.get('category_id'), short_description: str(fd.get('short_description')), description: str(fd.get('description')),
    price, sale_price: sale, material: str(fd.get('material')), color: str(fd.get('color')),
    width_cm: num(fd.get('width_cm')), height_cm: num(fd.get('height_cm')), depth_cm: num(fd.get('depth_cm')), weight_kg: num(fd.get('weight_kg')),
    package_w: num(fd.get('package_w')), package_h: num(fd.get('package_h')), package_d: num(fd.get('package_d')),
    assembly: str(fd.get('assembly')), care: str(fd.get('care')), warranty: str(fd.get('warranty')), variations,
    seo_title: str(fd.get('seo_title')), seo_description: str(fd.get('seo_description')),
    status: fd.get('status') === 'published' ? 'published' : 'draft', featured: fd.get('featured') === 'on', is_demo: fd.get('is_demo') === 'on',
  };
  await db.putProduct(p);
  await logAdmin(user.email, id ? 'update' : 'create', 'product', p.id, { sku });
  bust();
  redirect(`/admin/produtos/${p.id}?ok=1`);
}
export async function togglePublish(fd) {
  const { user } = await requireAdmin();
  const p = await db.getProduct(fd.get('id'));
  if (!p) return;
  p.status = fd.get('to') === 'published' ? 'published' : 'draft';
  await db.putProduct(p);
  await logAdmin(user.email, p.status, 'product', p.id); bust();
}
export async function deleteProduct(fd) {
  const { user } = await requireAdmin();
  const id = fd.get('id'), p = await db.getProduct(id);
  if (p) { try { if (p.images?.length && process.env.BLOB_READ_WRITE_TOKEN) await del(p.images.map((i) => i.url)); } catch {} await db.removeProduct(id); }
  await logAdmin(user.email, 'delete', 'product', id, { sku: p?.sku }); bust();
}
// ---- imagens (arquivos vão para o Vercel Blob; a lista fica no produto) ----
async function withImages(productId, fn) {
  const { user } = await requireAdmin();
  const p = await db.getProduct(productId);
  if (!p) return;
  p.images = fn([...(p.images || [])], p) || p.images;
  await db.putProduct(p); await logAdmin(user.email, 'images', 'product', productId); bust();
}
export async function setPrimaryImage(productId, imageId) { await withImages(productId, (im) => im.map((x) => ({ ...x, is_primary: x.id === imageId }))); }
export async function setImageAlt(productId, imageId, alt) { await withImages(productId, (im) => im.map((x) => (x.id === imageId ? { ...x, alt: String(alt).slice(0, 200) } : x))); }
export async function moveImage(productId, imageId, dir) {
  await withImages(productId, (im) => { const i = im.findIndex((x) => x.id === imageId), j = i + dir; if (i < 0 || j < 0 || j >= im.length) return im; [im[i], im[j]] = [im[j], im[i]]; return im; });
}
export async function deleteImage(productId, imageId) {
  await withImages(productId, (im) => {
    const t = im.find((x) => x.id === imageId);
    if (t) { try { if (process.env.BLOB_READ_WRITE_TOKEN) del(t.url); } catch {} }
    const rest = im.filter((x) => x.id !== imageId);
    if (rest.length && !rest.some((x) => x.is_primary)) rest[0].is_primary = true;
    return rest;
  });
}
// ---- categorias ----
export async function saveCategory(fd) {
  const { user } = await requireAdmin();
  const name = String(fd.get('name') || '').trim(), slug = slugify(String(fd.get('slug') || name));
  if (!name || !slug) return;
  const all = await db.allCategories(), id = fd.get('id') || slug;
  if (!fd.get('id') && all.some((c) => c.id === id || c.slug === slug)) redirect('/admin/categorias?erro=' + encodeURIComponent('Slug já existe'));
  let parent = str(fd.get('parent_id'));
  if (parent === id || !all.some((c) => c.id === parent && !c.parent_id)) parent = null;
  await db.putCategory({ id, slug, name, description: str(fd.get('description')), seo_description: str(fd.get('seo_description')), parent_id: parent, position: Number(fd.get('position')) || 0 });
  await logAdmin(user.email, fd.get('id') ? 'update' : 'create', 'category', id); bust();
}
export async function deleteCategory(fd) {
  const { user } = await requireAdmin();
  const id = fd.get('id');
  const [prods, cats] = await Promise.all([db.allProducts(), db.allCategories()]);
  if (prods.some((p) => p.category_id === id) || cats.some((c) => c.parent_id === id)) redirect('/admin/categorias?erro=' + encodeURIComponent('Categoria possui produtos ou subcategorias'));
  await db.removeCategory(id); await logAdmin(user.email, 'delete', 'category', id); bust();
}
export async function adjustStock(fd) {
  const { user } = await requireAdmin();
  try { await db.adjustStock(fd.get('id'), parseInt(fd.get('delta')), String(fd.get('reason') || 'ajuste manual').slice(0, 200), user.email); }
  catch { redirect('/admin/estoque?erro=' + encodeURIComponent('Ajuste inválido (o estoque não pode ficar negativo)')); }
  bust(); revalidatePath('/admin/estoque');
}
export async function cancelOrder(fd) {
  const { user } = await requireAdmin();
  const o = (await db.allOrders()).find((x) => x.id === fd.get('id'));
  if (!o || !o.is_test) return;
  await db.putOrder({ ...o, status: 'cancelado' });
  await logAdmin(user.email, 'cancel', 'order', o.id); revalidatePath('/admin/pedidos');
}
export async function saveCoupon(fd) {
  const { user } = await requireAdmin();
  const code = String(fd.get('code') || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '').slice(0, 40), type = fd.get('type') === 'fixed' ? 'fixed' : 'percent', value = Number(fd.get('value'));
  if (!code || !(value > 0) || (type === 'percent' && value > 100)) redirect('/admin/cupons?erro=' + encodeURIComponent('Confira código e valor'));
  const cur = await db.getCoupon(code), d = (v) => (v ? new Date(v).toISOString() : null);
  await db.putCoupon({ code, type, value, min_subtotal: Number(fd.get('min_subtotal')) || 0, starts_at: d(fd.get('starts_at')), ends_at: d(fd.get('ends_at')), max_uses: num(fd.get('max_uses')), used_count: cur?.used_count || 0, active: fd.get('active') === 'on' });
  await logAdmin(user.email, 'upsert', 'coupon', code); revalidatePath('/admin/cupons');
}
export async function toggleCoupon(fd) {
  const { user } = await requireAdmin();
  const c = await db.getCoupon(fd.get('code'));
  if (!c) return;
  await db.putCoupon({ ...c, active: fd.get('to') === '1' }); await logAdmin(user.email, 'toggle', 'coupon', c.code); revalidatePath('/admin/cupons');
}
export async function saveSetting(fd) {
  const { user } = await requireAdmin();
  const key = String(fd.get('key'));
  if (!['notice', 'home', 'store', 'shipping'].includes(key)) return;
  let value;
  if (key === 'shipping') {
    try { value = { origin_cep: String(fd.get('origin_cep') || '').replace(/\D/g, ''), test_rules: fd.get('test_rules') === 'on', rules: JSON.parse(String(fd.get('rules') || '[]')) }; if (!Array.isArray(value.rules)) throw 0; }
    catch { redirect('/admin/configuracoes?erro=' + encodeURIComponent('Regras de frete precisam ser uma lista JSON válida')); }
  } else {
    value = {};
    for (const [k, v] of fd.entries()) if (k !== 'key' && !k.startsWith('$')) value[k] = String(v);
    if (key === 'notice') value.active = fd.get('active') === 'on';
  }
  await db.putSetting(key, value);
  await logAdmin(user.email, 'update', 'setting', key); bust();
  redirect('/admin/configuracoes?ok=1');
}
export async function savePage(fd) {
  const { user } = await requireAdmin();
  const slug = slugify(String(fd.get('slug') || ''));
  if (!slug) return;
  await db.putPage({ slug, title: String(fd.get('title') || '').trim() || slug, body: String(fd.get('body') || ''), updated_at: new Date().toISOString() });
  await logAdmin(user.email, 'upsert', 'page', slug); bust(); revalidatePath('/admin/paginas');
}
// Sem provedor de e-mail, o admin define a nova senha do cliente (recuperação assistida).
export async function resetCustomerPassword(fd) {
  const { user } = await requireAdmin();
  const email = String(fd.get('email') || '').toLowerCase(), pw = String(fd.get('password') || '');
  if (pw.length < 8) redirect('/admin/clientes?erro=' + encodeURIComponent('A senha deve ter pelo menos 8 caracteres'));
  const u = await db.getUser(email);
  if (!u) return;
  u.passHash = await hashPassword(pw);
  await db.putUser(u); await logAdmin(user.email, 'reset_password', 'customer', email);
  redirect('/admin/clientes?ok=1');
}
