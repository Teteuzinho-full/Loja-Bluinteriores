import Link from 'next/link';
import * as db from '@/lib/db';
import { brl, norm } from '@/lib/format';
import { togglePublish, deleteProduct } from '../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';
export default async function Page({ searchParams: sp }) {
  const PS = 25, page = Math.max(1, parseInt(sp.pagina) || 1);
  const [all, cats] = await Promise.all([db.allProducts(), db.allCategories()]);
  const cn = new Map(cats.map((c) => [c.id, c.name])), q = norm(sp.q || '');
  const list = all.filter((p) => (!q || norm(`${p.name} ${p.sku}`).includes(q)) && (!sp.cat || p.category_id === sp.cat) && (!sp.status || p.status === sp.status)).sort((a, b) => b.created_at.localeCompare(a.created_at));
  const pages = Math.max(1, Math.ceil(list.length / PS)), data = list.slice((page - 1) * PS, page * PS);
  const href = (n) => { const u = new URLSearchParams(sp); u.set('pagina', n); return `/admin/produtos?${u}`; };
  return (
    <>
      <div className="sh"><h1>Produtos ({list.length})</h1><Link className="btn" href="/admin/produtos/novo">Novo produto</Link></div>
      <form className="filters" style={{ gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', marginBottom: 16 }}>
        <input name="q" placeholder="Nome ou SKU" defaultValue={sp.q || ''} aria-label="Buscar" />
        <select name="cat" defaultValue={sp.cat || ''} aria-label="Categoria"><option value="">Todas as categorias</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="status" defaultValue={sp.status || ''} aria-label="Status"><option value="">Qualquer status</option><option value="published">Publicado</option><option value="draft">Rascunho</option></select>
        <button className="btn sm">Filtrar</button>
      </form>
      <div className="tw"><table><thead><tr><th>Produto</th><th>SKU</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th>Ações</th></tr></thead><tbody>
        {data.map((p) => (
          <tr key={p.id}><td><Link href={`/admin/produtos/${p.id}`}>{p.name}</Link> {p.is_demo && <span className="badge">demo</span>}</td><td>{p.sku}</td><td>{cn.get(p.category_id)}</td><td>{brl(p.price)}</td><td>{p.stock}</td><td>{p.status === 'published' ? 'Publicado' : 'Rascunho'}</td>
            <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <form action={togglePublish}><input type="hidden" name="id" value={p.id} /><input type="hidden" name="to" value={p.status === 'published' ? 'draft' : 'published'} /><button className="btn o sm">{p.status === 'published' ? 'Despublicar' : 'Publicar'}</button></form>
              <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><ConfirmButton msg={`Excluir ${p.name}? Esta ação não pode ser desfeita.`}>Excluir</ConfirmButton></form>
            </td></tr>
        ))}
      </tbody></table></div>
      {pages > 1 && <nav className="pg">{Array.from({ length: pages }, (_, i) => <Link key={i} href={href(i + 1)} aria-current={i + 1 === page ? 'page' : undefined}>{i + 1}</Link>)}</nav>}
    </>
  );
}
