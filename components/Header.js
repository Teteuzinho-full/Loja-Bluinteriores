import Link from 'next/link';
import { getCatalog } from '@/lib/db';
import { getSettings } from '@/lib/settings';
import NavActions from './NavActions';
import SearchBox from './SearchBox';

export default async function Header() {
  const s = await getSettings();
  let cats = [];
  try { cats = (await getCatalog()).cats; } catch (e) { console.error(e); }
  const top = cats.filter((c) => !c.parent_id);
  return (
    <>
      <a className="skip" href="#conteudo">Ir para o conteúdo</a>
      {s.notice.active && s.notice.text && <div className="notice">{s.notice.href ? <a href={s.notice.href}>{s.notice.text}</a> : s.notice.text}</div>}
      <header className="hdr">
        <div className="wrap hrow" style={{ position: 'relative' }}>
          <Link className="logo" href="/">{s.store.name}</Link>
          <ul className="nav" aria-label="Departamentos">
            {top.map((c) => {
              const kids = cats.filter((k) => k.parent_id === c.id);
              return <li key={c.id}><Link href={`/categoria/${c.slug}`}>{c.name}</Link>{kids.length > 0 && <ul className="sub">{kids.map((k) => <li key={k.id}><Link href={`/categoria/${k.slug}`}>{k.name}</Link></li>)}</ul>}</li>;
            })}
            <li><Link href="/loja?ord=novidades">Novidades</Link></li>
            <li><Link href="/loja?oferta=1">Ofertas</Link></li>
          </ul>
          <span className="sp" />
          <SearchBox />
          <NavActions cats={cats} />
        </div>
      </header>
    </>
  );
}
