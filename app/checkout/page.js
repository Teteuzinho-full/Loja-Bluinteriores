'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/Store';
import { useQuote } from '@/components/useQuote';
import CepField from '@/components/CepField';
import Summary from '@/components/Summary';
import { digits } from '@/lib/format';
import { track } from '@/lib/analytics';

export default function Checkout() {
  const { cart, ready, clear } = useStore();
  const [f, setF] = useState({ name: '', email: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: '' });
  const [coupon, setCoupon] = useState(''), [applied, setApplied] = useState('');
  const [busy, setBusy] = useState(false), [err, setErr] = useState(''), [done, setDone] = useState(null);
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const cep8 = digits(f.cep);
  const { q } = useQuote(cart, applied, cep8.length === 8 ? cep8 : '');
  useEffect(() => { if (ready && cart.length) track('begin_checkout', { items: cart.map((i) => ({ item_id: i.id, quantity: i.qty })) }); }, [ready]); // eslint-disable-line
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true);
    try {
      const r = await fetch('/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.name, email: f.email, coupon: applied, items: cart.map((i) => ({ id: i.id, qty: i.qty })), address: { cep: cep8, street: f.street, number: f.number, complement: f.complement, district: f.district, city: f.city, state: f.state } }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Erro ao registrar o pedido.');
      setDone(j); clear();
    } catch (x) { setErr(x.message); }
    setBusy(false);
  };
  if (!ready) return <div className="wrap narrow"><p>Carregando…</p></div>;
  if (done) return <div className="wrap narrow"><h1>Pedido de teste registrado</h1><p>Número <strong>#{done.number}</strong>. Este é um pedido de demonstração: <strong>nenhuma cobrança foi realizada</strong> e ele não conta como venda.</p><Link className="btn" href="/loja">Voltar à loja</Link></div>;
  if (!cart.length) return <div className="wrap narrow"><h1>Checkout</h1><p className="mute">Seu carrinho está vazio.</p><Link className="btn" href="/loja">Ver peças</Link></div>;
  return (
    <div className="wrap sec">
      <h1>Checkout de demonstração</h1>
      <p className="msg"><strong>Pagamentos temporariamente indisponíveis. Nenhuma cobrança será realizada.</strong> Esta etapa serve para validar endereço, frete estimado e resumo.</p>
      <div className="cols">
        <form className="f" onSubmit={submit}>
          <div className="two"><label>Nome completo<input required value={f.name} onChange={set('name')} autoComplete="name" /></label><label>E-mail<input required type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label></div>
          <CepField value={f.cep} onChange={(v) => setF((x) => ({ ...x, cep: v }))} onAddress={(a) => setF((x) => ({ ...x, ...a }))} />
          <label>Endereço<input required value={f.street} onChange={set('street')} autoComplete="address-line1" /></label>
          <div className="two"><label>Número<input required value={f.number} onChange={set('number')} /></label><label>Complemento<input value={f.complement} onChange={set('complement')} /></label></div>
          <div className="three"><label>Bairro<input required value={f.district} onChange={set('district')} /></label><label>Cidade<input required value={f.city} onChange={set('city')} /></label><label>UF<input required maxLength={2} value={f.state} onChange={(e) => setF((x) => ({ ...x, state: e.target.value.toUpperCase() }))} /></label></div>
          {err && <p className="msg err" role="alert">{err}</p>}
          <button className="btn" disabled={busy || !q?.shipping}>{busy ? 'Registrando…' : 'Registrar pedido de teste'}</button>
          <p className="small mute">O pagamento (PIX e cartão) está desativado nesta fase.</p>
        </form>
        <aside><h2 style={{ fontSize: 26 }}>Resumo</h2>
          {(q?.lines || []).map((l) => <div className="row" key={l.id}><span>{l.qty}× {l.name}</span><span>{l.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>)}
          <form className="f" style={{ marginTop: 12 }} onSubmit={(e) => { e.preventDefault(); setApplied(coupon); }}><label>Cupom<input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} /></label><button className="btn o sm">Aplicar</button></form>
          <Summary q={q} /></aside>
      </div>
    </div>
  );
}
