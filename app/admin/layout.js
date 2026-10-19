import Link from 'next/link';
import { requireAdmin } from '@/lib/auth';
import { LogoutButton } from '@/components/ContaForms';
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Painel administrativo', robots: { index: false, follow: false } };
export default async function AdminLayout({ children }) {
  await requireAdmin(); // redireciona não-admins no servidor
  const links = [['/admin', 'Visão geral'], ['/admin/produtos', 'Produtos'], ['/admin/categorias', 'Categorias'], ['/admin/estoque', 'Estoque'], ['/admin/pedidos', 'Pedidos de teste'], ['/admin/cupons', 'Cupons'], ['/admin/clientes', 'Clientes'], ['/admin/configuracoes', 'Configurações'], ['/admin/paginas', 'Páginas'], ['/admin/newsletter', 'Newsletter']];
  return <div className="wrap adm"><nav aria-label="Administração">{links.map(([h, t]) => <Link key={h} href={h}>{t}</Link>)}<LogoutButton /></nav><div>{children}</div></div>;
}
