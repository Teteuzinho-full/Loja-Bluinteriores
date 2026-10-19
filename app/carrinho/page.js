'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/components/Store';
import { useQuote } from '@/components/useQuote';
import CepField from '@/components/CepField';
import Summary from '@/components/Summary';
import Art from '@/components/Art';
import { brl, digits } from '@/lib/format';

export default function Cart() {
  const { cart, ready, setQty, remove, clear } = useStore();
  const [coupon, setCoupon] = useState(''), [applied, setApplied] = useState('');
  const [cep, setCep] = useState('');
  const { q, loading, err } = useQuote(cart, applied, digits(cep).length === 8 ? digits(cep) : '');
  if (!ready) return <div className="wrap narrow"><p>Carregando carrinho…</p></div>;
  if (!cart.length) return <div className="wrap narrow"><h1>Carrinho</h1><p className="mute">Seu carrinho está vazio. Escolha uma peça para começar.</p><Link className="btn" href="/loja">Continuar comprando</Link></div>;
  return (
    <div className="wrap sec">
      <h1>Carrinho</h1>
      <div className="cols">
        <div>
          {(q?.lines || []).map((l) => (
            <div className="line" key={l.id}>
              <div className="ph"><Art /></div>
              <div><Link href={`/produto/${l.slug}`}><strong>{l.name}</strong></Link><div className="small mute">SKU {l.sku} · {brl(l.unit)}{l.demo ? ' · demonstrativo' : ''}</div>
                <div className="q" style={{ marginTop: 6 }}><button aria-label="Diminuir" onClick={() => setQty(l.id, l.qty - 1)}>−</button><span aria-live="polite">{l.qty}</span><button aria-label="Aumentar" disabled={l.qty >= l.stock} onClick={() => setQty(l.id, l.qty + 1)}>+</button></div></div>
              <div style={{ textAlign: 'right' }}><strong>{brl(l.total)}</strong><br /><button className="btn o sm" onClick={() => remove(l.id)}>Remover</button></div>
            </div>
          ))}
          {loading && !q && <p className="mute">Atualizando valores…</p>}
          {err && <p className="msg err" role="alert">{err}</p>}
          {(q?.issues || []).map((m, i) => <p key={i} className="msg err">{m}</p>)}
          <p style={{ marginTop: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}><Link className="btn o" href="/loja">Continuar comprando</Link><button className="btn o" onClick={clear}>Limpar carrinho</button></p>
        </div>
        <aside>
          <h2 style={{ fontSize: 26 }}>Resumo</h2>
          <form className="f" onSubmit={(e) => { e.preventDefault(); setApplied(coupon); }}><label>Cupom<input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} /></label><button className="btn o sm">Aplicar cupom</button></form>
          <div style={{ marginTop: 14 }}><CepField id="cep-cart" label="CEP para frete" value={cep} onChange={setCep} /></div>
          <Summary q={q} />
          <p className="msg"><strong>Pagamentos temporariamente indisponíveis. Nenhuma cobrança será realizada.</strong></p>
          <Link className="btn w" href="/checkout">Ir para o checkout de demonstração</Link>
        </aside>
      </div>
    </div>
  );
}
