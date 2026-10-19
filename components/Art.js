// Ilustração genérica usada quando o produto ainda não tem foto (identificada como ilustrativa).
export default function Art({ cat = '' }) {
  const k = cat.includes('espelho') ? 'e' : cat.includes('aparador') ? 'a' : cat.includes('lateral') ? 'l' : cat.includes('objeto') ? 'o' : 'm';
  const d = { m: <><ellipse cx="50" cy="35" rx="38" ry="10" fill="var(--bg)" /><path d="M20 38v28M80 38v28" /></>, e: <rect x="28" y="6" width="44" height="68" rx="22" fill="var(--bg)" />, a: <><rect x="8" y="26" width="84" height="16" fill="var(--bg)" /><path d="M16 42v28M84 42v28M50 26v16" /></>, l: <><ellipse cx="50" cy="28" rx="22" ry="6" fill="var(--bg)" /><path d="M50 34v36M36 70h28" /></>, o: <path d="M40 10h20c0 14 14 20 14 40a24 24 0 0 1-48 0c0-20 14-26 14-40z" fill="var(--bg)" /> }[k];
  return <svg viewBox="0 0 100 80" fill="none" stroke="var(--blu)" strokeWidth="2" aria-hidden="true">{d}</svg>;
}
