import { allProducts, stockLog } from '@/lib/db';
import { adjustStock } from '../actions';
export default async function Page({ searchParams: sp }) {
  const [prods, log] = await Promise.all([allProducts(), stockLog()]);
  const low = prods.sort((a, b) => a.stock - b.stock).slice(0, 40);
  return (
    <>
      <h1>Estoque</h1>{sp.erro && <p className="msg err" role="alert">{sp.erro}</p>}
      <p className="mute small">Ordenado do menor para o maior estoque. Ajustes são registrados com data e responsável; saldo negativo é bloqueado.</p>
      <div className="tw"><table><thead><tr><th>Produto</th><th>SKU</th><th>Estoque</th><th>Ajustar</th></tr></thead><tbody>
        {low.map((p) => (
          <tr key={p.id}><td>{p.name}</td><td>{p.sku}</td><td>{p.stock <= 3 ? <strong style={{ color: 'var(--err)' }}>{p.stock} (baixo)</strong> : p.stock}</td>
            <td><form action={adjustStock} style={{ display: 'flex', gap: 6 }}><input type="hidden" name="id" value={p.id} /><input name="delta" type="number" required placeholder="+10 / -2" aria-label="Variação" style={{ width: 90, border: '1px solid var(--line)', padding: 4 }} /><input name="reason" placeholder="Motivo" aria-label="Motivo" style={{ border: '1px solid var(--line)', padding: 4 }} /><button className="btn o sm">Aplicar</button></form></td></tr>
        ))}
      </tbody></table></div>
      <h2 style={{ fontSize: 26, marginTop: 28 }}>Últimos ajustes</h2>
      <ul className="small">{log.map((l, i) => <li key={i}>{new Date(l.at).toLocaleString('pt-BR')} · {l.sku} · {l.delta > 0 ? '+' : ''}{l.delta} · {l.reason} · {l.by}</li>)}</ul>
    </>
  );
}
