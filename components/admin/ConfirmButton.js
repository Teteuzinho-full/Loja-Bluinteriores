'use client';
export default function ConfirmButton({ children, msg = 'Tem certeza?', className = 'btn danger sm' }) {
  return <button className={className} onClick={(e) => { if (!confirm(msg)) e.preventDefault(); }}>{children}</button>;
}
