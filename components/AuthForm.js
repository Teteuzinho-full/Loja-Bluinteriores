'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

const T = { login: 'Entrar', signup: 'Criar conta', admin: 'Acesso administrativo' };
const URL_OF = { login: '/api/auth/login', signup: '/api/auth/signup', admin: '/api/auth/admin' };
export default function AuthForm({ mode }) {
  const sp = useSearchParams();
  const next = (() => { const n = sp.get('next') || (mode === 'admin' ? '/admin' : '/conta'); return n.startsWith('/') && !n.startsWith('//') ? n : '/conta'; })();
  const [m, setM] = useState(''), [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setM(''); setBusy(true);
    try {
      const r = await fetch(URL_OF[mode], { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: f.get('name'), email: f.get('email'), password: f.get('password'), terms: f.get('terms') === 'on' }) });
      const j = await r.json();
      if (!r.ok) { setM(j.error || 'Não foi possível concluir.'); setBusy(false); return; }
      window.location.assign(mode === 'admin' ? '/admin' : next); // recarrega para atualizar o estado da sessão
    } catch { setM('Falha de conexão. Tente novamente.'); setBusy(false); }
  };
  return (
    <div className="wrap narrow">
      <h1>{T[mode]}</h1>
      <form className="f" onSubmit={submit} noValidate>
        {mode === 'signup' && <label>Nome<input name="name" required autoComplete="name" /></label>}
        <label>E-mail<input name="email" type="email" required autoComplete="email" /></label>
        <label>Senha<input name="password" type="password" required minLength={mode === 'signup' ? 8 : undefined} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} /></label>
        {mode === 'signup' && <label className="chk"><input name="terms" type="checkbox" required /><span className="small">Li e aceito os <Link href="/p/termos-de-uso">Termos de Uso</Link> e a <Link href="/p/politica-de-privacidade">Política de Privacidade</Link>.</span></label>}
        <button className="btn" disabled={busy}>{busy ? 'Aguarde…' : T[mode]}</button>
        <p className="msg err" role="alert">{m}</p>
      </form>
      <p className="small">
        {mode === 'login' && <><Link href="/recuperar">Esqueci minha senha</Link> · <Link href="/cadastro">Criar conta</Link></>}
        {mode === 'signup' && <>Já tem conta? <Link href="/entrar">Entrar</Link></>}
      </p>
    </div>
  );
}
