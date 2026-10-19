import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function GET() {
  const s = await getSession();
  if (!s.user) return NextResponse.json({ user: null, favs: [] });
  return NextResponse.json({ user: { email: s.user.email, role: s.role }, favs: s.profile?.favs || [] });
}
