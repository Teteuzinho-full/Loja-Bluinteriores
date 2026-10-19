export const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const norm = (s = '') => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
export const slugify = (s = '') => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const digits = (s = '') => String(s).replace(/\D/g, '');
export const maskCep = (s) => { const d = digits(s).slice(0, 8); return d.length > 5 ? d.slice(0, 5) + '-' + d.slice(5) : d; };
export const unitPrice = (p) => (p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price) ? Number(p.sale_price) : Number(p.price));
export const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
