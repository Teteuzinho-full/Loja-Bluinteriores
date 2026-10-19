# Blu Interiores — loja (Next.js + Upstash Redis + Vercel Blob)

Sem Supabase. Pensado para o plano gratuito da Vercel. **Pagamentos desativados** por design: não existe rota de cobrança; pedidos são de teste (`is_test`, `payment_status = 'desativado'`).

## Dois acessos
- **Admin** (`/acesso-admin` → `/admin`): e-mail e senha definidos por você nas variáveis `ADMIN_EMAIL` e `ADMIN_PASSWORD` (só no servidor). Sessão de 24 h em cookie assinado. Limite de 5 tentativas por 15 min por IP.
- **Cliente** (`/cadastro`, `/entrar`, `/conta`): cadastro próprio; senha guardada com hash scrypt; cada cliente só vê a própria conta, pedidos e favoritos. Cliente não entra em `/admin` (checado no middleware, no layout e em cada action).

## Publicar na Vercel
1. Suba esta pasta para um repositório no GitHub e importe na Vercel (Framework: Next.js).
2. Na aba **Storage** do projeto, crie **Upstash Redis** (Marketplace, plano Free) e **Blob**, e conecte ao projeto. As variáveis `KV_REST_API_URL`, `KV_REST_API_TOKEN` e `BLOB_READ_WRITE_TOKEN` são criadas sozinhas.
3. Em **Settings > Environment Variables** cadastre: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (senha longa), `SESSION_SECRET` (gere com `openssl rand -base64 32`) e `NEXT_PUBLIC_SITE_URL` (URL final).
4. Faça o deploy (ou Redeploy depois de cadastrar as variáveis). Na primeira visita, o catálogo de **100 produtos de demonstração** é criado sozinho no Redis.
5. Entre em `/acesso-admin`.

Local: `cp .env.example .env.local`, `npm install`, `npm run dev`. Sem Redis configurado o projeto usa memória (funciona, mas some ao reiniciar). Sem `BLOB_READ_WRITE_TOKEN` o upload de imagens fica indisponível.

## Limites do plano gratuito (confira os valores atuais)
- A Vercel **Hobby é restrita a uso pessoal/não comercial**: para vender de verdade será preciso o plano Pro.
- Upstash Free tem cota mensal de comandos. As leituras públicas usam cache (5 min, invalidado ao salvar no admin), o que poupa comandos.
- Vercel Blob (Hobby) tem cota de armazenamento e transferência. Imagens até 4 MB (limite de corpo das funções).

## O que existe
Loja: home, departamentos/subcategorias, catálogo com filtros reais, ordenação, paginação, busca sem acentos com sugestões, produto com URL própria e SEO (metadata, canonical, sitemap, robots, JSON-LD), frete por CEP (regras configuráveis, estimativa interna), ViaCEP, carrinho persistente com valores recalculados no servidor, cupons, checkout de demonstração, tema claro/escuro, newsletter com consentimento, cookies com consentimento para GA4.
Conta: cadastro, login, dados, troca de senha, endereços, pedidos de teste, favoritos.
Admin: produtos (CRUD, publicar, imagens com upload/ordem/principal/alt), categorias e subcategorias, estoque com histórico, pedidos de teste, cupons, clientes (redefinir senha), banner/aviso/loja/frete, páginas institucionais, newsletter.

## Pendências conhecidas
- **Recuperação de senha por e-mail**: sem provedor de e-mail. O admin redefine a senha do cliente em `/admin/clientes`.
- Pagamentos (Mercado Pago/PIX/cartão): fora do escopo, por exigência.
- Fotos: o catálogo demo não traz imagens (sem fonte licenciada); envie pelo admin. Sem foto, a loja mostra uma ilustração identificada.
- Frete real: substituir `lib/shipping.js`. As regras iniciais são fictícias.
- Coleções, artigos e avaliações: não implementados. Nenhum e-mail (newsletter ou transacional) é enviado.
- Concorrência: ajuste de estoque usa leitura+escrita simples (ok para um operador).
- Textos legais com `[a preencher]`; revisar com assessoria jurídica.
- Sem testes automatizados e sem medição de Core Web Vitals.
- Trocar de armazenamento no futuro: reescreva só `lib/db.js`.
