import 'server-only';
import { unstable_cache } from 'next/cache';
import { kv } from './redis';
import { seedAll } from './seed';
import { norm } from './format';

// ÚNICO ponto de acesso a dados. Para trocar o armazenamento (ex.: Postgres), reescreva só este arquivo.
export const K = {
  products: 'blu:products', cats: 'blu:categories', coupons: 'blu:coupons', orders: 'blu:orders', users: 'blu:users',
  news: 'blu:newsletter', pages: 'blu:pages', settings: 'blu:settings', orderSeq: 'blu:orderseq', stocklog: 'blu:stocklog', adminlog: 'blu:adminlog',
};
const vals = (o) => Object.values(o || {}).filter(Boolean);
let seeding;
export function ensureSeed() {
  seeding ||= (async () => { try { if (!(await kv().hlen(K.products))) await seedAll(kv(), K); } catch (e) { console.error('[seed]', e); seeding = null; } })();
  return seeding;
}

// ---- Leituras públicas em cache (poupam comandos do Redis; invalidadas pelo admin) ----
export const getCatalog = unstable_cache(async () => {
  await ensureSeed();
  const [p, c] = await Promise.all([kv().hgetall(K.products), kv().hgetall(K.cats)]);
  return { products: vals(p).sort((a, b) => b.created_at.localeCompare(a.created_at)), cats: vals(c).sort((a, b) => (a.position || 0) - (b.position || 0)) };
}, ['blu-catalog'], { tags: ['catalog'], revalidate: 300 });
export const getSettingsRaw = unstable_cache(async () => { await ensureSeed(); return (await kv().hgetall(K.settings)) || {}; }, ['blu-settings'], { tags: ['settings'], revalidate: 300 });
export const getPages = unstable_cache(async () => { await ensureSeed(); return vals(await kv().hgetall(K.pages)); }, ['blu-pages'], { tags: ['pages'], revalidate: 300 });
export const getBestSellers = unstable_cache(async () => {
  // Somente vendas reais e pagas. Pagamentos estão desativados, então hoje retorna vazio.
  const m = {};
  vals(await kv().hgetall(K.orders)).filter((o) => o.payment_status === 'pago' && !o.is_test).forEach((o) => o.items.forEach((i) => { m[i.product_id] = (m[i.product_id] || 0) + i.qty; }));
  return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([id]) => id);
}, ['blu-best'], { tags: ['orders'], revalidate: 600 });

// ---- Leituras frescas (carrinho/admin) ----
export const settingsFresh = async () => { await ensureSeed(); return (await kv().hgetall(K.settings)) || {}; };
export const productsByIds = async (ids) => (ids.length ? vals(await kv().hmget(K.products, ...ids)) : []);
export const allProducts = async () => { await ensureSeed(); return vals(await kv().hgetall(K.products)); };
export const getProduct = (id) => kv().hget(K.products, id);
export const putProduct = (p) => kv().hset(K.products, { [p.id]: { ...p, search_text: norm(`${p.name} ${p.sku} ${p.material || ''} ${p.color || ''}`), updated_at: new Date().toISOString() } });
export const removeProduct = (id) => kv().hdel(K.products, id);
export const allCategories = async () => { await ensureSeed(); return vals(await kv().hgetall(K.cats)).sort((a, b) => (a.position || 0) - (b.position || 0)); };
export const putCategory = (c) => kv().hset(K.cats, { [c.id]: c });
export const removeCategory = (id) => kv().hdel(K.cats, id);
export const getCoupon = (code) => kv().hget(K.coupons, code);
export const allCoupons = async () => vals(await kv().hgetall(K.coupons)).sort((a, b) => a.code.localeCompare(b.code));
export const putCoupon = (c) => kv().hset(K.coupons, { [c.code]: c });
export const allOrders = async () => vals(await kv().hgetall(K.orders)).sort((a, b) => b.number - a.number);
export const putOrder = (o) => kv().hset(K.orders, { [o.id]: o });
export const nextOrderNumber = () => kv().incr(K.orderSeq);
export const getUser = (email) => kv().hget(K.users, String(email).toLowerCase());
export const putUser = (u) => kv().hset(K.users, { [u.email]: u });
export const allUsers = async () => vals(await kv().hgetall(K.users)).sort((a, b) => b.created_at.localeCompare(a.created_at));
export const getNews = (email) => kv().hget(K.news, String(email).toLowerCase());
export const putNews = (n) => kv().hset(K.news, { [n.email]: n });
export const allNews = async () => vals(await kv().hgetall(K.news)).sort((a, b) => b.consent_at.localeCompare(a.consent_at));
export const allPages = async () => { await ensureSeed(); return vals(await kv().hgetall(K.pages)).sort((a, b) => a.slug.localeCompare(b.slug)); };
export const putPage = (p) => kv().hset(K.pages, { [p.slug]: p });
export const putSetting = (key, value) => kv().hset(K.settings, { [key]: value });
export const stockLog = () => kv().lrange(K.stocklog, 0, 14);
export const pushAdminLog = (e) => kv().lpush(K.adminlog, e).then(() => kv().ltrim(K.adminlog, 0, 499));

// Ajuste de estoque: bloqueia saldo negativo e registra data e responsável.
// (Leitura+escrita simples; adequado para um único operador. Para concorrência alta, use script Lua/transação.)
export async function adjustStock(id, delta, reason, by) {
  const p = await getProduct(id);
  if (!p || !Number.isInteger(delta) || p.stock + delta < 0) throw new Error('estoque_invalido');
  p.stock += delta;
  await putProduct(p);
  await kv().lpush(K.stocklog, { sku: p.sku, delta, reason, by, at: new Date().toISOString() });
  await kv().ltrim(K.stocklog, 0, 199);
  return p.stock;
}
