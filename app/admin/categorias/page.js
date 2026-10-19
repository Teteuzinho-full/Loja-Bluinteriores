import { allCategories } from '@/lib/db';
import { saveCategory, deleteCategory } from '../actions';
import ConfirmButton from '@/components/admin/ConfirmButton';
export default async function Page({ searchParams: sp }) {
  const cats = await allCategories();
  const Form = ({ c = {} }) => (
    <form className="f box" action={saveCategory}>
      {c.id && <input type="hidden" name="id" value={c.id} />}
      <div className="three"><label>Nome<input name="name" defaultValue={c.name} required /></label><label>Slug<input name="slug" defaultValue={c.slug} readOnly={!!c.id} /></label><label>Posição<input name="position" type="number" defaultValue={c.position ?? 0} /></label></div>
      <div className="two"><label>Descrição<input name="description" defaultValue={c.description || ''} /></label><label>Descrição SEO<input name="seo_description" defaultValue={c.seo_description || ''} /></label></div>
      <label>Categoria pai (subcategoria)<select name="parent_id" defaultValue={c.parent_id || ''}><option value="">Nenhuma (departamento)</option>{cats.filter((x) => x.id !== c.id && !x.parent_id).map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
      <div><button className="btn sm">{c.id ? 'Salvar' : 'Criar categoria'}</button></div>
    </form>
  );
  return (
    <>
      <h1>Categorias</h1>{sp.erro && <p className="msg err" role="alert">{sp.erro}</p>}
      {cats.map((c) => <div key={c.id}><Form c={c} /><form action={deleteCategory} style={{ margin: '-6px 0 16px' }}><input type="hidden" name="id" value={c.id} /><ConfirmButton msg="Excluir categoria?">Excluir {c.name}</ConfirmButton></form></div>)}
      <h2 style={{ fontSize: 26 }}>Nova categoria</h2><Form />
    </>
  );
}
