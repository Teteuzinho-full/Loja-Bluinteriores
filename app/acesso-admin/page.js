import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Acesso administrativo', robots: { index: false, follow: false } };
export default function Page() { return <Suspense><AuthForm mode="admin" /></Suspense>; }
