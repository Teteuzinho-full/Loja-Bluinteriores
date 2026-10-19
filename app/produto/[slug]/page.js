import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCatalog } from '@/lib/db';
import { brl, unitPrice, SITE } from '@/lib/format';
import Gallery from '@/components/Gallery';
import ShippingBox from '@/components/ShippingBox';
import ProductCard from '@/components/ProductCard';
import { AddButton } from '@/components/Buttons';
import ViewItem from '@/components/ViewItem';
export const revalidate = 60;

async function load(slug) {
  const { products, cats } = await getCatalog();
  const p = products.find((x) => x.slug === slug && x.status === 'published');
  return p ? { ...p, categories: cats.find((c) => c.id === p.category_id) || { slug: 'loja', name: 'Loja' }, all: products.filter((x) => x.status === 'published') } : null;
}
export async function generateMetadata({ params }) {
  const p = await load(params.slug);
  if (!p) return { title: 'Produto não encontrado', robots: { index: false } };
  const im = (p.images || [])[0];
  return { title: p.seo_title || p.name, description: p.seo_description || p.short_description, alternates: { canonical: `/produto/${p.slug}` }, openGraph: { title: p.seo_title || p.name, description: p.seo_description || p.short_description, images: im ? [im.url] : undefined } };
}
const dim = (p) => [p.width_cm, p.height_cm, p.depth_cm].filter((x) => x != null).map(Number).join(' × ');

export default async function Page({ params }) {
  const p = await load(params.slug);
  if (!p) notFound(); // produto despublicado ou removido: 404 útil, sem página quebrada
  const imgs = (p.images || []).slice().sort((a, b) => Number(!!b.is_primary) - Number(!!a.is_primary));
  const rel = { data: p.all.filter((x) => x.category_id === p.category_id && x.id !== p.id).slice(0, 4) };
  const comp = { data: p.all.filter((x) => x.category_id !== p.category_id).slice(0, 4) };
  const u = unitPrice(p), promo = u < Number(p.price);
  const ld = [
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Início', item: SITE() }, { '@type': 'ListItem', position: 2, name: p.categories.name, item: `${SITE()}/categoria/${p.categories.slug}` }, { '@type': 'ListItem', position: 3, name: p.name }] },
    // Itens de demonstração NÃO publicam Offer (preço fictício não deve ir para dados estruturados).
    { '@context': 'https://schema.org', '@type': 'Product', name: p.name, sku: p.sku, description: p.short_description || p.description, image: imgs.map((i) => i.url), material: p.material, color: p.color,
      ...(p.is_demo ? {} : { offers: { '@type': 'Offer', priceCurrency: 'BRL', price: u.toFixed(2), availability: p.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock', url: `${SITE()}/produto/${p.slug}` } }) },
  ];
  return (
    <div className="wrap">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <ViewItem sku={p.sku} name={p.name} price={u} />
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Início</Link> › <Link href={`/categoria/${p.categories.slug}`}>{p.categories.name}</Link> › {p.name}</nav>
      <div className="pd">
        <Gallery images={imgs} name={p.name} cat={p.categories.slug} demo={p.is_demo} />
        <div>
          <h1>{p.name}</h1>
          <p className="mute small">SKU {p.sku}</p>
          <p className="price" style={{ fontSize: 24 }}>{promo && <s>{brl(p.price)}</s>}{brl(u)}</p>
          {p.is_demo && <p className="msg">Preço, estoque e especificações são exemplos de demonstração e não representam dados comerciais reais.</p>}
          <p>{p.stock > 0 ? <span style={{ color: 'var(--ok)' }}>Em estoque ({p.stock} un.)</span> : <span style={{ color: 'var(--err)' }}>Indisponível</span>}</p>
          {p.stock > 0 ? <AddButton full p={{ id: p.id, sku: p.sku, name: p.name, stock: p.stock }} /> : <button className="btn o" disabled>Indisponível</button>}
          <p className="msg"><strong>Pagamentos temporariamente indisponíveis. Nenhuma cobrança será realizada.</strong></p>
          <ShippingBox productId={p.id} stock={p.stock} />
          {p.description && <><h2 style={{ fontSize: 26, marginTop: 28 }}>Descrição</h2><p className="prose">{p.description}</p></>}
          <h2 style={{ fontSize: 26, marginTop: 28 }}>Detalhes</h2>
          <dl className="dl">
            {p.material && <><dt>Material</dt><dd>{p.material}</dd></>}{p.color && <><dt>Cor</dt><dd>{p.color}</dd></>}
            {dim(p) && <><dt>Dimensões (L × A × P)</dt><dd>{dim(p)} cm</dd></>}{p.weight_kg != null && <><dt>Peso</dt><dd>{Number(p.weight_kg)} kg</dd></>}
            {p.package_w && <><dt>Embalagem</dt><dd>{Number(p.package_w)} × {Number(p.package_h)} × {Number(p.package_d)} cm</dd></>}
            {p.assembly && <><dt>Montagem</dt><dd>{p.assembly}</dd></>}{p.care && <><dt>Cuidados</dt><dd>{p.care}</dd></>}{p.warranty && <><dt>Garantia</dt><dd>{p.warranty}</dd></>}
          </dl>
          <p className="small mute">Entrega e devolução: veja a <Link href="/p/politica-de-entrega">política de entrega</Link> e a <Link href="/p/trocas-e-devolucoes">política de trocas</Link>.</p>
        </div>
      </div>
      {rel.data?.length > 0 && <section className="sec"><h2>Mais em {p.categories.name}</h2><div className="grid">{rel.data.map((x) => <ProductCard key={x.id} p={x} catSlug={p.categories.slug} />)}</div></section>}
      {comp.data?.length > 0 && <section className="sec"><h2>Para combinar</h2><div className="grid">{comp.data.map((x) => <ProductCard key={x.id} p={x} />)}</div></section>}
    </div>
  );
}
