import Link from 'next/link';
import { getCatalog } from '@/lib/db';
import { norm } from '@/lib/format';
import ProductCard from './ProductCard';

const PS = 12;
export const hasParams = (sp) => Object.keys(sp || {}).some((k) => sp[k] && k !== 'pagina') || Number(sp?.pagina) > 1;
const onSale = (p) => p.sale_price && Number(p.sale_price) > 0 && Number(p.sale_price) < Number(p.price);

// Filtros, busca, ordenação e paginação sobre os dados reais do catálogo (em cache).
export default async function Catalog({ cat, cats = [], sp, base }) {
  const { products } = await getCatalog();
  const ids = cat ? [cat.id, ...cats.filter((c) => c.parent_id === cat.id).map((c) => c.id)] : null;
  const scope = products.filter((p) => p.status === 'published' && (!ids || ids.includes(p.category_id)));
  const mats = [...new Set(scope.map((x) => x.material).filter(Boolean))].sort();
  const cors = [...new Set(scope.map((x) => x.color).filter(Boolean))].sort();
  const q = norm(sp.q || '').slice(0, 60), min = Number(sp.min) || 0, max = Number(sp.max) || 0;
  let list = scope.filter((p) => (!q || (p.search_text || norm(`${p.name} ${p.sku} ${p.material} ${p.color}`)).includes(q)) && (!sp.material || p.material === sp.material) && (!sp.cor || p.color === sp.cor)
    && (sp.disp !== '1' || p.stock > 0) && (sp.oferta !== '1' || onSale(p)) && (!min || Number(p.price) >= min) && (!max || Number(p.price) <= max));
  const by = { menor: (a, b) => a.price - b.price, maior: (a, b) => b.price - a.price, novidades: (a, b) => b.created_at.localeCompare(a.created_at), nome: (a, b) => a.name.localeCompare(b.name) }[sp.ord];
  if (by) list = [...list].sort(by); else list = [...list].sort((a, b) => Number(b.featured) - Number(a.featured));
  const total = list.length, pages = Math.max(1, Math.ceil(total / PS)), page = Math.min(pages, Math.max(1, parseInt(sp.pagina) || 1));
  const shown = list.slice((page - 1) * PS, page * PS);
  const catOf = new Map(cats.map((c) => [c.id, c.slug]));
  const href = (n) => { const u = new URLSearchParams(); Object.entries(sp).forEach(([k, v]) => v && k !== 'pagina' && u.set(k, v)); if (n > 1) u.set('pagina', n); const s = u.toString(); return s ? `${base}?${s}` : base; };
  return (
    <div className="lay">
      <form className="filters" action={base} method="get" aria-label="Filtros">
        <label>Buscar<input name="q" defaultValue={sp.q || ''} placeholder="Nome, SKU, material" /></label>
        <label>Material<select name="material" defaultValue={sp.material || ''}><option value="">Todos</option>{mats.map((m) => <option key={m}>{m}</option>)}</select></label>
        <label>Cor<select name="cor" defaultValue={sp.cor || ''}><option value="">Todas</option>{cors.map((m) => <option key={m}>{m}</option>)}</select></label>
        <div className="two"><label>Preço mín.<input name="min" type="number" min="0" defaultValue={sp.min || ''} /></label><label>Preço máx.<input name="max" type="number" min="0" defaultValue={sp.max || ''} /></label></div>
        <label>Ordenar<select name="ord" defaultValue={sp.ord || ''}><option value="">Relevância</option><option value="menor">Menor preço</option><option value="maior">Maior preço</option><option value="novidades">Novidades</option><option value="nome">Nome</option></select></label>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}><input style={{ width: 20, minHeight: 20 }} type="checkbox" name="disp" value="1" defaultChecked={sp.disp === '1'} />Somente disponíveis</label>
        {sp.oferta === '1' && <input type="hidden" name="oferta" value="1" />}
        <button className="btn">Aplicar filtros</button>
        <Link className="btn o" href={base}>Limpar filtros</Link>
      </form>
      <div>
        <p className="mute" aria-live="polite">{total} {total === 1 ? 'peça' : 'peças'}</p>
        {shown.length ? <div className="grid">{shown.map((p) => <ProductCard key={p.id} p={p} catSlug={catOf.get(p.category_id)} />)}</div> : (
          <div style={{ padding: '40px 0' }}><p>Nenhuma peça encontrada com esses filtros.</p><p className="mute">Tente remover filtros, buscar por outro material ou ver todas as categorias.</p><Link className="btn" href="/loja">Ver todas as peças</Link></div>
        )}
        {pages > 1 && <nav className="pg" aria-label="Paginação">{Array.from({ length: pages }, (_, i) => <Link key={i} href={href(i + 1)} aria-current={i + 1 === page ? 'page' : undefined} aria-label={`Página ${i + 1}`}>{i + 1}</Link>)}</nav>}
      </div>
    </div>
  );
}
