import Link from 'next/link';
import Art from './Art';
import { brl, unitPrice } from '@/lib/format';
import { AddButton, FavButton } from './Buttons';

export function primaryImage(p) {
  const im = (p.images || []).slice().sort((a, b) => Number(!!b.is_primary) - Number(!!a.is_primary))[0];
  return im || null;
}
export default function ProductCard({ p, catSlug = '' }) {
  const im = primaryImage(p), u = unitPrice(p), promo = u < Number(p.price);
  return (
    <article className="card">
      <Link href={`/produto/${p.slug}`} className="ph" aria-label={p.name}>
        {im ? <img src={im.url} alt={im.alt || p.name} width="400" height="500" loading="lazy" decoding="async" /> : <Art cat={catSlug} />}
        {(!im || p.is_demo) && <span className="tag">{p.is_demo ? 'Demonstrativo' : 'Ilustrativa'}</span>}
      </Link>
      <FavButton id={p.id} name={p.name} />
      <h3><Link href={`/produto/${p.slug}`}>{p.name}</Link></h3>
      <div className="small mute">{[p.material, p.color].filter(Boolean).join(' · ')}</div>
      <div className="price">{promo && <s>{brl(p.price)}</s>}{brl(u)}</div>
      {p.stock > 0 ? <AddButton p={{ id: p.id, sku: p.sku, name: p.name, stock: p.stock }} /> : <button className="btn o w sm" disabled>Indisponível</button>}
    </article>
  );
}
