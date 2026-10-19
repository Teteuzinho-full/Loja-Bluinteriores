'use client';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { track } from '@/lib/analytics';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);
  const [favs, setFavs] = useState([]);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    try { setCart(JSON.parse(localStorage.getItem('blu_cart') || '[]')); } catch {}
    setReady(true);
  }, []);
  useEffect(() => { if (ready) try { localStorage.setItem('blu_cart', JSON.stringify(cart)); } catch {} }, [cart, ready]);
  useEffect(() => {
    fetch('/api/me').then((r) => r.json()).then((j) => { setUser(j.user); setFavs(j.favs || []); }).catch(() => {});
  }, []);
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(''), 2200); return () => clearTimeout(t); }, [msg]);

  const notify = useCallback((m) => setMsg(m), []);
  const add = (p, qty = 1) => {
    setCart((c) => {
      const i = c.find((x) => x.id === p.id);
      const max = p.stock ?? 99;
      if (i) return c.map((x) => (x.id === p.id ? { ...x, qty: Math.min(max, x.qty + qty) } : x));
      return [...c, { id: p.id, qty: Math.min(max, qty) }];
    });
    track('add_to_cart', { items: [{ item_id: p.sku, item_name: p.name, quantity: qty }] });
    notify('Adicionado ao carrinho');
  };
  const setQty = (id, qty) => setCart((c) => (qty < 1 ? c.filter((x) => x.id !== id) : c.map((x) => (x.id === id ? { ...x, qty: Math.min(99, qty) } : x))));
  const remove = (id) => setCart((c) => c.filter((x) => x.id !== id));
  const clear = () => setCart([]);
  const toggleFav = async (id) => {
    if (!user || user.role !== 'customer') { window.location.href = '/entrar?next=' + encodeURIComponent(window.location.pathname); return; }
    setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
    try { const r = await fetch('/api/favoritos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) }); const j = await r.json(); if (r.ok) setFavs(j.favs); } catch {}
  };
  const count = cart.reduce((a, i) => a + i.qty, 0);
  return (
    <Ctx.Provider value={{ cart, ready, add, setQty, remove, clear, count, user, favs, toggleFav, notify }}>
      {children}
      {msg && <div className="toast" role="status">{msg}</div>}
    </Ctx.Provider>
  );
}
