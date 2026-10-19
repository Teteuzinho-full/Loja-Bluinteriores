'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from './Store';
import SearchBox from './SearchBox';

export function ThemeToggle() {
  const toggle = () => {
    const r = document.documentElement;
    const cur = r.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
    const n = cur === 'dark' ? 'light' : 'dark';
    r.setAttribute('data-theme', n);
    try { localStorage.setItem('blu_theme', n); } catch {}
  };
  return <button className="ib" onClick={toggle} aria-label="Alternar tema claro e escuro"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" /></svg></button>;
}

export default function NavActions({ cats }) {
  const { count, favs, user } = useStore();
  const [open, setOpen] = useState(false);
  useEffect(() => { const f = (e) => e.key === 'Escape' && setOpen(false); window.addEventListener('keydown', f); return () => window.removeEventListener('keydown', f); }, []);
  return (
    <>
      <ThemeToggle />
      <Link className="ib" href={user ? '/conta' : '/entrar'} aria-label={user ? 'Minha conta' : 'Entrar'}><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg></Link>
      <Link className="ib" href="/conta#favoritos" aria-label={`Favoritos (${favs.length})`}><svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>{favs.length > 0 && <span className="cnt">{favs.length}</span>}</Link>
      <Link className="ib" href="/carrinho" aria-label={`Carrinho (${count} itens)`}><svg viewBox="0 0 24 24"><path d="M5 8h14l-1 12H6L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>{count > 0 && <span className="cnt">{count}</span>}</Link>
      <button className="ib mbtn" aria-expanded={open} aria-controls="mnav" aria-label="Menu" onClick={() => setOpen(!open)}><svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h16" /></svg></button>
      {open && (
        <div className="mnav" id="mnav" style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'var(--bg)' }}>
          <div className="msearch" style={{ padding: '0 0 8px' }}><SearchBox /></div>
          <Link href="/loja" onClick={() => setOpen(false)}>Todas as peças</Link>
          {cats.filter((c) => !c.parent_id).map((c) => (
            <div key={c.id}>
              <Link href={`/categoria/${c.slug}`} onClick={() => setOpen(false)}>{c.name}</Link>
              {cats.filter((s) => s.parent_id === c.id).map((s) => <Link className="c" key={s.id} href={`/categoria/${s.slug}`} onClick={() => setOpen(false)}>{s.name}</Link>)}
            </div>
          ))}
          <Link href="/loja?ord=novidades" onClick={() => setOpen(false)}>Novidades</Link>
          <Link href="/loja?oferta=1" onClick={() => setOpen(false)}>Ofertas</Link>
        </div>
      )}
    </>
  );
}
