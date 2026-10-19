import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { brl } from '@/lib/format';
import { allOrders, getCatalog } from '@/lib/db';
import { ProfileForm, AddressManager, LogoutButton } from '@/components/ContaForms';
import ProductCard from '@/components/ProductCard';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Minha conta', robots: { index: false } };

export default async function Conta() {
  const { user, profile } = await requireUser('/conta');
  // Pedidos e favoritos são filtrados pelo e-mail da sessão: um cliente nunca vê dados de outra conta.
  const orders = (await allOrders()).filter((o) => o.user_email === user.email);
  const { products } = await getCatalog();
  const favs = products.filter((p) => p.status === 'published' && profile.favs.includes(p.id));
  return (
    <div className="wrap sec">
      <div className="sh"><h1>Minha conta</h1><div style={{ display: 'flex', gap: 8 }}><LogoutButton /></div></div>
      <p className="mute">{user.email}</p>
      <section className="sec" style={{ paddingTop: 24 }}><h2>Dados pessoais</h2><ProfileForm profile={profile} /></section>
      <section className="sec" style={{ paddingTop: 0 }}><h2>Endereços</h2><AddressManager initial={profile.addresses} /></section>
      <section className="sec" style={{ paddingTop: 0 }}><h2>Pedidos</h2>
        {!orders.length ? <p className="mute">Você ainda não tem pedidos.</p> : orders.map((o) => (
          <details key={o.id} className="box"><summary><strong>#{o.number}</strong> · {new Date(o.created_at).toLocaleDateString('pt-BR')} · {brl(o.total)} · {o.is_test && <span className="badge">Pedido de teste</span>} <span className="badge">Pagamento: {o.payment_status}</span></summary>
            <ul>{o.items.map((i, n) => <li key={n}>{i.qty}× {i.name} — {brl(i.unit_price)}</li>)}</ul><p className="small mute">Frete: {o.shipping_label}. Rastreamento: não disponível (sem envio real).</p></details>
        ))}
      </section>
      <section id="favoritos" className="sec" style={{ paddingTop: 0 }}><h2>Favoritos</h2>
        {!favs.length ? <p className="mute">Nenhum favorito ainda.</p> : <div className="grid">{favs.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
      </section>
    </div>
  );
}
