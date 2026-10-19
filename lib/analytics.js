// Eventos GA4 só disparam se houver consentimento e NEXT_PUBLIC_GA_ID. Não existe evento "purchase" (pagamentos desativados).
export function track(name, params = {}) {
  try { if (typeof window !== 'undefined' && window.gtag) window.gtag('event', name, { currency: 'BRL', ...params }); } catch {}
}
