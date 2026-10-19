'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CepField from './CepField';

const post = async (body) => {
  try { const r = await fetch('/api/conta', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); const j = await r.json(); return r.ok ? { ok: true } : { error: j.error }; }
  catch { return { error: 'Falha de conexão.' }; }
};
export function LogoutButton() {
  return <button className="btn o sm" onClick={async () => { await fetch('/api/auth/logout', { method: 'POST' }); window.location.assign('/'); }}>Sair</button>;
}
export function ProfileForm({ profile }) {
  const [m, setM] = useState({ t: '', k: '' }), [pm, setPm] = useState({ t: '', k: '' });
  const save = async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    const r = await post({ action: 'profile', name: f.get('name'), phone: f.get('phone'), marketing: f.get('mkt') === 'on' });
    setM(r.ok ? { t: 'Dados salvos.', k: 'ok' } : { t: r.error || 'Não foi possível salvar.', k: 'err' });
  };
  const pw = async (e) => {
    e.preventDefault(); const f = new FormData(e.target);
    const r = await post({ action: 'password', current: f.get('current'), next: f.get('next') });
    setPm(r.ok ? { t: 'Senha alterada.', k: 'ok' } : { t: r.error, k: 'err' }); if (r.ok) e.target.reset();
  };
  return (
    <>
      <form className="f" onSubmit={save}>
        <div className="two"><label>Nome<input name="name" defaultValue={profile.full_name} required /></label><label>Telefone<input name="phone" defaultValue={profile.phone} autoComplete="tel" /></label></div>
        <label className="chk"><input name="mkt" type="checkbox" defaultChecked={profile.marketing_opt_in} /><span className="small">Aceito receber comunicações de marketing por e-mail.</span></label>
        <button className="btn sm">Salvar dados</button><p className={'msg ' + m.k} role="status">{m.t}</p>
      </form>
      <form className="f" onSubmit={pw} style={{ marginTop: 16 }}>
        <div className="two"><label>Senha atual<input name="current" type="password" autoComplete="current-password" required /></label><label>Nova senha (mín. 8)<input name="next" type="password" autoComplete="new-password" minLength={8} required /></label></div>
        <button className="btn o sm">Alterar senha</button><p className={'msg ' + pm.k} role="status">{pm.t}</p>
      </form>
    </>
  );
}
const EMPTY = { recipient: '', cep: '', street: '', number: '', complement: '', district: '', city: '', state: '' };
export function AddressManager({ initial }) {
  const router = useRouter();
  const [f, setF] = useState(EMPTY), [m, setM] = useState('');
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const add = async (e) => {
    e.preventDefault();
    const r = await post({ action: 'address_add', ...f });
    if (!r.ok) { setM(r.error); return; }
    setM('Endereço salvo.'); setF(EMPTY); router.refresh();
  };
  const del = async (id) => { await post({ action: 'address_del', id }); router.refresh(); };
  return (
    <div>
      {initial.map((a) => <p key={a.id} className="box">{a.recipient}<br />{a.street}, {a.number} {a.complement} · {a.district}<br />{a.city}/{a.state} · CEP {a.cep} <button className="btn danger sm" style={{ marginLeft: 8 }} onClick={() => del(a.id)}>Remover</button></p>)}
      <form className="f" onSubmit={add} style={{ marginTop: 16 }}>
        <label>Destinatário<input required value={f.recipient} onChange={set('recipient')} /></label>
        <CepField id="cep-conta" value={f.cep} onChange={(v) => setF((x) => ({ ...x, cep: v }))} onAddress={(a) => setF((x) => ({ ...x, ...a }))} />
        <label>Endereço<input required value={f.street} onChange={set('street')} /></label>
        <div className="two"><label>Número<input required value={f.number} onChange={set('number')} /></label><label>Complemento<input value={f.complement} onChange={set('complement')} /></label></div>
        <div className="three"><label>Bairro<input required value={f.district} onChange={set('district')} /></label><label>Cidade<input required value={f.city} onChange={set('city')} /></label><label>UF<input required maxLength={2} value={f.state} onChange={set('state')} /></label></div>
        <button className="btn sm">Adicionar endereço</button><p className="msg" role="status">{m}</p>
      </form>
    </div>
  );
}
