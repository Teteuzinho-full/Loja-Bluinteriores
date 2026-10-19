import { notFound } from 'next/navigation';
import Link from 'next/link';
import Catalog, { hasParams } from '@/components/Catalog';
import { getCatalog } from '@/lib/db';
export const revalidate = 60;
async function load(slug) {
  const { cats } = await getCatalog();
  return { cats, cat: cats.find((c) => c.slug === slug) };
}
export async function generateMetadata({ params, searchParams }) {
  const { cat } = await load(params.slug);
  if (!cat) return {};
  return { title: cat.name, description: cat.seo_description || cat.description, alternates: { canonical: `/categoria/${cat.slug}` }, robots: hasParams(searchParams) ? { index: false, follow: true } : undefined };
}
export default async function Page({ params, searchParams }) {
  const { cats, cat } = await load(params.slug);
  if (!cat) notFound();
  const parent = cats.find((c) => c.id === cat.parent_id);
  return (
    <div className="wrap sec">
      <nav className="crumbs" aria-label="Breadcrumb"><Link href="/">Início</Link> › {parent && <><Link href={`/categoria/${parent.slug}`}>{parent.name}</Link> › </>}{cat.name}</nav>
      <h1>{cat.name}</h1>{cat.description && <p className="mute" style={{ maxWidth: '60ch' }}>{cat.description}</p>}
      <Catalog cat={cat} cats={cats} sp={searchParams} base={`/categoria/${cat.slug}`} />
    </div>
  );
}
