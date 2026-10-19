import { brl } from '@/lib/format';
export default function Summary({ q }) {
  if (!q) return null;
  return (
    <div className="box">
      <div className="row"><span>Subtotal</span><span>{brl(q.subtotal)}</span></div>
      {q.discount > 0 && <div className="row"><span>Desconto ({q.coupon?.code})</span><span>− {brl(q.discount)}</span></div>}
      <div className="row"><span>Frete (estimativa)</span><span>{q.shipping ? brl(q.shipping.price) : '—'}</span></div>
      {q.shipping && <p className="small mute">{q.shipping.days_min} a {q.shipping.days_max} dias úteis. {q.shipping.notice}</p>}
      {q.shippingRequested && !q.shipping && <p className="msg err">Frete indisponível para consulta no momento.</p>}
      <div className="row t"><span>Total estimado</span><span>{brl(q.total)}</span></div>
      {q.coupon && <p className={'msg ' + (q.coupon.ok ? 'ok' : 'err')}>{q.coupon.message}</p>}
    </div>
  );
}
