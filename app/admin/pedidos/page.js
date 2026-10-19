import { allOrders } from '@/lib/db';
import { brl } from '@/lib/format';
import { cancelOrder } from '../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';
export default async function Page() {
  const data = await allOrders();
  return (
    <>
      <h1>Pedidos de teste</h1>
      <p className="mute small">Pagamentos desativados: nenhum pedido é pago. O status financeiro não pode ser alterado aqui.</p>
      {!data.length && <p className="mute">Nenhum pedido registrado.</p>}
      {data.slice(0, 100).map((o) => (
        <details key={o.id} className="box"><summary><strong>#{o.number}</strong> · {o.customer_name} · {brl(o.total)} · <span className="badge">{o.status}</span> <span className="badge">pagamento: {o.payment_status}</span> {o.is_test && <span className="badge">teste</span>}</summary>
          <p className="small">{o.email}<br />{o.address.street}, {o.address.number} {o.address.complement} · {o.address.district} · {o.address.city}/{o.address.state} · CEP {o.address.cep}<br />Frete: {brl(o.shipping_cost)} ({o.shipping_label}) · Desconto: {brl(o.discount)} {o.coupon_code && `(${o.coupon_code})`}</p>
          <ul className="small">{o.items.map((i, n) => <li key={n}>{i.qty}× {i.name} — {brl(i.unit_price)}</li>)}</ul>
          {o.status !== 'cancelado' && o.is_test && <form action={cancelOrder}><input type="hidden" name="id" value={o.id} /><ConfirmButton msg="Cancelar este pedido de teste?">Cancelar pedido de teste</ConfirmButton></form>}
        </details>
      ))}
    </>
  );
}
