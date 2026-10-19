import Link from 'next/link';
export const metadata = { title: 'Página não encontrada', robots: { index: false } };
export default function NotFound() {
  return <div className="wrap narrow"><h1>Página não encontrada</h1><p className="mute">O endereço pode ter mudado ou o produto não está mais disponível.</p><p><Link className="btn" href="/loja">Ver todas as peças</Link></p></div>;
}
