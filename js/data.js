/* Low Wear — catálogo Brasil (dados do site) */
(() => {
  const TEAMS = [
    {
      slug: 'selecao', name: 'Seleção Brasileira', short: 'Seleção', country: 'BR',
      main: '#f6d21e', trim: '#0b3d2e',
      tagline: 'Seleção Brasileira — Vista o penta',
      text: 'Modelos escolhidos para quem canta o hino antes de qualquer jogo e leva o Brasil para onde for.',
    },
    {
      slug: 'flamengo', name: 'Flamengo', short: 'Mengão', country: 'BR',
      main: '#a2110a', trim: '#121212',
      tagline: 'Flamengo — Vista o rubro-negro',
      text: 'Modelos escolhidos para quem leva o Flamengo no peito, no estádio e na rua.',
    },
    {
      slug: 'corinthians', name: 'Corinthians', short: 'Timão', country: 'BR',
      main: '#f4f3ec', trim: '#121212',
      tagline: 'Corinthians — Vista o Timão',
      text: 'Modelos para a Fiel que enche estádios e não abre mão das suas cores.',
    },
    {
      slug: 'sao-paulo', name: 'São Paulo', short: 'Tricolor', country: 'BR',
      main: '#f4f3ec', trim: '#a2110a',
      tagline: 'São Paulo — Vista o Tricolor',
      text: 'Modelos para quem carrega a tradição do Morumbi em cada detalhe.',
    },
    {
      slug: 'palmeiras', name: 'Palmeiras', short: 'Verdão', country: 'BR',
      main: '#0b6e2c', trim: '#f4f3ec',
      tagline: 'Palmeiras — Vista o Verdão',
      text: 'Modelos para a maior torcida do alviverde, dentro e fora da Academia.',
    },
    {
      slug: 'santos', name: 'Santos', short: 'Peixe', country: 'BR',
      main: '#f4f3ec', trim: '#121212',
      tagline: 'Santos — Vista o Peixe',
      text: 'Modelos para quem carrega o legado do Rei do Futebol na Vila Belmiro.',
    },
    {
      slug: 'cruzeiro', name: 'Cruzeiro', short: 'Raposa', country: 'BR',
      main: '#0b3da0', trim: '#f4f3ec',
      tagline: 'Cruzeiro — Vista a Raposa',
      text: 'Modelos para a Cabulosa que nunca deixou de acreditar.',
    },
    // Futebol português — secção adicional, à parte do catálogo brasileiro.
    // country:'PT' marca as equipas mostradas na secção "Futebol Português"
    // da homepage (ver #futebol-portugues em index.html / renderPortugalSection
    // em main.js): basta dar este country a uma nova equipa (Benfica, Sporting,
    // Porto…) e ela aparece lá automaticamente, sem tocar em mais nada.
    {
      slug: 'selecao-portugal', name: 'Seleção Portugal', short: 'Seleção PT', country: 'PT',
      main: '#7fd9c4', trim: '#0b4a41',
      tagline: 'Seleção Portugal — Vista as quinas',
      text: 'Modelos para quem veste as cores de Portugal com orgulho, dentro e fora do estádio.',
    },
    {
      slug: 'benfica', name: 'Benfica', short: 'Águias', country: 'PT',
      main: '#d4001f', trim: '#f4f3ec',
      tagline: 'Benfica — Vista as Águias',
      text: 'Modelos para quem veste o encarnado do Benfica com orgulho, na Luz e por todo o país.',
    },
    {
      slug: 'sporting', name: 'Sporting', short: 'Leões', country: 'PT',
      main: '#0d5c34', trim: '#f4f3ec',
      tagline: 'Sporting — Vista os Leões',
      text: 'Modelos para quem carrega o verde e branco do Sporting para todo o lado.',
    },
    {
      slug: 'porto', name: 'FC Porto', short: 'Dragões', country: 'PT',
      main: '#0b3d91', trim: '#f4f3ec',
      tagline: 'FC Porto — Vista os Dragões',
      text: 'Modelos para quem veste o azul e branco do FC Porto com paixão.',
    },
  ];

  const TYPE_LABEL = {
    principal: 'Camisa Principal',
    alternativa: 'Camisa Alternativa',
    extra: 'Camisa Extra',
    retro: 'Camisa Retro',
    especial: 'Edição Especial',
  };

  const P = (id, teamSlug, type, name, season, price, sizes, tag, availability, main, trim, opts) => {
    opts = opts || {};
    return {
      id, teamSlug, type, name, season, price, was: opts.was || null,
      sizes, tag: tag || null, availability: availability || 'disponivel', main, trim,
      photos: opts.photos || null,
      // Vista 360°: para ativar, preencher com os caminhos das fotos rodadas, por ordem.
      // Convenção de pasta sugerida: img/spin/<id>/01.jpg … 24.jpg (24 a 36 fotos, ângulos iguais).
      spin: opts.spin || null,
    };
  };

  const PRODUCTS = [
    // Seleção Brasileira
    P('sel-principal-24', 'selecao', 'principal', 'Amarelinha da Copa', '2024', 59.9, ['S','M','L'], 'Novo', 'disponivel', '#f6d21e', '#0b3d2e',
      { photos: ['img/products/sel-principal-24/01-frente-ia.jpg', 'img/products/sel-principal-24/02-tres-quartos-ia.jpg', 'img/products/sel-principal-24/03-detalhe-ia.jpg', 'img/products/sel-principal-24/04-no-corpo-ia.jpg'],
        spin: ['img/spin/selecao-principal/01.png', 'img/spin/selecao-principal/02.png', 'img/spin/selecao-principal/03.png', 'img/spin/selecao-principal/04.png', 'img/spin/selecao-principal/05.png', 'img/spin/selecao-principal/06.png', 'img/spin/selecao-principal/07.png', 'img/spin/selecao-principal/08.png', 'img/spin/selecao-principal/09.png', 'img/spin/selecao-principal/10.png'] }),
    P('sel-alt-24', 'selecao', 'alternativa', 'Azul da Copa', '2024', 54.9, ['S','M','L'], 'Mais vendido', 'disponivel', '#0b3da0', '#f6d21e',
      { photos: ['img/products/sel-alt-24/01-frente.jpg', 'img/products/sel-alt-24/02-tres-quartos.jpg', 'img/products/sel-alt-24/03-detalhe.jpg', 'img/products/sel-alt-24/04-no-corpo.jpg'],
        spin: Array.from({length: 21}, (_, i) => `img/spin/selecao-alt/${String(i + 1).padStart(2, '0')}.png`) }),
    P('sel-especial-24', 'selecao', 'especial', 'Amarelinha Classica', '2024', 59.9, ['S','M','L'], 'Edição especial', 'disponivel', '#f6d21e', '#0b3d2e',
      { photos: ['img/products/sel-especial-24/01-frente.jpg', 'img/products/sel-especial-24/02-tres-quartos.jpg', 'img/products/sel-especial-24/03-detalhe.jpg', 'img/products/sel-especial-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/selecao-especial/${String(i + 1).padStart(2, '0')}.png`) }),

    // Flamengo
    P('fla-principal-24', 'flamengo', 'principal', 'Manto Rubro-Negro', '2024', 59.9, ['S','M','L'], 'Novo', 'disponivel', '#a2110a', '#121212',
      { photos: ['img/products/fla-principal-24/01-frente.jpg', 'img/products/fla-principal-24/02-tres-quartos.jpg', 'img/products/fla-principal-24/03-detalhe.jpg', 'img/products/fla-principal-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/flamengo-principal/${String(i + 1).padStart(2, '0')}.png`) }),
    P('fla-alt-24', 'flamengo', 'alternativa', 'Manto Rubro-Negro Branco', '2024', 54.9, ['S','M','L'], 'Mais vendido', 'disponivel', '#f4f3ec', '#a2110a',
      { photos: ['img/products/fla-alt-24/01-frente.jpg', 'img/products/fla-alt-24/02-tres-quartos.jpg', 'img/products/fla-alt-24/03-detalhe.jpg', 'img/products/fla-alt-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/flamengo-alt/${String(i + 1).padStart(2, '0')}.png`) }),
    P('fla-extra-24', 'flamengo', 'extra', 'Manto Rubro-Negro diferenciado', '2024', 59.9, ['S','M','L'], null, 'disponivel', '#f4f3ec', '#a2110a',
      { photos: ['img/products/fla-extra-24/01-frente.jpg', 'img/products/fla-extra-24/02-tres-quartos.jpg', 'img/products/fla-extra-24/03-detalhe.jpg', 'img/products/fla-extra-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/flamengo-extra/${String(i + 1).padStart(2, '0')}.png`) }),

    // Corinthians
    P('cor-principal-24', 'corinthians', 'principal', 'Fiel Alvinegra', '2024', 59.9, ['S','M','L'], 'Novo', 'disponivel', '#f4f3ec', '#121212',
      { photos: ['img/products/cor-principal-24/01-frente.jpg', 'img/products/cor-principal-24/02-tres-quartos.jpg', 'img/products/cor-principal-24/03-detalhe.jpg', 'img/products/cor-principal-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/corinthians-principal/${String(i + 1).padStart(2, '0')}.png`) }),
    P('cor-extra-24', 'corinthians', 'extra', 'Fiel Alvinegra diferenciada', '2024', 54.9, ['S','M','L'], 'Edição especial', 'disponivel', '#f4f3ec', '#121212',
      { photos: ['img/products/cor-extra-24/01-frente.jpg', 'img/products/cor-extra-24/02-tres-quartos.jpg', 'img/products/cor-extra-24/03-detalhe.jpg', 'img/products/cor-extra-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/corinthians-extra/${String(i + 1).padStart(2, '0')}.png`) }),

    // São Paulo
    P('sao-principal-24', 'sao-paulo', 'principal', 'Soberana Tricolor New Balance', '2024', 69.9, ['S','M','L'], 'Novo', 'disponivel', '#f4f3ec', '#a2110a',
      { photos: ['img/products/sao-principal-24/01-frente.jpg', 'img/products/sao-principal-24/02-tres-quartos.jpg', 'img/products/sao-principal-24/03-detalhe.jpg', 'img/products/sao-principal-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/sao-paulo-principal/${String(i + 1).padStart(2, '0')}.png`) }),
    P('sao-retro', 'sao-paulo', 'retro', 'Soberana Tricolor', '2019', 59.9, ['M','L'], 'Retro', 'disponivel', '#f4f3ec', '#a2110a',
      { photos: ['img/products/sao-retro/01-frente.jpg', 'img/products/sao-retro/02-tres-quartos.jpg', 'img/products/sao-retro/03-detalhe.jpg', 'img/products/sao-retro/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/sao-paulo-retro/${String(i + 1).padStart(2, '0')}.png`) }),

    // Palmeiras
    P('pal-principal-24', 'palmeiras', 'principal', 'Verdão Classico', '2024', 59.9, ['S','M','L'], 'Mais vendido', 'disponivel', '#0b6e2c', '#f4f3ec',
      { photos: ['img/products/pal-principal-24/01-frente.jpg', 'img/products/pal-principal-24/02-tres-quartos.jpg', 'img/products/pal-principal-24/03-detalhe.jpg', 'img/products/pal-principal-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/palmeiras-principal/${String(i + 1).padStart(2, '0')}.png`) }),
    P('pal-retro', 'palmeiras', 'retro', 'Verdão Retro', '2019', 59.9, ['M','L'], 'Retro', 'disponivel', '#0b6e2c', '#f4f3ec',
      { photos: ['img/products/pal-retro/01-frente.jpg', 'img/products/pal-retro/02-tres-quartos.jpg', 'img/products/pal-retro/03-detalhe.jpg', 'img/products/pal-retro/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/palmeiras-retro-360/${String(i + 1).padStart(2, '0')}.png`) }),

    // Santos
    P('santos-principal-24', 'santos', 'principal', 'Peixe Classico', '2024', 59.9, ['S','M','L'], 'Novo', 'disponivel', '#f4f3ec', '#121212',
      { photos: ['img/products/santos-principal-24/01-frente.jpg', 'img/products/santos-principal-24/02-tres-quartos.jpg', 'img/products/santos-principal-24/03-detalhe.jpg', 'img/products/santos-principal-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/santos-principal/${String(i + 1).padStart(2, '0')}.png`) }),
    P('santos-extra-24', 'santos', 'extra', 'Peixe Diferenciado', '2024', 49.9, ['S','M','L'], null, 'disponivel', '#121212', '#f4f3ec',
      { photos: ['img/products/santos-extra-24/01-frente.jpg', 'img/products/santos-extra-24/02-tres-quartos.jpg', 'img/products/santos-extra-24/03-detalhe.jpg', 'img/products/santos-extra-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/santos-extra/${String(i + 1).padStart(2, '0')}.png`) }),

    // Cruzeiro
    P('cru-principal-24', 'cruzeiro', 'principal', 'Manto Celeste Azul', '2024', 49.9, ['S','M','L'], 'Novo', 'disponivel', '#0b3da0', '#f4f3ec',
      { photos: ['img/products/cru-principal-24/01-frente.jpg', 'img/products/cru-principal-24/02-tres-quartos.jpg', 'img/products/cru-principal-24/03-detalhe.jpg', 'img/products/cru-principal-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/cruzeiro-principal/${String(i + 1).padStart(2, '0')}.png`) }),
    P('cru-alt-24', 'cruzeiro', 'alternativa', 'Manto Celeste Branco', '2024', 54.9, ['S','M','L'], 'Mais vendido', 'disponivel', '#f4f3ec', '#0b3da0',
      { photos: ['img/products/cru-alt-24/01-frente.jpg', 'img/products/cru-alt-24/02-tres-quartos.jpg', 'img/products/cru-alt-24/03-detalhe.jpg', 'img/products/cru-alt-24/04-no-corpo.jpg'],
        spin: Array.from({length: 24}, (_, i) => `img/spin/cruzeiro-alt/${String(i + 1).padStart(2, '0')}.png`) }),

    // Seleção Portugal
    P('por-alt-24', 'selecao-portugal', 'alternativa', 'Azul de Portugal', '2024', 49.9, ['S','M','L'], 'Novo', 'disponivel', '#7fd9c4', '#0b4a41',
      { photos: ['img/products/por-alt-24/01-frente.jpg', 'img/products/por-alt-24/02-tres-quartos.jpg', 'img/products/por-alt-24/03-detalhe.jpg', 'img/products/por-alt-24/04-no-corpo.jpg'] }),
    P('por-principal-24', 'selecao-portugal', 'principal', 'Vermelha de Portugal', '2024', 52.9, ['S','M','L'], 'Novo', 'disponivel', '#a01414', '#f4f3ec',
      { photos: ['img/products/por-principal-24/01-frente.jpg', 'img/products/por-principal-24/02-tres-quartos.jpg', 'img/products/por-principal-24/03-detalhe.jpg', 'img/products/por-principal-24/04-no-corpo.jpg'] }),

    // Benfica
    P('ben-principal-24', 'benfica', 'principal', 'Classica do Benfica', '2024', 49.9, ['S','M','L'], 'Novo', 'disponivel', '#d4001f', '#f4f3ec',
      { photos: ['img/products/ben-principal-24/01-frente.jpg', 'img/products/ben-principal-24/02-tres-quartos.jpg', 'img/products/ben-principal-24/03-detalhe.jpg', 'img/products/ben-principal-24/04-no-corpo.jpg'] }),
    P('ben-extra-24', 'benfica', 'extra', 'Diferenciada do Benfica', '2024', 50.9, ['S','M','L'], null, 'disponivel', '#f4f3ec', '#d4001f',
      { photos: ['img/products/ben-extra-24/01-frente.jpg', 'img/products/ben-extra-24/02-tres-quartos.jpg', 'img/products/ben-extra-24/03-detalhe.jpg', 'img/products/ben-extra-24/04-no-corpo.jpg'] }),

    // Sporting
    P('spo-principal-24', 'sporting', 'principal', 'Classica do Sporting', '2024', 53.9, ['S','M','L'], 'Novo', 'disponivel', '#0d5c34', '#f4f3ec',
      { photos: ['img/products/spo-principal-24/01-frente.jpg', 'img/products/spo-principal-24/02-tres-quartos.jpg', 'img/products/spo-principal-24/03-detalhe.jpg', 'img/products/spo-principal-24/04-no-corpo.jpg'] }),
    P('spo-alt-24', 'sporting', 'alternativa', 'Branca do Sporting', '2024', 53.9, ['S','M','L'], null, 'disponivel', '#f4f3ec', '#0d5c34',
      { photos: ['img/products/spo-alt-24/01-frente.jpg', 'img/products/spo-alt-24/02-tres-quartos.jpg', 'img/products/spo-alt-24/03-detalhe.jpg', 'img/products/spo-alt-24/04-no-corpo.jpg'] }),

    // FC Porto
    P('fcp-principal-24', 'porto', 'principal', 'Classica do Porto', '2024', 52.9, ['S','M','L'], 'Novo', 'disponivel', '#0b3d91', '#f4f3ec',
      { photos: ['img/products/fcp-principal-24/01-frente.jpg', 'img/products/fcp-principal-24/02-tres-quartos.jpg', 'img/products/fcp-principal-24/03-detalhe.jpg', 'img/products/fcp-principal-24/04-no-corpo.jpg'] }),
    P('fcp-extra-24', 'porto', 'extra', 'Diferenciada do Porto', '2024', 49.9, ['S','M','L'], null, 'disponivel', '#f4f3ec', '#0b3d91',
      { photos: ['img/products/fcp-extra-24/01-frente.jpg', 'img/products/fcp-extra-24/02-tres-quartos.jpg', 'img/products/fcp-extra-24/03-detalhe.jpg', 'img/products/fcp-extra-24/04-no-corpo.jpg'] }),
  ];

  // "Camisa mais procurada" — escolha automática que muda uma vez por
  // semana. A semana ISO (ano+número da semana) alimenta um hash simples,
  // por isso o produto escolhido parece aleatório mas é o MESMO para toda
  // a gente durante a semana toda, e muda sozinho na semana seguinte sem
  // precisar de intervenção manual.
  function isoWeekKey(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const week = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    return d.getUTCFullYear() * 100 + week;
  }
  function weeklyFeaturedProduct() {
    if (!PRODUCTS.length) return null;
    let h = isoWeekKey(new Date());
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h = (h ^ (h >>> 16)) >>> 0;
    return PRODUCTS[h % PRODUCTS.length];
  }

  function euro(n) {
    return n.toLocaleString('pt-PT', { style: 'currency', currency: 'EUR' });
  }

  function getTeam(slug) { return TEAMS.find(t => t.slug === slug) || null; }
  function getProduct(id) { return PRODUCTS.find(p => p.id === id) || null; }
  function getProductsByTeam(slug) { return PRODUCTS.filter(p => p.teamSlug === slug); }
  function fullName(p) {
    const team = getTeam(p.teamSlug);
    return `${team ? team.name : ''} — ${p.name}`;
  }

  function jerseySVG(main, trim, collarBg) {
    collarBg = collarBg || '#0b0c0a';
    return `<svg viewBox="0 0 240 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 18 L94 4 Q120 24 146 4 L180 18 L214 54 L190 90 L172 74 L172 236 Q120 252 68 236 L68 74 L50 90 L26 54 Z" fill="${main}"/>
      <path d="M60 18 L94 4 L100 16 L67 32 Z" fill="${trim}"/>
      <path d="M180 18 L146 4 L140 16 L173 32 Z" fill="${trim}"/>
      <path d="M94 4 Q120 24 146 4 L146 16 Q120 34 94 16 Z" fill="${collarBg}"/>
      <rect x="190" y="68" width="24" height="16" rx="2" fill="${trim}"/>
      <rect x="26" y="68" width="24" height="16" rx="2" fill="${trim}"/>
      <circle cx="102" cy="62" r="10" fill="${trim}"/>
      <rect x="90" y="150" width="60" height="14" rx="2" fill="${collarBg}" opacity="0.18"/>
    </svg>`;
  }

  function productMedia(p, alt) {
    alt = alt || fullName(p);
    if (p.photos && p.photos.length) {
      return `<img src="${p.photos[0]}" alt="${alt}" loading="lazy">`;
    }
    return jerseySVG(p.main, p.trim);
  }

  function productGallery(p) {
    if (p.photos && p.photos.length) {
      return p.photos.map(src => `<img src="${src}" alt="${fullName(p)}" loading="lazy">`);
    }
    return [jerseySVG(p.main, p.trim)];
  }

  /* ============================================================
     PROMOÇÃO DE INAUGURAÇÃO — "Escolha 6, pague 3"
     Single source of truth for every date, rule and text used by the
     campaign (top bar, hero section, countdown, badges, popup, cart
     progress, "como funciona"). Edit this object only — nothing else —
     to change dates, eligible products, or to turn the campaign off.
     ============================================================ */
  const PROMO_CONFIG = {
    promotionEnabled: true,
    // ISO 8601 with explicit Europe/Lisbon offset (WEST = +01:00). Kept
    // inside the WEST window (before the late-October DST change back to
    // +00:00) so the countdown never jumps an hour mid-promotion,
    // regardless of the visitor's own timezone.
    promotionStart: '2026-09-18T00:00:00+01:00',
    promotionEnd: '2026-10-09T23:59:59+01:00',
    promotionTimeZone: 'Europe/Lisbon',
    // Empty = every product in the catalog participates. List specific
    // product ids (see PRODUCTS above) to restrict participation instead.
    eligibleProducts: [],
    requiredQuantity: 6,
    freeQuantity: 3,
    maximumApplicationsPerOrder: 1,
  };

  function isPromoActive(now) {
    now = now ?? Date.now();
    if (!PROMO_CONFIG.promotionEnabled) return false;
    const start = new Date(PROMO_CONFIG.promotionStart).getTime();
    const end = new Date(PROMO_CONFIG.promotionEnd).getTime();
    return now >= start && now <= end;
  }

  function isPromoEligible(productId) {
    const list = PROMO_CONFIG.eligibleProducts;
    if (!list || !list.length) return true;
    return list.includes(productId);
  }

  /* ============================================================
     DESCONTO POR QUANTIDADE — "Quanto mais levas, mais poupas"
     Promoção PERMANENTE (sem data de início/fim), separada da promoção
     sazonal "Escolha 6, pague 3" acima. Mostrada apenas na página de
     produto (produto.html / js/main.js initProductPage). O desconto real
     é aplicado no servidor (api/create-checkout-session.js), que nunca
     soma este desconto com o da promoção sazonal — aplica sempre o maior
     dos dois, nunca os dois juntos. Manter este objeto e api/_catalog.js do backend sincronizados ao mudar os
     escalões ou desligar a promoção (enabled: false).
     ============================================================ */
  const TIER_CONFIG = {
    enabled: true,
    // Empty = every product in the catalog participates.
    eligibleProducts: [],
    // threshold = nº de unidades elegíveis no carrinho; pay = quantas
    // dessas unidades são cobradas (as restantes, as mais baratas, ficam
    // grátis). Itens além do último escalão atingido são cobrados a preço
    // cheio (o desconto não continua a escalar indefinidamente).
    tiers: [
      { threshold: 3, pay: 2 },
      { threshold: 6, pay: 3 },
      { threshold: 9, pay: 4 },
      { threshold: 12, pay: 5 },
      { threshold: 15, pay: 6 },
    ],
  };

  function isTierEligible(productId) {
    const list = TIER_CONFIG.eligibleProducts;
    if (!list || !list.length) return true;
    return list.includes(productId);
  }

  // Devolve o escalão mais alto atingido por "quantity" unidades elegíveis,
  // ou null se nenhum escalão for atingido.
  function bestTierFor(quantity) {
    if (!TIER_CONFIG.enabled) return null;
    let best = null;
    for (const t of TIER_CONFIG.tiers) {
      if (quantity >= t.threshold && (!best || t.threshold > best.threshold)) best = t;
    }
    return best;
  }

  // % de desconto (para mostrar na tabela) de um escalão.
  function tierDiscountPercent(tier) {
    if (!tier) return 0;
    return Math.round((1 - tier.pay / tier.threshold) * 100);
  }

  /* ============================================================
     CARRINHO LOCAL + CHECKOUT VIA STRIPE
     ------------------------------------------------------------
     Antes, o carrinho vivia num "cart" real da Shopify (Storefront API)
     e o botão de checkout mandava o cliente para o checkout hospedado
     pela Shopify. Essa loja Shopify foi apagada, por isso essa parte
     deixou de existir.
     Esta versão guarda o carrinho no localStorage do próprio browser
     (tal como já acontecia com os favoritos) e, só no momento de
     finalizar a compra, envia o conteúdo do carrinho para uma função
     do site (uma "serverless function" na Vercel) que:
       1) calcula o preço a partir do catálogo do servidor (nunca confia
          no preço vindo do browser);
       2) aplica a promoção "escolha 6, pague 3" se estiver ativa;
       3) cria uma sessão de pagamento real na Stripe e devolve o link
          para onde o cliente deve ser enviado para pagar.

     IMPORTANTE — depois de publicar a função na Vercel (ver pasta
     /api ao lado deste ficheiro e o README), troque o valor abaixo pelo
     URL real que a Vercel lhe der, por exemplo:
       'https://lowwear-checkout.vercel.app/api/create-checkout-session'
     ============================================================ */
  const CHECKOUT_API_URL = 'https://low-wear-2.vercel.app/api/create-checkout-session';
  const NEWSLETTER_API_URL = 'https://low-wear-2.vercel.app/api/newsletter';

  const CART_KEY = 'lw_cart_v1';

  function loadCart() {
    try {
      const raw = JSON.parse(localStorage.getItem(CART_KEY));
      if (raw && Array.isArray(raw.lines)) return raw;
    } catch { /* ignora carrinho corrompido */ }
    return { lines: [] };
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    return cart;
  }

  function makeLineId() {
    return 'l_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  // unitPrice aqui é só para o cliente conseguir mostrar o total no
  // carrinho — o valor que conta a sério é sempre recalculado no
  // servidor (api/create-checkout-session.js) a partir do id do produto.
  function unitPriceFor(product, customName) {
    return product.price + (customName ? 8 : 0);
  }

  function addCartLine({ productId, size, quantity, customName, version }) {
    const product = getProduct(productId);
    if (!product) throw new Error('produto desconhecido');
    quantity = Math.max(1, quantity || 1);
    customName = (customName || '').trim();
    const cart = loadCart();
    // junta a uma linha existente do mesmo produto/tamanho/personalização
    const existing = cart.lines.find((l) => l.productId === productId && l.size === size && l.customName === customName && l.version === (version || ''));
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.lines.push({
        id: makeLineId(), productId, size, quantity, customName, version: version || '',
        unitPrice: unitPriceFor(product, customName), addedAt: Date.now(),
      });
    }
    return saveCart(cart);
  }

  function updateCartLineQty(lineId, quantity) {
    const cart = loadCart();
    const line = cart.lines.find((l) => l.id === lineId);
    if (!line) return cart;
    line.quantity = Math.max(1, quantity);
    return saveCart(cart);
  }

  function removeCartLine(lineId) {
    const cart = loadCart();
    cart.lines = cart.lines.filter((l) => l.id !== lineId);
    return saveCart(cart);
  }

  function clearCart() {
    return saveCart({ lines: [] });
  }

// Mantido em espelho no frontend/backend; os testes verificam a paridade.
function calculatePromotion(units, now = Date.now()) {
  const empty = () => ({ freeIndexes: new Set(), value: 0, label: '' });
  const eligible = (config) => units.map((u, idx) => ({
    idx, price: Math.round(u.unitPrice * 100), productId: u.product.id,
  })).filter(u => !config.eligibleProducts?.length || config.eligibleProducts.includes(u.productId))
    .sort((a, b) => a.price - b.price);
  const candidate = (items, count, label) => {
    const free = items.slice(0, count);
    return { freeIndexes: new Set(free.map(u => u.idx)),
      value: free.reduce((sum, u) => sum + u.price, 0), label: free.length ? label : '' };
  };
  let seasonal = empty();
  if (isPromoActive(now)) {
    const items = eligible(PROMO_CONFIG);
    const applications = Math.min(Math.floor(items.length / PROMO_CONFIG.requiredQuantity),
      PROMO_CONFIG.maximumApplicationsPerOrder);
    seasonal = candidate(items, applications * PROMO_CONFIG.freeQuantity,
      'Escolha ' + PROMO_CONFIG.requiredQuantity + ', pague ' + (PROMO_CONFIG.requiredQuantity - PROMO_CONFIG.freeQuantity));
  }
  const items = eligible(TIER_CONFIG);
  const tier = bestTierFor(items.length);
  const quantity = tier ? candidate(items, tier.threshold - tier.pay,
    'Leva ' + tier.threshold + ', paga ' + tier.pay) : empty();
  // Compara valores monetários, nunca soma as ofertas. Em empate, mostra o escalão.
  return quantity.value >= seasonal.value ? quantity : seasonal;
}

  function cartTotals(cart, now = Date.now()) {
    const units = [];
    for (const line of cart.lines) {
      const product = getProduct(line.productId);
      if (!product || !Number.isInteger(line.quantity) || line.quantity < 1) continue;
      const customName = typeof line.customName === 'string' ? line.customName.trim().slice(0, 40) : '';
      for (let i = 0; i < line.quantity; i++) {
        units.push({ product, unitPrice: unitPriceFor(product, customName) });
      }
    }
    const subtotalCents = units.reduce((sum, u) => sum + Math.round(u.unitPrice * 100), 0);
    const promotion = calculatePromotion(units, now);
    return { subtotal: subtotalCents / 100, discount: promotion.value / 100,
      total: (subtotalCents - promotion.value) / 100, freeUnits: promotion.freeIndexes.size,
      promotion: promotion.label };
  }

  // Envia o carrinho para a função de checkout e devolve o URL da Stripe
  // para onde a página deve redirecionar o cliente.
  async function goToStripeCheckout(cart) {
    // Continua compatível com o backend anterior durante a publicação.
    const lines = [];
    cart.lines.forEach((l) => {
      for (let i = 0; i < l.quantity; i++) {
        lines.push({ productId: l.productId, size: l.size, quantity: 1, customName: l.customName });
      }
    });
    const res = await fetch(CHECKOUT_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) throw new Error(data.message || data.error || 'checkout_failed');
    return data.url;
  }

  // Inscrição na newsletter — ver api/newsletter.js (sem Shopify, guarda
  // o email nos logs da função por agora; ver comentário nesse ficheiro
  // para ligar a um serviço de email marketing a sério).
  async function newsletterSignup(email) {
    const res = await fetch(NEWSLETTER_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) throw new Error('newsletter_failed');
    return true;
  }

  const Cart = {
    load: loadCart,
    addLine: addCartLine,
    updateLineQty: updateCartLineQty,
    removeLine: removeCartLine,
    clear: clearCart,
    totals: cartTotals,
    checkout: goToStripeCheckout,
    newsletterSignup,
  };

  window.LowWearData = {
    TEAMS, PRODUCTS, TYPE_LABEL,
    euro, getTeam, getProduct, getProductsByTeam, fullName, jerseySVG, productMedia, productGallery,
    weeklyFeaturedProduct,
    PROMO_CONFIG, isPromoActive, isPromoEligible,
    TIER_CONFIG, isTierEligible, bestTierFor, tierDiscountPercent,
    Cart,
  };
})();
