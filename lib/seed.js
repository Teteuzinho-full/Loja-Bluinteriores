// Dados iniciais (catálogo DEMONSTRATIVO). Executa sozinho na primeira requisição, se o Redis estiver vazio.
import { norm, slugify } from './format';

const CATS = [
  ['mesas-de-centro', 'Mesas de centro', 'Mesas de centro para compor a sala com proporção e materiais naturais.', 'Mesas de centro modernas para sala.'],
  ['espelhos-decorativos', 'Espelhos decorativos', 'Espelhos para ampliar a luz e dar presença a halls e salas.', 'Espelhos decorativos para hall e sala.'],
  ['aparadores', 'Aparadores', 'Aparadores para halls, salas e áreas de jantar.', 'Aparadores modernos para sala.'],
  ['mesas-laterais', 'Mesas laterais', 'Mesas laterais para apoio ao lado de sofás e poltronas.', 'Mesas laterais contemporâneas.'],
  ['objetos-de-decoracao', 'Objetos de decoração', 'Objetos menores que completam a composição do ambiente.', 'Objetos de decoração contemporânea.'],
];
const SP = {
  'mesas-de-centro': { k: 'Mesa de centro', n: 25, b: [90, 38, 60], p: 1100, w: 18, a: 'MC', pk: [100, 45, 70] },
  'espelhos-decorativos': { k: 'Espelho', n: 20, b: [60, 120, 3], p: 600, w: 8, a: 'ES', pk: [70, 130, 10] },
  'aparadores': { k: 'Aparador', n: 20, b: [140, 80, 38], p: 2200, w: 35, a: 'AP', pk: [150, 90, 45] },
  'mesas-laterais': { k: 'Mesa lateral', n: 15, b: [40, 50, 40], p: 500, w: 9, a: 'ML', pk: [50, 60, 50] },
  'objetos-de-decoracao': { k: 'Objeto', n: 20, b: [14, 24, 14], p: 150, w: 2, a: 'OB', pk: [20, 30, 20] },
};
const MT = {
  'mesas-de-centro': ['Madeira', 'Pedra', 'Vidro', 'Metal', 'Linho'], 'espelhos-decorativos': ['Vidro', 'Metal', 'Madeira', 'Pedra', 'Linho'],
  'aparadores': ['Madeira', 'Pedra', 'Metal', 'Vidro', 'Linho'], 'mesas-laterais': ['Madeira', 'Pedra', 'Metal', 'Vidro', 'Linho'],
  'objetos-de-decoracao': ['Cerâmica', 'Vidro', 'Madeira', 'Metal', 'Pedra'],
};
const FM = ['Aura', 'Linea', 'Orbe', 'Duna', 'Arco'], CL = ['Natural', 'Grafite', 'Marfim', 'Areia', 'Azul profundo'];
const PAGES = [
  ['sobre', 'Sobre a Blu Interiores', 'A Blu Interiores reúne mesas de centro, espelhos, aparadores, mesas laterais e objetos de decoração contemporânea.\n\n[Texto institucional a preencher]'],
  ['contato', 'Contato', 'E-mail de atendimento: [a preencher]\nTelefone: [a preencher]\nHorário: [a preencher]'],
  ['politica-de-privacidade', 'Política de privacidade', '[Política de privacidade a preencher, conforme a LGPD. Revise com assessoria jurídica.]'],
  ['termos-de-uso', 'Termos de uso', '[Termos de uso a preencher. Revise com assessoria jurídica.]'],
  ['politica-de-entrega', 'Política de entrega', '[Prazos, regiões atendidas e transportadoras a preencher.]'],
  ['trocas-e-devolucoes', 'Trocas e devoluções', '[Política de trocas, devoluções e reembolso a preencher, conforme o Código de Defesa do Consumidor.]'],
  ['informacoes-sobre-pedidos', 'Informações sobre pedidos', '[Como acompanhar pedidos, a preencher.]'],
  ['ajuda', 'Ajuda', '[Perguntas frequentes e canais de atendimento a preencher.]'],
];
export const DEFAULT_RULES = [
  { label: 'Sudeste (teste)', cep_from: 1000000, cep_to: 39999999, base: 39, per_kg: 3, days_min: 3, days_max: 7 },
  { label: 'Sul (teste)', cep_from: 80000000, cep_to: 99999999, base: 59, per_kg: 4, days_min: 5, days_max: 9 },
  { label: 'Centro-Oeste e Nordeste (teste)', cep_from: 40000000, cep_to: 79999999, base: 79, per_kg: 5, days_min: 7, days_max: 14 },
];

export async function seedAll(kv, K) {
  const now = Date.now();
  const cats = {}, prods = {}, pages = {};
  CATS.forEach(([id, name, description, seo_description], i) => { cats[id] = { id, slug: id, name, description, seo_description, parent_id: null, position: i + 1 }; });
  let t = 0;
  for (const [cid] of CATS) {
    const d = SP[cid];
    for (let i = 0; i < d.n; i++) {
      const m = MT[cid][i % 5], name = `${d.k} ${FM[Math.floor(i / 5)]} ${m}`, col = CL[(i + Math.floor(i / 5)) % 5], sku = `DEMO-${d.a}-${String(i + 1).padStart(2, '0')}`;
      const id = 'p_' + sku.toLowerCase(), at = new Date(now - (t++) * 60000).toISOString();
      prods[id] = {
        id, slug: slugify(name), sku, name, category_id: cid,
        short_description: `${name} em tom ${col.toLowerCase()}. Item de demonstração.`,
        description: `${name} em ${m.toLowerCase()}, cor ${col.toLowerCase()}. Texto de demonstração, a ser substituído pela descrição oficial do produto.`,
        price: Math.round(d.p * (1 + (i % 7) * 0.12) / 10) * 10, sale_price: null, material: m, color: col,
        width_cm: d.b[0] + (i % 5) * 4, height_cm: d.b[1] + Math.floor(i / 5) * 3, depth_cm: d.b[2] + (i % 3) * 2, weight_kg: d.w + (i % 4),
        package_w: d.pk[0], package_h: d.pk[1], package_d: d.pk[2], stock: (i * 5 + 3) % 9,
        status: 'published', is_demo: true, featured: i < 2,
        assembly: 'Informação de montagem a preencher.', care: 'Limpar com pano macio e levemente úmido.', warranty: '[Garantia a preencher]', variations: [],
        seo_title: `${name} | Blu Interiores`, seo_description: `${name}. Peça de decoração contemporânea (item de demonstração).`,
        images: [], search_text: norm(`${name} ${sku} ${m} ${col}`), created_at: at, updated_at: at,
      };
    }
  }
  PAGES.forEach(([slug, title, body]) => { pages[slug] = { slug, title, body, updated_at: new Date().toISOString() }; });
  await kv.hset(K.cats, cats);
  await kv.hset(K.products, prods);
  await kv.hset(K.pages, pages);
  await kv.hset(K.settings, {
    shipping: { origin_cep: '', test_rules: true, rules: DEFAULT_RULES },
    notice: { active: true, text: 'Loja em modo de demonstração. Nenhuma cobrança será realizada.', href: '' },
    home: { title: 'Sua casa, com mais personalidade.', subtitle: 'Peças que transformam ambientes e tornam cada detalhe especial.', cta_label: 'Descobrir a coleção', cta_href: '/loja', image_url: '' },
    store: { name: 'Blu Interiores', email: '', cnpj: '[CNPJ a preencher]', address: '[Endereço empresarial a preencher]', phone: '', instagram: '', facebook: '', default_theme: 'system' },
  });
}
