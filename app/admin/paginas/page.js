import { allPages } from '@/lib/db';
import { savePage } from '../actions';
export default async function Page() {
  const data = await allPages();
  const F = ({ p = {} }) => <form className="f box" action={savePage}><div className="two"><label>Slug (URL /p/…)<input name="slug" defaultValue={p.slug} required readOnly={!!p.slug} /></label><label>Título<input name="title" defaultValue={p.title} required /></label></div><label>Conteúdo<textarea name="body" rows={6} defaultValue={p.body} /></label><button className="btn sm">Salvar página</button></form>;
  return <><h1>Páginas institucionais</h1><p className="mute small">Revise políticas e termos com assessoria jurídica antes de publicar.</p>{data.map((p) => <F key={p.slug} p={p} />)}<h2 style={{ fontSize: 24 }}>Nova página</h2><F /></>;
}
