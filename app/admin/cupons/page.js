import { allCoupons } from '@/lib/db';
import { saveCoupon, toggleCoupon } from '../actions';
export default async function Page({ searchParams: sp }) {
  const data = await allCoupons();
  return (
    <>
      <h1>Cupons</h1>{sp.erro && <p className="msg err" role="alert">{sp.erro}</p>}
      <p className="mute small">Cupons só afetam o resumo do pedido de teste; não geram desconto em pagamento (desativado). As regras são validadas no servidor.</p>
      <form className="f box" action={saveCoupon}>
        <div className="three"><label>Código<input name="code" required style={{ textTransform: 'uppercase' }} /></label><label>Tipo<select name="type"><option value="percent">Percentual (%)</option><option value="fixed">Valor fixo (R$)</option></select></label><label>Valor<input name="value" type="number" step="0.01" min="0.01" required /></label></div>
        <div className="three"><label>Pedido mínimo (R$)<input name="min_subtotal" type="number" step="0.01" min="0" defaultValue="0" /></label><label>Início<input name="starts_at" type="datetime-local" /></label><label>Fim<input name="ends_at" type="datetime-local" /></label></div>
        <div className="two"><label>Limite de usos<input name="max_uses" type="number" min="1" /></label><label className="chk"><input name="active" type="checkbox" defaultChecked /><span>Ativo</span></label></div>
        <button className="btn sm">Salvar cupom (mesmo código atualiza)</button>
      </form>
      <div className="tw"><table><thead><tr><th>Código</th><th>Regra</th><th>Mínimo</th><th>Validade</th><th>Usos</th><th></th></tr></thead><tbody>
        {data.map((c) => <tr key={c.code}><td>{c.code}</td><td>{c.type === 'percent' ? `${Number(c.value)}%` : `R$ ${Number(c.value)}`}</td><td>R$ {Number(c.min_subtotal)}</td><td>{c.starts_at ? new Date(c.starts_at).toLocaleDateString('pt-BR') : '—'} a {c.ends_at ? new Date(c.ends_at).toLocaleDateString('pt-BR') : '—'}</td><td>{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
          <td><form action={toggleCoupon}><input type="hidden" name="code" value={c.code} /><input type="hidden" name="to" value={c.active ? '0' : '1'} /><button className="btn o sm">{c.active ? 'Desativar' : 'Ativar'}</button></form></td></tr>)}
      </tbody></table></div>
    </>
  );
}
