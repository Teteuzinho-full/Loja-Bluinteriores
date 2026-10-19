import { NextResponse } from 'next/server';
import { verifySession, COOKIE } from '@/lib/session';

// Barreira rápida de rota. A checagem definitiva de papel acontece de novo no servidor (layout e actions).
export async function middleware(req) {
  const p = req.nextUrl.pathname;
  const s = await verifySession(req.cookies.get(COOKIE)?.value);
  const isAdmin = s?.role === 'admin' && s.sub === process.env.ADMIN_EMAIL;
  const go = (to, q = '') => { const u = req.nextUrl.clone(); u.pathname = to; u.search = q; return NextResponse.redirect(u); };
  if (p.startsWith('/admin') && !isAdmin) return go('/acesso-admin');
  if (p.startsWith('/conta') && !s) return go('/entrar', '?next=' + encodeURIComponent(p));
  return NextResponse.next();
}
export const config = { matcher: ['/admin/:path*', '/conta/:path*'] };
