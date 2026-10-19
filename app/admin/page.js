import Link from 'next/link';
import * as db from '@/lib/db';
export default async function Dash() {
  const [prods, cats, orders, news, users] = await Promise.all([db.allProducts(), db.allCategories(), db.allOrders(), db.allNews(), db.allUsers()]);
  const K = ({ n, t }) => <div className="kpi"><b>{n}</b>{t}</div>;
  return (
    <>
      <h1>Visão geral</h1>
      <div className="kpis"><K n={prods.length} t="Produtos" /><K n={prods.filter((p) => p.status === 'published').length} t="Publicados" /><K n={prods.filter((p) => p.status === 'draft').length} t="Rascunhos" /><K n={prods.filter((p) => p.stock <= 3).length} t="Estoque baixo (≤ 3)" /><K n={cats.length} t="Categorias" /><K n={orders.filter((o) => o.is_test).length} t="Pedidos de teste" /><K n={users.length} t="Clientes" /><K n={news.filter((n) => !n.unsubscribed_at).length} t="Inscritos na newsletter" /></div>
      <p className="mute">Sem métricas de receita: pagamentos estão desativados e não há vendas reais.</p>
      <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}><Link className="btn" href="/admin/produtos/novo">Novo produto</Link><Link className="btn o" href="/admin/estoque">Ajustar estoque</Link><Link className="btn o" href="/admin/configuracoes">Configurações</Link></p>
    </>
  );
}
