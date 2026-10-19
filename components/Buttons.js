'use client';
import { useState } from 'react';
import { useStore } from './Store';
export function AddButton({ p, full }) {
  const { add } = useStore();
  const [q, setQ] = useState(1);
  if (!full) return <button className="btn w sm" onClick={() => add(p, 1)}>Adicionar ao carrinho</button>;
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <label className="small">Quantidade <input type="number" min="1" max={p.stock} value={q} onChange={(e) => setQ(Math.max(1, Math.min(p.stock, parseInt(e.target.value) || 1)))} style={{ width: 80, height: 44, border: '1px solid var(--line)', background: 'var(--surf)', padding: '0 8px' }} /></label>
      <button className="btn" onClick={() => add(p, q)}>Adicionar ao carrinho</button>
    </div>
  );
}
export function FavButton({ id, name }) {
  const { favs, toggleFav } = useStore();
  const on = favs.includes(id);
  return <button className="fav" aria-pressed={on} aria-label={`Favoritar ${name}`} onClick={() => toggleFav(id)}><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg></button>;
}
