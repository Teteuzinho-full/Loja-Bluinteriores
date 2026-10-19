import { settingsFresh } from '@/lib/db';
import { DEFAULTS } from '@/lib/settings';
import { saveSetting } from '../actions';
export const dynamic = 'force-dynamic';
export default async function Page({ searchParams: sp }) {
  const raw = await settingsFresh(), s = {};
  Object.keys(DEFAULTS).forEach((k) => { s[k] = { ...DEFAULTS[k], ...(raw[k] || {}) }; });
  const T = ({ n, l, v }) => <label>{l}<input name={n} defaultValue={v ?? ''} /></label>;
  return (
    <>
      <h1>Configurações</h1>{sp.ok && <p className="msg ok" role="status">Configuração salva.</p>}{sp.erro && <p className="msg err" role="alert">{sp.erro}</p>}
      <h2 style={{ fontSize: 24 }}>Barra de aviso</h2>
      <form className="f box" action={saveSetting}><input type="hidden" name="key" value="notice" /><T n="text" l="Texto" v={s.notice.text} /><T n="href" l="Link (opcional)" v={s.notice.href} /><label className="chk"><input type="checkbox" name="active" defaultChecked={s.notice.active} /><span>Exibir barra</span></label><button className="btn sm">Salvar</button></form>
      <h2 style={{ fontSize: 24 }}>Banner da página inicial</h2>
      <form className="f box" action={saveSetting}><input type="hidden" name="key" value="home" /><T n="title" l="Título" v={s.home.title} /><T n="subtitle" l="Subtítulo" v={s.home.subtitle} /><div className="two"><T n="cta_label" l="Texto do botão" v={s.home.cta_label} /><T n="cta_href" l="Destino do botão" v={s.home.cta_href} /></div><T n="image_url" l="URL da imagem (envie em um produto e copie, ou use sua CDN)" v={s.home.image_url} /><button className="btn sm">Salvar</button></form>
      <h2 style={{ fontSize: 24 }}>Loja e institucional</h2>
      <form className="f box" action={saveSetting}><input type="hidden" name="key" value="store" /><div className="two"><T n="name" l="Nome da loja" v={s.store.name} /><T n="email" l="E-mail de atendimento" v={s.store.email} /></div><div className="two"><T n="cnpj" l="CNPJ" v={s.store.cnpj} /><T n="phone" l="Telefone" v={s.store.phone} /></div><T n="address" l="Endereço oficial" v={s.store.address} /><div className="two"><T n="instagram" l="URL do Instagram" v={s.store.instagram} /><T n="facebook" l="URL do Facebook" v={s.store.facebook} /></div><button className="btn sm">Salvar</button></form>
      <h2 style={{ fontSize: 24 }}>Frete (regras configuráveis)</h2>
      <form className="f box" action={saveSetting}><input type="hidden" name="key" value="shipping" /><T n="origin_cep" l="CEP de origem" v={s.shipping.origin_cep} /><label className="chk"><input type="checkbox" name="test_rules" defaultChecked={s.shipping.test_rules} /><span>Regras de teste (valores fictícios)</span></label>
        <label>Regras (JSON): cep_from, cep_to (números de 8 dígitos), base, per_kg, days_min, days_max, label<textarea name="rules" rows={10} defaultValue={JSON.stringify(s.shipping.rules, null, 2)} style={{ fontFamily: 'monospace' }} /></label><p className="small mute">Valores são estimativas internas, não cotação de transportadora.</p><button className="btn sm">Salvar regras</button></form>
    </>
  );
}
