import { cache } from 'react';
import { getSettingsRaw } from './db';
export const DEFAULTS = {
  notice: { active: true, text: 'Loja em modo de demonstração. Nenhuma cobrança será realizada.', href: '' },
  home: { title: 'Sua casa, com mais personalidade.', subtitle: 'Peças que transformam ambientes e tornam cada detalhe especial.', cta_label: 'Descobrir a coleção', cta_href: '/loja', image_url: '' },
  store: { name: 'Blu Interiores', email: '', cnpj: '[CNPJ a preencher]', address: '[Endereço empresarial a preencher]', phone: '', instagram: '', facebook: '', default_theme: 'system' },
  shipping: { origin_cep: '', test_rules: true, rules: [] },
};
export const getSettings = cache(async () => {
  const out = JSON.parse(JSON.stringify(DEFAULTS));
  try { const raw = await getSettingsRaw(); Object.entries(raw).forEach(([k, v]) => { out[k] = { ...(out[k] || {}), ...v }; }); } catch (e) { console.error(e); }
  return out;
});
