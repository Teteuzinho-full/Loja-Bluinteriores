import Link from 'next/link';
import { getCatalog, getBestSellers } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import ProductCard from '@/components/ProductCard';
import Art from '@/components/Art';
export const revalidate = 60;
export const metadata = { alternates: { canonical: '/' } };

export default async function Home() {
  const s = await getSettings(), h = s.home;
  const { products, cats: allCats } = await getCatalog();
  const pub = products.filter((p) => p.status === 'published');
  const cats = { data: allCats.filter((c) => !c.parent_id) };
  const feat = { data: pub.filter((p) => p.featured).slice(0, 8) };
  const news = { data: pub.slice(0, 8) };
  // Mais vendidos: SOMENTE vendas reais e pagas. Sem vendas, a seção não aparece.
  let best = [];
  try { const ids = await getBestSellers(); best = ids.map((id) => pub.find((p) => p.id === id)).filter(Boolean); } catch {}
  const catOf = new Map(cats.data.map((c) => [c.id, c.slug]));
  const Row = ({ title, list, href }) => list?.length ? <section className="sec"><div className="wrap"><div className="sh"><h2>{title}</h2>{href && <Link href={href}>Ver todas</Link>}</div><div className="grid">{list.map((p) => <ProductCard key={p.id} p={p} catSlug={catOf.get(p.category_id)} />)}</div></div></section> : null;
  return (
    <>
      <section className="hero">
        <div className="hero-t"><h1>{h.title}</h1><p>{h.subtitle}</p><Link className="btn" href={h.cta_href || '/loja'}>{h.cta_label}</Link></div>
        <div className="hero-i">{h.image_url ? <img src={h.image_url} alt="" width="900" height="900" fetchPriority="high" /> : <Art cat="mesa" />}</div>
      </section>
      <section className="sec"><div className="wrap"><div className="sh"><h2>Departamentos</h2></div>
        <div className="cats">{(cats.data || []).map((c) => <Link className="cat" key={c.id} href={`/categoria/${c.slug}`}><Art cat={c.slug} /><span>{c.name}</span></Link>)}</div></div></section>
      <Row title="Seleção da casa" list={feat.data} href="/loja" />
      <Row title="Novidades" list={news.data} href="/loja?ord=novidades" />
      <Row title="Mais vendidos" list={best} />
      <section className="sec ed"><div className="wrap"><h2>Para decorar com critério</h2><div className="e3">
        <article><h3>Como escolher uma mesa de centro</h3><p className="mute">Deixe cerca de 40 cm livres entre a mesa e o sofá e prefira alturas próximas à do assento.</p></article>
        <article><h3>Espelhos para o hall de entrada</h3><p className="mute">Posicione o espelho de frente para uma fonte de luz natural para ampliar a sensação de espaço.</p></article>
        <article><h3>Aparadores e composição</h3><p className="mute">Combine objetos de alturas diferentes e deixe áreas livres para dar ritmo à superfície.</p></article></div></div></section>
    </>
  );
}
