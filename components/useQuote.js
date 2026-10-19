'use client';
import { useEffect, useState } from 'react';
// Busca no servidor os valores oficiais (preço, estoque, cupom, frete). O navegador só exibe.
export function useQuote(items, coupon, cep) {
  const [q, setQ] = useState(null), [loading, setL] = useState(false), [err, setE] = useState('');
  const key = JSON.stringify(items.map((i) => [i.id, i.qty]));
  useEffect(() => {
    if (!items.length) { setQ(null); return; }
    const ctl = new AbortController();
    setL(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch('/api/cart/quote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items: items.map((i) => ({ id: i.id, qty: i.qty })), coupon, cep }), signal: ctl.signal });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || 'erro');
        setQ(j); setE('');
      } catch (e) { if (e.name !== 'AbortError') setE('Não foi possível atualizar os valores. Tente novamente.'); }
      finally { setL(false); }
    }, 250);
    return () => { clearTimeout(t); ctl.abort(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, coupon, cep]);
  return { q, loading, err };
}
