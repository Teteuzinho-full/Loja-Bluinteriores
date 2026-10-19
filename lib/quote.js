import { productsByIds, getCoupon } from './db';
import { shippingQuote } from './shipping';
import { getSettings } from './settings';
import { unitPrice } from './format';

const ID = /^[\w-]{1,64}$/;
const r2 = (n) => Math.round(n * 100) / 100;

// Fonte única da verdade para preços, estoque, cupom e frete. Nunca confia no navegador.
export async function buildQuote({ items, coupon, cep }) {
  const agg = new Map();
  (Array.isArray(items) ? items : []).slice(0, 50).forEach((i) => {
    if (ID.test(i?.id) && Number.isInteger(i?.qty) && i.qty > 0 && i.qty <= 99) agg.set(i.id, (agg.get(i.id) || 0) + i.qty);
  });
  const ids = [...agg.keys()];
  const prods = await productsByIds(ids);
  const map = new Map(prods.map((p) => [p.id, p]));
  const lines = [], issues = [];
  for (const [id, want] of agg) {
    const p = map.get(id);
    if (!p || p.status !== 'published') { issues.push('Um item não está mais disponível e foi removido.'); continue; }
    if (p.stock <= 0) { issues.push(`${p.name} está indisponível.`); continue; }
    let qty = want;
    if (qty > p.stock) { qty = p.stock; issues.push(`Quantidade de ${p.name} ajustada ao estoque (${p.stock}).`); }
    const unit = unitPrice(p);
    lines.push({
      id, slug: p.slug, name: p.name, sku: p.sku, qty, stock: p.stock, unit, total: r2(unit * qty), demo: p.is_demo,
      weight: Number(p.weight_kg || 0),
      pack: { w: Number(p.package_w || p.width_cm || 0), h: Number(p.package_h || p.height_cm || 0), d: Number(p.package_d || p.depth_cm || 0) },
    });
  }
  const subtotal = r2(lines.reduce((a, l) => a + l.total, 0));
  let discount = 0, couponInfo = null;
  const code = String(coupon || '').trim().toUpperCase().slice(0, 40);
  if (code) {
    const c = await getCoupon(code);
    const now = new Date();
    let msg = '';
    if (!c || !c.active) msg = 'Cupom inválido.';
    else if (c.starts_at && new Date(c.starts_at) > now) msg = 'Cupom ainda não está válido.';
    else if (c.ends_at && new Date(c.ends_at) < now) msg = 'Cupom expirado.';
    else if (c.max_uses != null && c.used_count >= c.max_uses) msg = 'Cupom esgotado.';
    else if (Number(c.min_subtotal) > subtotal) msg = `Pedido mínimo para este cupom: R$ ${Number(c.min_subtotal).toFixed(2).replace('.', ',')}.`;
    if (msg) couponInfo = { code, ok: false, message: msg };
    else {
      discount = c.type === 'percent' ? r2(subtotal * Number(c.value) / 100) : Math.min(Number(c.value), subtotal);
      couponInfo = { code, ok: true, message: 'Cupom aplicado (apenas no resumo de teste).' };
    }
  }
  const settings = await getSettings();
  const shipping = cep ? shippingQuote(settings.shipping, cep, lines) : null;
  const total = r2(subtotal - discount + (shipping?.price || 0));
  return { lines, subtotal, discount, shipping, shippingRequested: !!cep, total, coupon: couponInfo, issues, demo: lines.some((l) => l.demo) };
}
