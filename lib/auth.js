import 'server-only';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession, COOKIE } from './session';
import { getUser, pushAdminLog } from './db';

export const publicUser = (u) => ({ id: u.id, email: u.email, full_name: u.name, phone: u.phone || '', marketing_opt_in: !!u.marketing, addresses: u.addresses || [], favs: u.favs || [] });

// Lê a sessão assinada do cookie. Admin: validado contra ADMIN_EMAIL. Cliente: precisa existir no Redis.
export async function getSession() {
  const s = await verifySession(cookies().get(COOKIE)?.value);
  if (!s) return { user: null, role: null, profile: null };
  if (s.role === 'admin') {
    if (!process.env.ADMIN_EMAIL || s.sub !== process.env.ADMIN_EMAIL) return { user: null, role: null, profile: null };
    return { user: { id: 'admin', email: s.sub }, role: 'admin', profile: { full_name: 'Administrador' } };
  }
  const u = await getUser(s.sub);
  if (!u) return { user: null, role: null, profile: null };
  return { user: { id: u.id, email: u.email }, role: 'customer', profile: publicUser(u), record: u };
}
export async function requireUser(next = '/conta') {
  const r = await getSession();
  if (!r.user) redirect('/entrar?next=' + encodeURIComponent(next));
  if (r.role === 'admin') redirect('/admin');
  return r;
}
// Validado no servidor em toda página e action do painel.
export async function requireAdmin() {
  const r = await getSession();
  if (r.role !== 'admin') redirect('/acesso-admin');
  return r;
}
export const logAdmin = (by, action, entity, entityId, details = {}) => pushAdminLog({ by, action, entity, entity_id: entityId ? String(entityId) : null, details, at: new Date().toISOString() });
