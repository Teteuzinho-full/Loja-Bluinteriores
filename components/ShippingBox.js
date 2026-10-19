'use client';
import { useState } from 'react';
import CepField from './CepField';
import { brl, digits } from '@/lib/format';
export default function ShippingBox({ productId, stock }) {
  const [cep, setCep] = useState('');
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const onCep = async (v) => {
    setCep(v);
    const d = digits(v);
    if (d.length < 8) { setRes(null); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/frete', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: [{ id: productId, qty: 1 }], cep: d }) });
      setRes(await r.json());
    } catch { setRes({ error: true }); }
    setBusy(false);
  };
  const s = res?.shipping;
  return (
    <div className="box">
      <CepField id="cep-prod" label="Calcular frete" value={cep} onChange={onCep} />
      {busy && <p className="msg">Calculando frete…</p>}
      {res && !busy && (s
        ? <p><strong>{brl(s.price)}</strong> · {s.days_min} a {s.days_max} dias úteis<br /><span className="small mute">{s.notice} CEP de origem configurável no painel.</span></p>
        : <p className="msg err">Frete indisponível para consulta no momento.</p>)}
    </div>
  );
}
