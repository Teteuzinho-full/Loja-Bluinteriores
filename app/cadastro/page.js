import { Suspense } from 'react';
import AuthForm from '@/components/AuthForm';
export const metadata = { title: 'Criar conta', robots: { index: false } };
export default function Page() { return <Suspense><AuthForm mode="signup" /></Suspense>; }
