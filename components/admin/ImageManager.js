'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setPrimaryImage, setImageAlt, moveImage, deleteImage } from '@/app/admin/actions';

const OK = ['image/jpeg', 'image/png', 'image/webp'];
// Upload enviado ao servidor (valida admin) e gravado no Vercel Blob. Um arquivo por requisição (limite de ~4,5 MB da Vercel).
export default function ImageManager({ productId, images }) {
  const router = useRouter();
  const [m, setM] = useState(''), [busy, setBusy] = useState(false);
  const upload = async (e) => {
    const files = [...e.target.files]; setM(''); setBusy(true);
    for (const f of files) {
      if (!OK.includes(f.type)) { setM('Use apenas JPG, PNG ou WebP.'); break; }
      if (f.size > 4 * 1024 * 1024) { setM('Cada imagem deve ter até 4 MB.'); break; }
      const fd = new FormData(); fd.set('productId', productId); fd.set('file', f);
      try { const r = await fetch('/api/admin/upload', { method: 'POST', body: fd }); const j = await r.json(); if (!r.ok) { setM(j.error || 'Falha no upload.'); break; } } catch { setM('Falha de conexão.'); break; }
    }
    setBusy(false); e.target.value = ''; router.refresh();
  };
  const run = async (fn) => { await fn(); router.refresh(); };
  return (
    <div>
      <div className="imgs">
        {images.map((im, i) => (
          <figure key={im.id}>
            <img src={im.url} alt={im.alt || ''} />
            <label className="small">Texto alternativo<input defaultValue={im.alt} onBlur={(e) => e.target.value !== im.alt && setImageAlt(productId, im.id, e.target.value)} style={{ width: '100%', border: '1px solid var(--line)', padding: 4 }} /></label>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 4 }}>
              <button type="button" className="btn o sm" onClick={() => run(() => setPrimaryImage(productId, im.id))} disabled={im.is_primary}>{im.is_primary ? 'Principal' : 'Tornar principal'}</button>
              <button type="button" className="btn o sm" aria-label="Mover para antes" disabled={i === 0} onClick={() => run(() => moveImage(productId, im.id, -1))}>←</button>
              <button type="button" className="btn o sm" aria-label="Mover para depois" disabled={i === images.length - 1} onClick={() => run(() => moveImage(productId, im.id, 1))}>→</button>
              <button type="button" className="btn danger sm" onClick={() => confirm('Remover imagem?') && run(() => deleteImage(productId, im.id))}>Remover</button>
            </div>
          </figure>
        ))}
      </div>
      <label className="btn o sm" style={{ cursor: 'pointer' }}>{busy ? 'Enviando…' : 'Enviar imagens'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={upload} className="sr" /></label>
      <p className="msg err" role="alert">{m}</p>
    </div>
  );
}
