import { allUsers } from '@/lib/db';
import { resetCustomerPassword } from '../actions';
export default async function Page({ searchParams: sp }) {
  const users = await allUsers();
  return (
    <>
      <h1>Clientes ({users.length})</h1>{sp.ok && <p className="msg ok" role="status">Senha redefinida.</p>}{sp.erro && <p className="msg err" role="alert">{sp.erro}</p>}
      <p className="mute small">Sem provedor de e-mail, a recuperação de senha é assistida: defina aqui uma nova senha e informe ao cliente por um canal seguro.</p>
      <div className="tw"><table><thead><tr><th>Nome</th><th>E-mail</th><th>Cadastro</th><th>Nova senha</th></tr></thead><tbody>
        {users.map((u) => <tr key={u.email}><td>{u.name}</td><td>{u.email}</td><td>{new Date(u.created_at).toLocaleDateString('pt-BR')}</td>
          <td><form action={resetCustomerPassword} style={{ display: 'flex', gap: 6 }}><input type="hidden" name="email" value={u.email} /><input name="password" type="text" minLength={8} required placeholder="mín. 8 caracteres" aria-label="Nova senha" style={{ border: '1px solid var(--line)', padding: 4 }} /><button className="btn o sm">Definir</button></form></td></tr>)}
      </tbody></table></div>
    </>
  );
}
