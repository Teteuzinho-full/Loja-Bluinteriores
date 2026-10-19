import { notFound } from 'next/navigation';
import { getPages } from '@/lib/db';
export const revalidate = 60;
async function load(slug) { return (await getPages()).find((p) => p.slug === slug); }
export async function generateMetadata({ params }) { const p = await load(params.slug); return p ? { title: p.title, alternates: { canonical: `/p/${p.slug}` } } : {}; }
export default async function Page({ params }) {
  const p = await load(params.slug);
  if (!p) notFound();
  return <div className="wrap narrow"><h1>{p.title}</h1><div className="prose">{p.body}</div></div>;
}
