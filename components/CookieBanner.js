'use client';
import { useEffect, useState } from 'react';
import Script from 'next/script';
const GA = process.env.NEXT_PUBLIC_GA_ID;
export default function CookieBanner() {
  const [c, setC] = useState(null);
  const [open, setOpen] = useState(false);
  useEffect(() => { try { const v = localStorage.getItem('blu_consent'); setC(v); setOpen(!v && !!GA); } catch {} }, []);
  const set = (v) => { try { localStorage.setItem('blu_consent', v); } catch {} setC(v); setOpen(false); };
  return (
    <>
      {GA && c === 'all' && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA}`} strategy="afterInteractive" />
          <Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA}',{anonymize_ip:true});`}</Script>
        </>
      )}
      {GA && !open && <button className="btn o sm" style={{ position: 'fixed', left: 12, bottom: 12, zIndex: 40, background: 'var(--bg)' }} onClick={() => setOpen(true)}>Cookies</button>}
      {open && (
        <div className="cookie" role="dialog" aria-label="Preferências de cookies">
          <strong>Cookies e privacidade</strong>
          <p style={{ margin: '6px 0 0' }}>Usamos cookies essenciais para o funcionamento da loja. Cookies de análise (Google Analytics) só são ativados com o seu consentimento.</p>
          <div className="acts"><button className="btn sm" onClick={() => set('all')}>Aceitar análise</button><button className="btn o sm" onClick={() => set('essential')}>Somente essenciais</button></div>
        </div>
      )}
    </>
  );
}
