import { SITE } from '@/lib/format';
export default function robots() {
  return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/conta', '/api', '/carrinho', '/checkout', '/entrar', '/cadastro', '/recuperar', '/redefinir-senha'] }], sitemap: `${SITE()}/sitemap.xml` };
}
