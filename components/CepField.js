'use client';
import { useEffect, useRef, useState } from 'react';
import { maskCep, digits } from '@/lib/format';

// Máscara, debounce, cancelamento da consulta anterior, tratamento de CEP inexistente e falha de rede.
// Nunca bloqueia o formulário: o usuário pode preencher manualmente.
export default function CepField({ value, onChange, onAddress, label = 'CEP', id = 'cep' }) {
  const [st, setSt] = useState({ k: '', t: '' });
  const ab = useRef(), tm = useRef();
  useEffect(() => () => { clearTimeout(tm.current); ab.current?.abort(); }, []);
  const handle = (e) => {
    const v = maskCep(e.target.value), d = digits(v);
    onChange(v);
    clearTimeout(tm.current); ab.current?.abort();
    if (d.length < 8) { setSt({ k: '', t: '' }); return; }
    setSt({ k: '', t: 'Consultando endereço…' });
    tm.current = setTimeout(async () => {
      ab.current = new AbortController();
      try {
        const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: ab.current.signal });
        if (!r.ok) throw new Error('http');
        const j = await r.json();
        if (j.erro) { setSt({ k: 'err', t: 'CEP não encontrado. Confira os números ou preencha o endereço manualmente.' }); return; }
        onAddress?.({ street: j.logradouro || '', district: j.bairro || '', city: j.localidade || '', state: j.uf || '' });
        setSt({ k: 'ok', t: [j.logradouro, j.bairro, `${j.localidade}/${j.uf}`].filter(Boolean).join(', ') });
      } catch (err) {
        if (err.name !== 'AbortError') setSt({ k: 'err', t: 'Não foi possível consultar o endereço agora. Preencha manualmente.' });
      }
    }, 400);
  };
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} name="cep" inputMode="numeric" autoComplete="postal-code" placeholder="00000-000" maxLength={9} value={value} onChange={handle} style={{ width: '100%', minHeight: 44, border: '1px solid var(--line)', background: 'var(--surf)', padding: '8px 12px' }} />
      <p className={'msg ' + st.k} aria-live="polite">{st.t}</p>
    </div>
  );
}
