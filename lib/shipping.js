// Módulo de frete por regras configuráveis (settings.shipping.rules).
// O resultado é sempre ESTIMATIVA INTERNA, nunca cotação de transportadora.
// Para integrar uma transportadora real, substitua shippingQuote por chamada à API contratada (credenciais só no servidor).
const r2 = (n) => Math.round(n * 100) / 100;
export function shippingQuote(cfg, cep, lines) {
  const d = String(cep || '').replace(/\D/g, '');
  if (d.length !== 8 || !cfg || !Array.isArray(cfg.rules) || !cfg.rules.length) return null;
  const n = Number(d);
  const rule = cfg.rules.find((r) => n >= Number(r.cep_from) && n <= Number(r.cep_to));
  if (!rule) return null;
  let kg = 0;
  for (const l of lines) {
    const cubic = ((l.pack?.w || 0) * (l.pack?.h || 0) * (l.pack?.d || 0)) / 6000; // peso cubado
    kg += Math.max(l.weight || 0, cubic) * l.qty;
  }
  return {
    price: r2(Number(rule.base) + Number(rule.per_kg) * kg),
    days_min: rule.days_min, days_max: rule.days_max,
    label: rule.label || 'Estimativa interna', estimate: true, billed_kg: r2(kg),
    notice: 'Estimativa interna, não é cotação de transportadora.',
  };
}
