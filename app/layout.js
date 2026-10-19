import './globals.css';
import { Cormorant_Garamond, Figtree } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import { StoreProvider } from '@/components/Store';
import { SITE } from '@/lib/format';

const serif = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--serif', display: 'swap' });
const sans = Figtree({ subsets: ['latin'], variable: '--sans', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE()),
  title: { default: 'Blu Interiores — Decoração contemporânea', template: '%s | Blu Interiores' },
  description: 'Mesas de centro, espelhos decorativos, aparadores, mesas laterais e objetos de decoração contemporânea.',
  openGraph: { type: 'website', locale: 'pt_BR', siteName: 'Blu Interiores' },
  alternates: { canonical: '/' },
};
const themeInit = `try{var t=localStorage.getItem('blu_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}`;

export default function RootLayout({ children }) {
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: 'Blu Interiores', url: SITE() },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Blu Interiores', url: SITE(), potentialAction: { '@type': 'SearchAction', target: `${SITE()}/loja?q={q}`, 'query-input': 'required name=q' } },
  ];
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`} suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: themeInit }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /></head>
      <body>
        <StoreProvider>
          <Header />
          <main id="conteudo">{children}</main>
          <Footer />
          <CookieBanner />
        </StoreProvider>
      </body>
    </html>
  );
}
