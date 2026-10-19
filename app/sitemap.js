import { getCatalog, getPages } from '@/lib/db';
import { SITE } from '@/lib/format';
export const revalidate = 3600;
export default async function sitemap() {
  const base = SITE(), [{ products, cats }, pages] = await Promise.all([getCatalog(), getPages()]);
  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/loja`, changeFrequency: 'daily', priority: 0.8 },
    ...cats.map((x) => ({ url: `${base}/categoria/${x.slug}`, changeFrequency: 'weekly', priority: 0.8 })),
    ...products.filter((x) => x.status === 'published').map((x) => ({ url: `${base}/produto/${x.slug}`, lastModified: x.updated_at, priority: 0.7 })),
    ...pages.map((x) => ({ url: `${base}/p/${x.slug}`, lastModified: x.updated_at, priority: 0.3 })),
  ];
}
