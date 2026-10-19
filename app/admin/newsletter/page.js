import { allNews } from '@/lib/db';
export default async function Page() {
  const data = await allNews();
  return <><h1>Newsletter ({data.length})</h1><p className="mute small">Inscrições com consentimento registrado. Nenhum e-mail é enviado automaticamente.</p><div className="tw"><table><thead><tr><th>E-mail</th><th>Consentimento</th><th>Situação</th></tr></thead><tbody>{data.map((s) => <tr key={s.email}><td>{s.email}</td><td>{new Date(s.consent_at).toLocaleString('pt-BR')}</td><td>{s.unsubscribed_at ? 'Descadastrado' : 'Ativo'}</td></tr>)}</tbody></table></div></>;
}
