'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
export default function SearchBox() {
  const [q, setQ] = useState('');
  const [list, setList] = useState([]);
  const router = useRouter();
  const t = useRef();
  useEffect(() => {
    clearTimeout(t.current);
    if (q.trim().length < 2) { setList([]); return; }
    const ctl = new AbortController();
    t.current = setTimeout(() => fetch('/api/busca?q=' + encodeURIComponent(q), { signal: ctl.signal }).then((r) => r.json()).then(setList).catch(() => {}), 250);
    return () => { clearTimeout(t.current); ctl.abort(); };
  }, [q]);
  return (
    <form className="sbox" role="search" onSubmit={(e) => { e.preventDefault(); setList([]); router.push('/loja?q=' + encodeURIComponent(q)); }}>
      <label className="sr" htmlFor="busca">Buscar produtos</label>
      <input id="busca" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome, SKU ou material" autoComplete="off" onKeyDown={(e) => e.key === 'Escape' && setList([])} />
      {list.length > 0 && <ul className="sugg">{list.map((p) => <li key={p.slug}><Link href={`/produto/${p.slug}`} onClick={() => setList([])}>{p.name} <span className="mute small">{p.sku}</span></Link></li>)}</ul>}
    </form>
  );
}
