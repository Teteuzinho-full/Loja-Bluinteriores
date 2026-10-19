import { allNews, putNews } from '@/lib/db';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Cancelar inscrição', robots: { index: false } };
export default async function Page({ searchParams }) {
  const t = searchParams.token;
  let ok = false;
  if (t && /^[\w-]{20,64}$/.test(t)) {
    const n = (await allNews()).find((x) => x.unsubscribe_token === t);
    if (n) { await putNews({ ...n, unsubscribed_at: new Date().toISOString() }); ok = true; }
  }
  return <div className="wrap narrow"><h1>Cancelar inscrição</h1><p>{ok ? 'Sua inscrição foi cancelada.' : 'Link inválido ou já utilizado.'}</p></div>;
}
