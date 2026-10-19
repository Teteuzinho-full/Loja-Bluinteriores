import { notFound } from 'next/navigation';
import * as dbm from '@/lib/db';
import { saveProduct } from '../../actions';
import ImageManager from '@/components/admin/ImageManager';

export default async function Page({ params, searchParams: sp }) {
  const isNew = params.id === 'novo';
  const cats = await dbm.allCategories();
  let p = { status: 'draft', variations: [], is_demo: false, featured: false, stock: 0 }, images = [];
  if (!isNew) {
    const data = await dbm.getProduct(params.id);
    if (!data) notFound();
    p = data; images = data.images || [];
  }
  const I = ({ n, l, t = 'text', req, step }) => <label>{l}<input name={n} type={t} step={step} required={req} defaultValue={p[n] ?? ''} /></label>;
  return (
    <>
      <h1>{isNew ? 'Novo produto' : p.name}</h1>
      {sp.ok && <p className="msg ok" role="status">Produto salvo.</p>}{sp.erro && <p className="msg err" role="alert">{sp.erro}</p>}
      <form className="f" action={saveProduct}>
        {!isNew && <input type="hidden" name="id" value={p.id} />}
        <div className="two"><I n="name" l="Nome" req /><I n="slug" l="Slug (URL)" /></div>
        <div className="two"><I n="sku" l="SKU (único)" req /><label>Categoria<select name="category_id" required defaultValue={p.category_id || ''}><option value="" disabled>Selecione</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label></div>
        <I n="short_description" l="Descrição curta" /><label>Descrição completa<textarea name="description" defaultValue={p.description || ''} rows={5} /></label>
        <div className="three"><I n="price" l="Preço (R$)" t="number" step="0.01" req /><I n="sale_price" l="Preço promocional (R$)" t="number" step="0.01" />{isNew ? <I n="stock" l="Estoque inicial" t="number" /> : <p className="small mute">Estoque atual: <strong>{p.stock}</strong>. Altere em Estoque (registra ajuste).</p>}</div>
        <div className="two"><I n="material" l="Material" /><I n="color" l="Cor" /></div>
        <div className="three"><I n="width_cm" l="Largura (cm)" t="number" step="0.1" /><I n="height_cm" l="Altura (cm)" t="number" step="0.1" /><I n="depth_cm" l="Profundidade (cm)" t="number" step="0.1" /></div>
        <div className="three"><I n="weight_kg" l="Peso (kg)" t="number" step="0.01" /><I n="package_w" l="Embalagem larg. (cm)" t="number" step="0.1" /><I n="package_h" l="Embalagem alt. (cm)" t="number" step="0.1" /></div>
        <I n="package_d" l="Embalagem prof. (cm)" t="number" step="0.1" />
        <div className="three"><I n="assembly" l="Montagem" /><I n="care" l="Cuidados" /><I n="warranty" l="Garantia" /></div>
        <label>Variações (JSON, ex.: [{'{"tipo":"cor","opcoes":["Marfim","Areia"]}'}])<textarea name="variations" rows={3} defaultValue={JSON.stringify(p.variations || [])} /></label>
        <div className="two"><I n="seo_title" l="Título SEO" /><I n="seo_description" l="Meta description" /></div>
        <label>Status<select name="status" defaultValue={p.status}><option value="draft">Rascunho</option><option value="published">Publicado</option></select></label>
        <label className="chk"><input type="checkbox" name="featured" defaultChecked={p.featured} /><span>Produto em destaque na página inicial</span></label>
        <label className="chk"><input type="checkbox" name="is_demo" defaultChecked={p.is_demo} /><span>Produto de demonstração (não é item real à venda)</span></label>
        <button className="btn">Salvar produto</button>
      </form>
      {!isNew && <section style={{ marginTop: 32 }}><h2 style={{ fontSize: 26 }}>Imagens</h2><ImageManager productId={p.id} images={images} /></section>}
      {isNew && <p className="mute small">Salve o produto para enviar imagens.</p>}
    </>
  );
}
