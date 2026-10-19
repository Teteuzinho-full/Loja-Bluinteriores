import Catalog, { hasParams } from '@/components/Catalog';
import { getCatalog } from '@/lib/db';
export const revalidate = 60;
export function generateMetadata({ searchParams }) {
  return { title: 'Todas as peças', description: 'Mesas de centro, espelhos, aparadores, mesas laterais e objetos de decoração.', alternates: { canonical: '/loja' }, robots: hasParams(searchParams) ? { index: false, follow: true } : undefined };
}
export default async function Page({ searchParams }) {
  const { cats } = await getCatalog();
  return <div className="wrap sec"><nav className="crumbs" aria-label="Breadcrumb"><a href="/">Início</a> › Loja</nav><h1>{searchParams.q ? `Resultados para “${searchParams.q}”` : searchParams.oferta === '1' ? 'Ofertas' : 'Todas as peças'}</h1><Catalog cats={cats} sp={searchParams} base="/loja" /></div>;
}
