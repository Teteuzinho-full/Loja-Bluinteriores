import Link from 'next/link';
import { getSettings } from '@/lib/settings';
import NewsletterForm from './NewsletterForm';
export default async function Footer() {
  const s = await getSettings();
  const st = s.store;
  return (
    <>
      <section className="sec"><div className="wrap" style={{ maxWidth: 560 }}><h2>Receba novidades da Blu</h2><NewsletterForm /></div></section>
      <footer className="ftr"><div className="wrap fg">
        <div><div className="logo">{st.name}</div><p>Decoração contemporânea para ambientes com personalidade.</p><p className="small">{st.cnpj} · {st.address}</p>{st.email && <p className="small">{st.email}</p>}</div>
        <div><h4>Loja</h4><Link href="/loja">Todas as peças</Link><Link href="/loja?ord=novidades">Novidades</Link><Link href="/loja?oferta=1">Ofertas</Link></div>
        <div><h4>Atendimento</h4><Link href="/p/contato">Contato</Link><Link href="/p/politica-de-entrega">Entrega</Link><Link href="/p/trocas-e-devolucoes">Trocas e devoluções</Link><Link href="/p/ajuda">Ajuda</Link></div>
        <div><h4>Institucional</h4><Link href="/p/sobre">Sobre a Blu</Link><Link href="/p/politica-de-privacidade">Política de privacidade</Link><Link href="/p/termos-de-uso">Termos de uso</Link>{st.instagram && <a href={st.instagram} rel="noopener noreferrer">Instagram</a>}</div>
      </div></footer>
    </>
  );
}
