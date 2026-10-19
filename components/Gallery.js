'use client';
import { useState } from 'react';
import Art from './Art';
export default function Gallery({ images, name, cat, demo }) {
  const [i, setI] = useState(0);
  const im = images[i];
  return (
    <div>
      <div className="ph" style={{ aspectRatio: '1' }}>
        {im ? <a href={im.url} target="_blank" rel="noopener noreferrer" aria-label="Ampliar imagem em nova aba"><img src={im.url} alt={im.alt || name} width="800" height="800" style={{ width: '100%', height: '100%', objectFit: 'cover' }} fetchPriority="high" /></a> : <Art cat={cat} />}
        {(!im || demo) && <span className="tag">{!im ? 'Imagem ilustrativa' : 'Demonstrativo'}</span>}
      </div>
      {images.length > 1 && <div className="thumbs">{images.map((x, n) => <button key={x.id} aria-current={n === i} aria-label={`Ver imagem ${n + 1}`} onClick={() => setI(n)}><img src={x.url} alt="" loading="lazy" /></button>)}</div>}
    </div>
  );
}
