'use client';
import { useState } from 'react';
export default function NewsletterForm() {
  const [m, setM] = useState({ t: '', k: '' });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    setBusy(true); setM({ t: '', k: '' });
    try {
      const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: f.get('email'), consent: f.get('consent') === 'on' }) });
      const j = await r.json();
      setM({ t: j.error || j.message, k: r.ok ? 'ok' : 'err' });
      if (r.ok) e.target.reset();
    } catch { setM({ t: 'Falha de conexão. Tente novamente.', k: 'err' }); }
    setBusy(false);
  };
  return (
    <form className="f" onSubmit={submit} noValidate>
      <label>E-mail<input name="email" type="email" autoComplete="email" required placeholder="seu@email.com.br" /></label>
      <label className="chk"><input name="consent" type="checkbox" required /><span className="small mute">Concordo em receber comunicações da Blu Interiores por e-mail e aceito a Política de Privacidade. Posso cancelar a qualquer momento.</span></label>
      <button className="btn" disabled={busy}>{busy ? 'Enviando…' : 'Quero receber'}</button>
      <p className={'msg ' + m.k} role="status">{m.t}</p>
    </form>
  );
}
