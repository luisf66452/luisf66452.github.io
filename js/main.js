(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const LWD = window.LowWearData;
  const euro = LWD.euro;
  const CUSTOMER_REVIEWS = [
    ['Uma experiência para repetir', 'Desde a escolha das peças até receber a encomenda, correu tudo bem. Fiquei contente com a compra e vou continuar a acompanhar a Low Wear.'],
    ['Tudo certo com a encomenda', 'Recebi os artigos que escolhi, bem apresentados e sem problemas. Foi a minha primeira compra na Low Wear e fiquei satisfeito.'],
    ['Gostei muito do corte!', 'Tinha algum receio de comprar roupa online, mas o tamanho ficou como queria. A peça funciona bem com vários looks.'],
    ['Uma boa escolha para oferecer', 'Comprei uma peça para oferecer e acertei em cheio. A pessoa adorou o estilo e ficou logo a perguntar pela loja.'],
    ['Simples e com estilo', 'Era exatamente o tipo de roupa que procurava: descontraída, confortável e fácil de usar. Gostei especialmente de como assenta.'],
    ['Estilo e conforto no dia a dia', 'Já usei várias vezes e sinto-me sempre confortável. São daquelas peças que acabam por sair do armário todas as semanas.'],
    ['Já quero encomendar outra vez!', 'As peças são confortáveis e fáceis de combinar. Comprei para experimentar e fiquei com vontade de escolher mais.'],
    ['Atendimento impecável', 'Precisava de ajuda com o tamanho e a equipa foi muito atenciosa. A sugestão que me deram assentou mesmo bem.'],
    ['Superou as expectativas!', 'Gostei das peças nas fotografias, mas ao vivo gostei ainda mais. Bons detalhes e um corte que resulta muito bem.'],
  ];

  /* ---------------- carrinho + checkout (Stripe) ----------------
     Antes, isto falava com a Storefront API da Shopify. Essa loja
     Shopify foi apagada, por isso o carrinho agora vive inteiramente no
     localStorage do browser (ver LWD.Cart em js/data.js) e só ao
     finalizar a compra é que fala com o servidor (a função Vercel em
     /api/create-checkout-session.js), que cria a sessão de pagamento
     real na Stripe. */
  const STORE_KEY_FAV = 'lw_fav';

  const loadJSON = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch { return fallback; }
  };

  let cart = LWD.Cart.load();
  let favs = loadJSON(STORE_KEY_FAV, []);

  const saveFavs = () => localStorage.setItem(STORE_KEY_FAV, JSON.stringify(favs));

  function addLineToCart({ productId, size, customName, version, badge }) {
    cart = LWD.Cart.addLine({ productId, size, quantity: 1, customName, version, badge });
    updateCounts();
    renderCart();
    return cart;
  }

  function updateCartLineQty(lineId, quantity) {
    cart = LWD.Cart.updateLineQty(lineId, quantity);
    updateCounts();
    renderCart();
  }

  function removeCartLine(lineId) {
    cart = LWD.Cart.removeLine(lineId);
    updateCounts();
    renderCart();
  }
  /* ---------------- toast ---------------- */
  const toast = $('#toast');
  let toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.querySelector('.toast-msg').textContent = msg;
    toast.classList.add('is-open');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-open'), 2600);
  }

  /* ---------------- scroll reveal ---------------- */
  const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  function observeReveals() {
    $$('.reveal:not(.is-visible)').forEach(el => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  /* ---------------- overlays ---------------- */
  const scrim = $('#scrim');
  const cartDrawer = $('#cart-drawer');
  const favDrawer = $('#fav-drawer');
  const searchPanel = $('#search-panel');
  const mobileNav = $('#mobile-nav');

  const allOverlays = [cartDrawer, favDrawer, searchPanel, mobileNav, ...$$('.modal-box')].filter(Boolean);

  function closeAllOverlays() {
    allOverlays.forEach(el => { el.classList.remove('is-open'); el.setAttribute('inert', ''); });
    scrim?.classList.remove('is-open');
    document.body.classList.remove('no-scroll');
  }

  function openOverlay(el) {
    closeAllOverlays();
    if (!el) return;
    el.classList.add('is-open');
    el.removeAttribute('inert');
    scrim?.classList.add('is-open');
    document.body.classList.add('no-scroll');
  }

  scrim?.addEventListener('click', closeAllOverlays);
  $$('[data-close-overlay]').forEach(b => b.addEventListener('click', closeAllOverlays));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllOverlays(); });

  $('#cart-toggle')?.addEventListener('click', () => { openOverlay(cartDrawer); renderCart(); });
  $$('.js-cart-toggle').forEach(b => b.addEventListener('click', () => { openOverlay(cartDrawer); renderCart(); }));
  $('#fav-toggle')?.addEventListener('click', () => { openOverlay(favDrawer); renderFavDrawer(); });
  $$('.js-fav-toggle').forEach(b => b.addEventListener('click', () => { openOverlay(favDrawer); renderFavDrawer(); }));
  $('#search-toggle')?.addEventListener('click', () => { openOverlay(searchPanel); setTimeout(() => $('#search-input')?.focus(), 100); });
  $$('.js-search-toggle').forEach(b => b.addEventListener('click', () => { openOverlay(searchPanel); setTimeout(() => $('#search-input')?.focus(), 100); }));
  $('#account-toggle')?.addEventListener('click', () => openOverlay($('#login-modal')));
  $('#footer-account')?.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#login-modal')); });
  $('#footer-privacy')?.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#privacy-modal')); });
  $('#footer-terms')?.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#terms-modal')); });
  $('#footer-exchange')?.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#exchange-modal')); });
  $('#footer-faq')?.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#faq-modal')); });

  /* ---------------- sobre / unboxing — vídeos ----------------
     Only play a video once it's actually on screen — mobile browsers
     throttle or suspend off-screen <video> playback for battery/data
     reasons, and since these grids sit well below the fold, calling
     play() once at page load left every clip stuck paused on phones. */
  const aboutVideoCards = $$('.about-video-card');
  const videoObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          const video = $('.about-video', entry.target);
          if (!video) return;
          if (entry.isIntersecting) video.play().catch(() => {});
          else video.pause();
        });
      }, { threshold: 0.35 })
    : null;
  aboutVideoCards.forEach(card => {
    const video = $('.about-video', card);
    const muteBtn = $('.about-video-mute', card);
    if (!video) return;
    if (videoObserver) videoObserver.observe(card);
    else video.play().catch(() => {}); // no IntersectionObserver support — best effort
    video.addEventListener('error', () => card.classList.add('has-error'));
    muteBtn?.addEventListener('click', () => {
      video.muted = !video.muted;
      muteBtn.setAttribute('aria-pressed', String(!video.muted));
      muteBtn.setAttribute('aria-label', video.muted ? 'Ativar som' : 'Silenciar');
    });
  });
  $('#nav-toggle')?.addEventListener('click', () => openOverlay(mobileNav));

  /* ---------------- header on scroll ---------------- */
  const header = $('.site-header');
  const heroBgWord = $('.hero-bg-word');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 40);
    if (heroBgWord) heroBgWord.style.transform = `translateY(${Math.min(window.scrollY, 600) * 0.15}px)`;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  /* ---------------- cart ---------------- */
  function renderCart() {
    const body = $('#drawer-body');
    const foot = $('#drawer-foot');
    if (!body) return;
    const lines = cart.lines || [];
    if (lines.length === 0) {
      body.innerHTML = `
        <div class="drawer-empty">
          <svg viewBox="0 0 24 24"><path d="M3 6h2l2.4 12.2a2 2 0 0 0 2 1.8h8.5a2 2 0 0 0 2-1.6L21 8H6"/><circle cx="10" cy="21" r="1"/><circle cx="18" cy="21" r="1"/></svg>
          <p>O seu carrinho está vazio.<br>Adicione a sua próxima camisola.</p>
        </div>`;
      if (foot) foot.style.display = 'none';
      renderPromoProgress(lines);
      updateCounts();
      return;
    }
    if (foot) foot.style.display = 'block';
    body.innerHTML = lines.map((line) => {
      const p = LWD.getProduct(line.productId);
      const name = p ? LWD.fullName(p) : line.productId;
      const media = p ? LWD.productMedia(p) : '';
      const extras = [line.version, line.customName ? `"${line.customName}"` : '', line.badge].filter(Boolean).join(' · ');
      return `
      <div class="cart-line" data-line-id="${line.id}">
        <div class="cl-media${media.startsWith('<img') ? ' has-photo' : ''}">${media}</div>
        <div class="cl-info">
          <div class="cl-name">${name}</div>
          <div class="cl-meta">Tam. ${line.size}${extras ? ` · ${extras}` : ''}</div>
          <div class="cl-row">
            <div class="qty-stepper">
              <button data-act="dec" aria-label="Diminuir quantidade">−</button>
              <span>${line.quantity}</span>
              <button data-act="inc" aria-label="Aumentar quantidade">+</button>
            </div>
            <span class="cl-price">${euro(line.unitPrice * line.quantity)}</span>
          </div>
          <button class="cl-remove" data-act="remove">Remover</button>
        </div>
      </div>`;
    }).join('');

    const totalsEl = $('#drawer-totals');
    if (totalsEl) {
      const { subtotal, discount, total, promotion } = LWD.Cart.totals(cart);
      totalsEl.innerHTML = (discount ? `<div class="drawer-subtotal"><span>Subtotal</span><strong>${euro(subtotal)}</strong></div>
        <div class="drawer-subtotal"><span>${promotion}</span><strong>−${euro(discount)}</strong></div>` : '') +
        `<div class="drawer-subtotal"><span>Total estimado</span><strong>${euro(total)}</strong></div>`;

    }
    renderCouponUI();
    renderPromoProgress(lines);
    updateCounts();
  }

  // Códigos promocionais por cupão não existem nesta versão (não há
  // Shopify a validá-los). O formulário fica visível mas avisa em vez de
  // recarregar a página.
  function renderCouponUI() {
    const msgEl = $('#cart-coupon-msg');
    if (!msgEl) return;
    msgEl.innerHTML = '';
  }

  $('#cart-coupon-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const msgEl = $('#cart-coupon-msg');
    if (msgEl) msgEl.innerHTML = `<span class="coupon-error">Códigos promocionais não estão disponíveis de momento.</span>`;
  });

  $('#drawer-body')?.addEventListener('click', (e) => {
    const line = e.target.closest('.cart-line');
    if (!line) return;
    const lineId = line.dataset.lineId;
    const current = cart.lines.find((l) => l.id === lineId);
    if (!current) return;
    const act = e.target.dataset.act;
    if (act === 'inc') updateCartLineQty(lineId, current.quantity + 1);
    if (act === 'dec') updateCartLineQty(lineId, Math.max(1, current.quantity - 1));
    if (act === 'remove') removeCartLine(lineId);
  });

  /* ---------------- "Escolha 6, pague 3" cart progress ----------------
     Pré-visualização apenas — o desconto real é confirmado pelo servidor
     no momento do checkout (ver PROMO_CONFIG em js/data.js e a lógica em
     api/create-checkout-session.js). */
  function renderPromoProgress(lines) {
    const el = $('#cart-promo-progress');
    if (!el) return;
    const totals = LWD.Cart.totals({ lines });
    if (totals.discount > 0) {
      el.style.display = 'block';
      el.innerHTML = `<div class="promo-progress-active">
        <strong>🎉 ${totals.promotion}</strong>
        <p>${totals.freeUnits} camisola(s) de oferta: as elegíveis de menor valor.</p>
        <p class="promo-progress-savings">Poupança estimada: ${euro(totals.discount)} <span class="promo-progress-note">(confirmada no checkout)</span></p>
        <p>Aplicamos apenas o maior desconto. As promoções não acumulam.</p>
      </div>`;
      return;
    }
    const countFor = eligible => lines.reduce((sum, line) => sum + (eligible(line.productId) ? line.quantity : 0), 0);
    const nextOffers = [];
    if (LWD.TIER_CONFIG.enabled) {
      const count = countFor(LWD.isTierEligible);
      for (const tier of LWD.TIER_CONFIG.tiers) {
        if (tier.threshold > count) nextOffers.push({ remaining: tier.threshold - count,
          label: 'Leva ' + tier.threshold + ', paga ' + tier.pay });
      }
    }
    if (LWD.isPromoActive()) {
      const config = LWD.PROMO_CONFIG;
      const remaining = config.requiredQuantity - countFor(LWD.isPromoEligible);
      if (remaining > 0 && config.maximumApplicationsPerOrder > 0) nextOffers.push({ remaining,
        label: 'Escolha ' + config.requiredQuantity + ', pague ' + (config.requiredQuantity - config.freeQuantity) });
    }
    nextOffers.sort((a, b) => a.remaining - b.remaining);
    const next = nextOffers[0];
    el.style.display = next ? 'block' : 'none';
    el.innerHTML = next ? `<p class="promo-progress-text">Adicione mais ${next.remaining} camisola(s) elegíveis para ativar «${next.label}».</p>
      <a href="index.html#catalogo" class="btn btn-ghost btn-sm promo-progress-cta">ESCOLHER MAIS UMA</a>` : '';
  }

  function updateCounts() {
    const cartCount = (cart.lines || []).reduce((s, l) => s + l.quantity, 0);
    $$('.js-cart-count').forEach(el => { el.textContent = cartCount; el.style.display = cartCount ? 'flex' : 'none'; });
    $$('.js-fav-count').forEach(el => { el.textContent = favs.length; el.style.display = favs.length ? 'flex' : 'none'; });
  }

  /* ---------------- favorites ---------------- */
  function toggleFav(id) {
    if (favs.includes(id)) { favs = favs.filter(f => f !== id); showToast('Removido dos favoritos'); }
    else { favs.push(id); showToast('Adicionado aos favoritos'); }
    saveFavs();
    updateCounts();
    $$(`.product-card[data-id="${id}"] .fav-btn`).forEach(b => b.classList.toggle('is-active', favs.includes(id)));
    if (favDrawer?.classList.contains('is-open')) renderFavDrawer();
  }

  function renderFavDrawer() {
    const body = $('#fav-drawer-body');
    if (!body) return;
    const products = favs.map(id => LWD.getProduct(id)).filter(Boolean);
    if (products.length === 0) {
      body.innerHTML = `
        <div class="drawer-empty">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9C.6 8.4 2.4 4.5 6.3 4.1 8.7 3.9 10.7 5 12 6.8 13.3 5 15.3 3.9 17.7 4.1c3.9.4 5.7 4.3 3.8 7.9C19 16.4 12 21 12 21Z"/></svg>
          <p>Ainda sem favoritos.<br>Toque no coração de uma camisola para a guardar aqui.</p>
        </div>`;
      return;
    }
    body.innerHTML = products.map(p => `
      <div class="cart-line" data-id="${p.id}">
        <div class="cl-media${p.photos && p.photos.length ? ' has-photo' : ''}">${LWD.productMedia(p)}</div>
        <div class="cl-info">
          <div class="cl-name">${LWD.fullName(p)}</div>
          <div class="cl-meta">${LWD.TYPE_LABEL[p.type]} · ${p.season} · ${euro(p.price)}</div>
          <div class="cl-row">
            <a class="btn btn-ghost btn-sm" href="produto.html?id=${p.id}">Ver produto</a>
          </div>
          <button class="cl-remove" data-act="unfav">Remover</button>
        </div>
      </div>`).join('');
  }

  $('#fav-drawer-body')?.addEventListener('click', (e) => {
    if (e.target.dataset.act === 'unfav') {
      const line = e.target.closest('.cart-line');
      toggleFav(line.dataset.id);
    }
  });

  /* ---------------- product card builder ---------------- */
  function tagClass(tag) {
    switch (tag) {
      case 'Novo': return 'tag-new';
      case 'Mais vendido': return 'tag-best';
      case 'Edição especial': return 'tag-limited';
      case 'Retro': return 'tag-retro';
      case 'Últimas unidades': return 'tag-sale';
      case 'Esgotado': return 'tag-off';
      default: return 'tag-off';
    }
  }

  function productCardHTML(p, i) {
    const team = LWD.getTeam(p.teamSlug);
    const esgotado = p.availability === 'esgotado';
    const delay = (typeof i === 'number') ? `style="--reveal-delay:${(i % 8) * 60}ms;"` : '';
    const sizesHTML = ['S', 'M', 'L', 'XL'].map(s => {
      const avail = p.sizes.includes(s) && !esgotado;
      return `<button class="size-chip${avail ? '' : ' is-disabled'}" ${avail ? '' : 'disabled'}>${s}</button>`;
    }).join('');
    return `
      <article class="product-card reveal${esgotado ? ' is-esgotado' : ''}" data-id="${p.id}" ${delay}>
        ${p.tag ? `<div class="kit-tag ${tagClass(p.tag)}">${p.tag}</div>` : ''}
        <button class="fav-btn${favs.includes(p.id) ? ' is-active' : ''}" aria-label="Adicionar aos favoritos">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7-4.6-9.5-9C.6 8.4 2.4 4.5 6.3 4.1 8.7 3.9 10.7 5 12 6.8 13.3 5 15.3 3.9 17.7 4.1c3.9.4 5.7 4.3 3.8 7.9C19 16.4 12 21 12 21Z"/></svg>
        </button>
        <a class="product-media${p.photos && p.photos.length ? ' has-photo' : ''}" href="produto.html?id=${p.id}">${LWD.productMedia(p)}</a>
        <div class="product-info">
          <div class="p-eyebrow"><span>${team.name}</span><span>${p.season}</span></div>
          <h3><a href="produto.html?id=${p.id}">${p.name}</a></h3>
          <div class="p-price">
            <span class="now">${euro(p.price)}</span>
            ${p.was ? `<span class="was">${euro(p.was)}</span>` : ''}
          </div>
          ${(!esgotado && LWD.isPromoActive() && LWD.isPromoEligible(p.id)) ? `<div class="promo-card-badge">LEVE 6 · PAGUE 3</div>` : ''}
          ${esgotado ? `<div class="p-stock">Esgotado — nova reposição em breve</div>` : ''}
          <div class="size-row">${sizesHTML}</div>
          <div class="product-actions">
            <a class="btn btn-primary btn-block" href="produto.html?id=${p.id}">Ver produto</a>
          </div>
        </div>
      </article>`;
  }

  function wireProductGrid(container) {
    if (!container || container.dataset.wired) return;
    container.dataset.wired = '1';
    container.addEventListener('click', (e) => {
      const card = e.target.closest('.product-card');
      if (!card) return;
      const id = card.dataset.id;

      if (e.target.closest('.size-chip')) {
        const chip = e.target.closest('.size-chip');
        if (chip.disabled) return;
        $$('.size-chip', card).forEach(c => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
        return;
      }
      if (e.target.closest('.fav-btn')) {
        e.preventDefault();
        toggleFav(id);
      }
    });
  }

  /* ---------------- team card builder ---------------- */
  function teamCardHTML(t, i) {
    const count = LWD.getProductsByTeam(t.slug).length;
    const delay = (typeof i === 'number') ? `--reveal-delay:${(i % 8) * 70}ms;` : '';
    return `
      <a class="team-card reveal" href="equipa.html?slug=${t.slug}" style="--team-color:${t.main};${delay}">
        <div class="team-media">${LWD.jerseySVG(t.main, t.trim)}</div>
        <div class="team-crest">${t.short.slice(0, 2).toUpperCase()}</div>
        <div class="team-card-body">
          <span class="team-count">${count} modelos disponíveis</span>
          <h3>${t.name}</h3>
          <span class="btn btn-primary btn-sm">Ver camisas</span>
        </div>
      </a>`;
  }

  function renderTeamGrid(container) {
    if (!container) return;
    container.innerHTML = LWD.TEAMS.map(teamCardHTML).join('');
  }

  /* ---------------- catalog (filters) ---------------- */
  function renderCatalog() {
    const grid = $('#catalog-grid');
    if (!grid) return;
    const vals = {
      equipa: $('#f-equipa')?.value || '',
      tipo: $('#f-tipo')?.value || '',
      temporada: $('#f-temporada')?.value || '',
      tamanho: $('#f-tamanho')?.value || '',
      preco: $('#f-preco')?.value || '',
      disponibilidade: $('#f-disponibilidade')?.value || '',
    };
    const results = LWD.PRODUCTS.filter(p => {
      // "Catálogo completo" agora é o catálogo brasileiro — o futebol
      // português vive só na secção #futebol-portugues (ver country:'PT').
      const team = LWD.getTeam(p.teamSlug);
      if (team && team.country === 'PT') return false;
      if (vals.equipa && p.teamSlug !== vals.equipa) return false;
      if (vals.tipo && p.type !== vals.tipo) return false;
      if (vals.temporada && p.season !== vals.temporada) return false;
      if (vals.tamanho && !p.sizes.includes(vals.tamanho)) return false;
      if (vals.disponibilidade && p.availability !== vals.disponibilidade) return false;
      if (vals.preco === 'baixo' && p.price > 85) return false;
      if (vals.preco === 'medio' && (p.price <= 85 || p.price > 95)) return false;
      if (vals.preco === 'alto' && p.price <= 95) return false;
      return true;
    });
    grid.innerHTML = results.length
      ? results.map(productCardHTML).join('')
      : `<p style="grid-column:1/-1;padding:40px;text-align:center;color:var(--muted);">Sem camisolas para estes filtros.</p>`;
    wireProductGrid(grid);
    observeReveals();
    const countEl = $('#filter-count');
    if (countEl) countEl.textContent = `${results.length} camisola${results.length === 1 ? '' : 's'}`;
  }

  $$('.filter-bar select').forEach(s => s.addEventListener('change', renderCatalog));

  /* ---------------- camisa mais procurada (rotação semanal) ----------------
     Um único produto, escolhido automaticamente por LWD.weeklyFeaturedProduct()
     — mesma camisa para todos os visitantes durante a semana toda, muda
     sozinha na semana seguinte. Reaproveita productCardHTML para manter
     favoritos/tamanhos/link "Ver produto" idênticos ao resto do site. */
  function renderWeeklySpotlight(container) {
    if (!container) return;
    const p = LWD.weeklyFeaturedProduct();
    if (!p) return;
    container.innerHTML = productCardHTML(p, 0);
    wireProductGrid(container);
  }

  /* ---------------- Futebol Português ----------------
     Separate section, not mixed into the Brazilian catalog/featured
     grids. Pulls every product whose team has country:'PT' (see
     TEAMS in js/data.js), so adding Benfica/Sporting/Porto later is
     just adding their team + products there — nothing here to touch.
     The whole section hides itself if no PT product exists yet. */
  function renderPortugalSection() {
    const section = $('#futebol-portugues');
    const grid = $('#pt-grid');
    const strip = $('#pt-teaser-strip');
    if (!section || !grid) return;
    const ptTeamSlugs = LWD.TEAMS.filter(t => t.country === 'PT').map(t => t.slug);
    const products = LWD.PRODUCTS.filter(p => ptTeamSlugs.includes(p.teamSlug));
    if (!products.length) { section.hidden = true; if (strip) strip.hidden = true; return; }
    section.hidden = false;
    if (strip) strip.hidden = false;
    grid.innerHTML = products.map(productCardHTML).join('');
    wireProductGrid(grid);
  }

  /* ---------------- search ---------------- */
  const searchInput = $('#search-input');
  const searchResults = $('#search-results');
  searchInput?.addEventListener('input', () => {
    const q = searchInput.value.trim().toLowerCase();
    if (!searchResults) return;
    if (!q) { searchResults.innerHTML = ''; return; }
    const matches = LWD.PRODUCTS.filter(p => {
      const team = LWD.getTeam(p.teamSlug);
      return LWD.fullName(p).toLowerCase().includes(q) || team.name.toLowerCase().includes(q) || team.short.toLowerCase().includes(q);
    }).slice(0, 8);
    searchResults.innerHTML = matches.length
      ? matches.map(p => `
        <a class="search-result-item" href="produto.html?id=${p.id}">
          ${LWD.productMedia(p)}
          <span><span class="sr-name">${LWD.fullName(p)}</span><span class="sr-price">${euro(p.price)}</span></span>
        </a>`).join('')
      : `<p style="color:var(--muted);font-family:var(--font-mono);font-size:12px;">Sem resultados para "${q}"</p>`;
  });

  /* ---------------- header anchors: Lançamentos / Mais vendidos ---------------- */
  $$('.js-filter-novo').forEach(a => a.addEventListener('click', (e) => {
    if (!$('#catalog-grid')) return;
    e.preventDefault();
    const sel = $('#f-tipo'); if (sel) sel.value = '';
    document.querySelector('#catalogo')?.scrollIntoView({ behavior: 'smooth' });
  }));
  $$('.js-scroll-featured').forEach(a => a.addEventListener('click', (e) => {
    if (!$('#spotlight-grid')) return;
    e.preventDefault();
    document.querySelector('#mais-procuradas')?.scrollIntoView({ behavior: 'smooth' });
  }));

  /* ---------------- newsletter ---------------- */
  $('#newsletter-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = $('#newsletter-email');
    const btn = e.target.querySelector('button[type="submit"]');
    const email = input.value.trim();
    if (!email) return;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'A inscrever…';
    try {
      await LWD.Cart.newsletterSignup(email);
      showToast('Inscrição confirmada. Bem-vindo à bancada.');
      input.value = '';
    } catch (err) {
      showToast('Não foi possível concluir a inscrição. Tenta novamente.');
    } finally {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
  /* ---------------- login modal switch ---------------- */
  $('#to-register')?.addEventListener('click', () => { openOverlay($('#register-modal')); });
  $('#to-login')?.addEventListener('click', () => { openOverlay($('#login-modal')); });
  $$('#login-modal form, #register-modal form').forEach(f => f.addEventListener('submit', (e) => {
    e.preventDefault(); closeAllOverlays(); showToast('Sessão iniciada com sucesso');
  }));

  /* ---------------- checkout ---------------- */
  $('#checkout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (!cart.lines.length) { showToast('O seu carrinho está vazio'); return; }
    const btn = e.currentTarget;
    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'A preparar o pagamento…';
    try {
      const url = await LWD.Cart.checkout(cart);
      window.location.href = url;
    } catch (err) {
      showToast('Não foi possível iniciar o pagamento. Tenta novamente.');
      btn.disabled = false;
      btn.textContent = originalText;
    }
  });
  /* ---------------- size guide ---------------- */
  $$('.size-guide-link').forEach(l => l.addEventListener('click', (e) => { e.preventDefault(); openOverlay($('#size-guide-modal')); }));

  /* ============================================================
     TEAM PAGE (equipa.html?slug=...)
     ============================================================ */
  function initTeamPage() {
    const root = $('[data-page="team"]');
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const slug = params.get('slug') || 'selecao';
    const team = LWD.getTeam(slug) || LWD.TEAMS[0];
    let products = LWD.getProductsByTeam(team.slug);

    document.title = `${team.name} — Low Wear`;
    $('#team-name').textContent = team.tagline;
    $('#team-text').textContent = team.text;
    $('#team-count').textContent = `${products.length} modelos disponíveis`;
    $('.team-banner').style.setProperty('--team-color', team.main);
    $$('.js-team-name').forEach(el => el.textContent = team.name);

    const grid = $('#team-products-grid');
    function renderTeamProducts() {
      const sort = $('#team-sort')?.value || 'novidade';
      const sorted = [...products];
      if (sort === 'preco-asc') sorted.sort((a, b) => a.price - b.price);
      else if (sort === 'preco-desc') sorted.sort((a, b) => b.price - a.price);
      else if (sort === 'popularidade') sorted.sort((a, b) => (b.tag === 'Mais vendido' ? 1 : 0) - (a.tag === 'Mais vendido' ? 1 : 0));
      grid.innerHTML = sorted.map(productCardHTML).join('');
      wireProductGrid(grid);
      observeReveals();
    }
    $('#team-sort')?.addEventListener('change', renderTeamProducts);
    renderTeamProducts();
  }

  /* ============================================================
     PRODUCT PAGE (produto.html?id=...)
     ============================================================ */
  function initProductPage() {
    const root = $('[data-page="product"]');
    if (!root) return;
    const params = new URLSearchParams(location.search);
    const id = params.get('id') || LWD.PRODUCTS[0].id;
    const p = LWD.getProduct(id) || LWD.PRODUCTS[0];
    const team = LWD.getTeam(p.teamSlug);

    document.title = `${LWD.fullName(p)} | Low Wear`;
    $('#breadcrumb-team').textContent = team.name;
    $('#breadcrumb-team').href = `equipa.html?slug=${team.slug}`;
    $('#breadcrumb-product').textContent = p.name;
    $('#pdp-name').textContent = LWD.fullName(p);
    $('#pdp-sub').textContent = `${LWD.TYPE_LABEL[p.type]} · Temporada ${p.season}`;
    $('#pdp-price').innerHTML = p.was
      ? `<span>${euro(p.price)}</span><span class="was">${euro(p.was)}</span>`
      : `<span>${euro(p.price)}</span>`;

    const promoBadgeEl = $('#pdp-promo-badge');
    if (promoBadgeEl) {
      promoBadgeEl.innerHTML = (p.availability !== 'esgotado' && LWD.isPromoActive() && LWD.isPromoEligible(p.id))
        ? `<div class="promo-card-badge promo-pdp-badge">LEVE 6 · PAGUE 3</div>
           <p class="promo-pdp-note">Produto participante da promoção de inauguração. <a href="#" class="js-promo-how">Ver regras da promoção</a></p>`
        : '';
    }

    // Tabela "quanto mais levas, mais poupas" — promoção permanente por
    // escalões, independente da promoção sazonal acima. Ver js/data.js
    // (TIER_CONFIG) para os escalões e api/create-checkout-session.js para
    // a regra de não-acumulação (aplica-se sempre o maior desconto, nunca
    // os dois juntos).
    const tiersEl = $('#pdp-tiers');
    const tiersGridEl = $('#pdp-tiers-grid');
    if (tiersEl && tiersGridEl) {
      const tiersApply = p.availability !== 'esgotado' && LWD.TIER_CONFIG.enabled && LWD.isTierEligible(p.id);
      tiersEl.hidden = !tiersApply;
      if (tiersApply) {
        tiersGridEl.innerHTML = LWD.TIER_CONFIG.tiers.map((t) => {
          const pct = LWD.tierDiscountPercent(t);
          return `<div class="pdp-tier-card">
            <p class="pdp-tier-qty">Leva ${t.threshold}</p>
            <p class="pdp-tier-pay">Paga ${t.pay}</p>
            <p class="pdp-tier-pct">-${pct}%</p>
          </div>`;
        }).join('');
      }
    }

    if (p.tag) {
      $('#pdp-tag').textContent = p.tag;
      $('#pdp-tag').className = `kit-tag ${tagClass(p.tag)}`;
      $('#pdp-tag').style.position = 'static';
    } else {
      $('#pdp-tag').style.display = 'none';
    }
    $('#pdp-type-tag').textContent = LWD.TYPE_LABEL[p.type];

    const gallery = LWD.productGallery(p);
    const hasPhoto = !!(p.photos && p.photos.length);
    const thumbsEl = $('#pdp-thumbs');
    const mainOuter = $('#pdp-main');
    const mainEl = $('#pdp-main-media');
    const zoomHint = $('#zoom-hint');
    const spinHint = $('#spin-hint');
    const separateSpin = gallery.length > 1 && p.spin && p.spin.length > 1;
    thumbsEl.innerHTML = gallery.map((media, i) => `<button class="pdp-thumb${i === 0 ? ' is-active' : ''}${hasPhoto ? ' has-photo' : ''}" aria-label="Imagem ${i + 1}">${media}</button>`).join('');
    if (separateSpin) {
      mainOuter.classList.add('has-studio-gallery');
      thumbsEl.classList.add('has-studio-gallery');
      thumbsEl.insertAdjacentHTML('beforeend', '<button class="pdp-thumb has-photo" aria-label="Vista 360°"><img src="' + p.spin[0] + '" alt="Vista 360°"><span>360°</span></button>');
    }
    mainOuter.classList.toggle('has-photo', hasPhoto);
    mainEl.innerHTML = gallery[0];
    $$('.pdp-thumb', thumbsEl).forEach((thumb, i) => thumb.addEventListener('click', () => {
      $$('.pdp-thumb', thumbsEl).forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (separateSpin) {
        const isSpin = i === gallery.length;
        mainOuter.classList.toggle('has-spin', isSpin);
        mainOuter.classList.remove('is-zoomed');
        if (zoomHint) zoomHint.style.display = isSpin ? 'none' : '';
        if (spinHint) spinHint.style.display = isSpin ? 'flex' : 'none';
        if (spinSlider) spinSlider.style.display = isSpin ? 'block' : 'none';
        if (isSpin) {
          mainEl.innerHTML = '<img src="' + p.spin[0] + '" alt="' + LWD.fullName(p) + ' — vista 360°">';
          if (spinFill) spinFill.style.width = '0%';
          if (spinHandle) spinHandle.style.left = '0%';
          return;
        }
      }
      mainEl.innerHTML = gallery[i];
    }));

    const spinFrames = (p.spin && p.spin.length > 1) ? p.spin : null;
    const spinSlider = $('#spin-slider');
    const spinTrack = $('#spin-slider-track');
    const spinFill = $('#spin-slider-fill');
    const spinHandle = $('#spin-slider-handle');
    if (spinFrames) {
      mainOuter.classList.add('has-spin');
      if (zoomHint) zoomHint.style.display = 'none';
      if (spinHint) spinHint.style.display = 'flex';
      if (spinSlider) spinSlider.style.display = 'block';
      let frameIndex = 0;
      const lastIndex = spinFrames.length - 1;
      const setFrame = (i) => {
        frameIndex = Math.min(lastIndex, Math.max(0, i));
        mainEl.innerHTML = `<img src="${spinFrames[frameIndex]}" alt="${LWD.fullName(p)} — ângulo ${frameIndex + 1}">`;
        const pct = (frameIndex / lastIndex) * 100;
        if (spinFill) spinFill.style.width = `${pct}%`;
        if (spinHandle) spinHandle.style.left = `${pct}%`;
      };
      if (separateSpin) {
        mainOuter.classList.remove('has-spin');
        if (zoomHint) zoomHint.style.display = '';
        if (spinHint) spinHint.style.display = 'none';
        if (spinSlider) spinSlider.style.display = 'none';
        mainOuter.addEventListener('click', () => {
          if (!mainOuter.classList.contains('has-spin')) mainOuter.classList.toggle('is-zoomed');
        });
      } else {
        setFrame(0);
      }
      // Posição da bolinha na linha (0–100%) mapeia diretamente para o
      // frame do spin — arrastar em qualquer ponto da linha ou da bolinha
      // faz o mesmo efeito.
      const setFromClientX = (clientX) => {
        const rect = spinTrack.getBoundingClientRect();
        const ratio = rect.width ? (clientX - rect.left) / rect.width : 0;
        setFrame(Math.round(Math.min(1, Math.max(0, ratio)) * lastIndex));
      };
      let dragging = false;
      spinTrack?.addEventListener('pointerdown', (e) => {
        dragging = true;
        spinTrack.setPointerCapture(e.pointerId);
        setFromClientX(e.clientX);
      });
      spinTrack?.addEventListener('pointermove', (e) => { if (dragging) setFromClientX(e.clientX); });
      spinTrack?.addEventListener('pointerup', () => { dragging = false; });
    } else {
      if (spinSlider) spinSlider.style.display = 'none';
      mainOuter.addEventListener('click', () => mainOuter.classList.toggle('is-zoomed'));
    }

    const sizesEl = $('#pdp-sizes');
    const esgotado = p.availability === 'esgotado';
    sizesEl.innerHTML = ['S', 'M', 'L', 'XL'].map(s => {
      const avail = p.sizes.includes(s) && !esgotado;
      return `<button class="size-chip${avail ? '' : ' is-disabled'}" ${avail ? '' : 'disabled'}>${s}</button>`;
    }).join('');
    $$('.size-chip', sizesEl).forEach(chip => chip.addEventListener('click', () => {
      if (chip.disabled) return;
      $$('.size-chip', sizesEl).forEach(c => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
    }));
    if (esgotado) {
      $('#pdp-stock-note').style.display = 'block';
      $('#pdp-stock-note').textContent = 'Esgotado nesta seleção de tamanhos — nova reposição em breve.';
    } else if (p.availability === 'ultimas-unidades') {
      $('#pdp-stock-note').style.display = 'block';
      $('#pdp-stock-note').textContent = 'Últimas unidades disponíveis nesta referência.';
    }

    const versionWrap = $('#version-toggle');
    let selectedVersion = 'Adepto';
    if (versionWrap) {
      $$('.version-toggle button', versionWrap).forEach(btn => btn.addEventListener('click', () => {
        $$('.version-toggle button', versionWrap).forEach(b => b.classList.remove('is-selected'));
        btn.classList.add('is-selected');
        selectedVersion = btn.textContent.trim();
      }));
    }

    const nameInput = $('#custom-name');
    const numInput = $('#custom-number');
    const playerPreset = $('#player-preset');
    playerPreset?.addEventListener('change', () => {
      if (!playerPreset.value) return;
      const [name, number] = playerPreset.value.split('|');
      if (nameInput) nameInput.value = name;
      if (numInput) numInput.value = number;
      updatePdpPrice();
    });

    let selectedBadge = '';
    $$('.badge-chip', $('#badge-options')).forEach((chip) => chip.addEventListener('click', () => {
      $$('.badge-chip', $('#badge-options')).forEach((c) => c.classList.remove('is-selected'));
      chip.classList.add('is-selected');
      selectedBadge = chip.dataset.badge || '';
      updatePdpPrice();
    }));

    function updatePdpPrice() {
      const hasPersonalization = !!((nameInput?.value || '').trim() || (numInput?.value || '').trim());
      const finalPrice = p.price + (hasPersonalization ? 8 : 0) + (selectedBadge ? 2.9 : 0);
      $('#pdp-price').innerHTML = `<span>${euro(finalPrice)}</span>${p.was ? `<span class="was">${euro(p.was)}</span>` : ''}`;
      if ($('#pdp-sticky-price')) $('#pdp-sticky-price').textContent = euro(finalPrice);
    }
    nameInput?.addEventListener('input', updatePdpPrice);
    numInput?.addEventListener('input', updatePdpPrice);

    // Montador de conjuntos: cada espaço permite escolher a referência e
    // o tamanho; o checkout continua a decidir a promoção de maior valor.
    const bundleSlots = $('#bundle-slots');
    const bundleSummary = $('#bundle-summary');
    let bundleCount = 3;
    const tierPay = { 3: 2, 6: 3, 9: 4 };
    const productOptions = (selectedId) => LWD.PRODUCTS.map((item) =>
      `<option value="${item.id}"${item.id === selectedId ? ' selected' : ''}>${LWD.fullName(item)}</option>`).join('');
    const sizeOptions = (product, selectedSize) => product.sizes.map((size) =>
      `<option value="${size}"${size === selectedSize ? ' selected' : ''}>${size}</option>`).join('');
    function renderBundleSlots() {
      if (!bundleSlots) return;
      bundleSlots.innerHTML = Array.from({ length: bundleCount }, (_, i) => {
        const item = i === 0 ? p : LWD.PRODUCTS[(LWD.PRODUCTS.indexOf(p) + i) % LWD.PRODUCTS.length];
        return `<div class="bundle-slot" data-slot="${i}">
          <span>${String(i + 1).padStart(2, '0')}</span>
          <label>Camisa<select class="bundle-product">${productOptions(item.id)}</select></label>
          <label>Tamanho<select class="bundle-size">${sizeOptions(item, item.sizes[0])}</select></label>
        </div>`;
      }).join('');
      $$('.bundle-product', bundleSlots).forEach((select) => select.addEventListener('change', () => {
        const item = LWD.getProduct(select.value);
        const sizeSelect = $('.bundle-size', select.closest('.bundle-slot'));
        if (item && sizeSelect) sizeSelect.innerHTML = sizeOptions(item, item.sizes[0]);
      }));
      if (bundleSummary) bundleSummary.textContent = `${bundleCount} camisolas · paga ${tierPay[bundleCount]}`;
    }
    $$('#bundle-qty button').forEach((button) => button.addEventListener('click', () => {
      $$('#bundle-qty button').forEach((b) => b.classList.remove('is-selected'));
      button.classList.add('is-selected');
      bundleCount = Number(button.dataset.count) || 3;
      renderBundleSlots();
    }));
    $('#bundle-add')?.addEventListener('click', () => {
      const selections = $$('.bundle-slot', bundleSlots).map((slot) => ({
        productId: $('.bundle-product', slot).value,
        size: $('.bundle-size', slot).value,
      }));
      selections.forEach((item) => addLineToCart({ ...item, customName: '', version: 'Adepto', badge: '' }));
      showToast(`Conjunto de ${selections.length} camisolas adicionado`);
      openOverlay(cartDrawer);
    });
    renderBundleSlots();

    const reviews = CUSTOMER_REVIEWS;
    const reviewsGrid = $('#pdp-reviews-grid');
    if (reviewsGrid) {
      reviewsGrid.innerHTML = reviews.map(([title, body], i) => `<article class="review-card" aria-label="Avaliação ${i + 1} de ${reviews.length}">
        <div class="review-stars" aria-label="5 estrelas">★★★★★</div><h4>${title}</h4><p>${body}</p>
        <div class="review-brand">CLIENTE LOW WEAR</div></article>`).join('');
      const ratingLink = $('#pdp-rating-link');
      if (ratingLink) ratingLink.style.display = 'inline-flex';
      if ($('#pdp-rating-count')) $('#pdp-rating-count').textContent = `${reviews.length} avaliações`;
      const viewport = $('.reviews-viewport');
      const progress = $('#reviews-progress-fill');
      const updateReviewProgress = () => {
        if (!viewport || !progress) return;
        const max = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
        progress.style.width = `${Math.max(12, ((viewport.scrollLeft / max) * 88) + 12)}%`;
      };
      const moveReviews = (direction) => {
        if (!viewport) return;
        const card = $('.review-card', viewport);
        const step = card ? card.getBoundingClientRect().width + 16 : viewport.clientWidth;
        const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
        if (direction > 0 && atEnd) viewport.scrollTo({ left: 0, behavior: 'smooth' });
        else viewport.scrollBy({ left: step * direction, behavior: 'smooth' });
      };
      $('#reviews-prev')?.addEventListener('click', () => moveReviews(-1));
      $('#reviews-next')?.addEventListener('click', () => moveReviews(1));
      viewport?.addEventListener('scroll', updateReviewProgress, { passive: true });
      let reviewTimer = null;
      const startReviews = () => {
        if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        clearInterval(reviewTimer);
        reviewTimer = setInterval(() => moveReviews(1), 4200);
      };
      const stopReviews = () => clearInterval(reviewTimer);
      viewport?.addEventListener('pointerenter', stopReviews);
      viewport?.addEventListener('pointerleave', startReviews);
      viewport?.addEventListener('touchstart', stopReviews, { passive: true });
      viewport?.addEventListener('touchend', startReviews, { passive: true });
      updateReviewProgress();
      startReviews();
    }

    const pdpTabs = $$('.pdp-tab-btn');
    pdpTabs.forEach(btn => btn.addEventListener('click', () => {
      pdpTabs.forEach(b => b.classList.remove('is-active'));
      $$('.pdp-tab-panel').forEach(pn => pn.classList.remove('is-active'));
      btn.classList.add('is-active');
      $(`#tab-${btn.dataset.tab}`)?.classList.add('is-active');
    }));
    function buildPdpProduct() {
      const selected = $('.size-chip.is-selected', sizesEl);
      if (!selected) { showToast('Escolha um tamanho'); return null; }
      let custom = '';
      if (nameInput?.value || numInput?.value) custom = `${nameInput.value.toUpperCase()} ${numInput.value}`.trim();
      return {
        id: p.id, name: LWD.fullName(p), type: LWD.TYPE_LABEL[p.type],
        price: p.price + (custom ? 8 : 0) + (selectedBadge ? 2.9 : 0), size: selected.textContent.trim(),
        custom, version: versionWrap ? selectedVersion : 'Adepto', badge: selectedBadge,
        media: gallery[0],
      };
    }
    const addBtn = $('#pdp-add-cart');
    const buyBtn = $('#pdp-buy-now');
    const runAdd = (btn, { goToCheckout }) => {
      const item = buildPdpProduct();
      if (!item) return;
      if (p.availability === 'esgotado') { showToast('Este produto está esgotado.'); return; }
      addLineToCart({ productId: p.id, size: item.size, customName: item.custom, version: item.version, badge: item.badge });
      if (goToCheckout) {
        $('#checkout-btn')?.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
      } else {
        showToast(`${LWD.fullName(p)} adicionada ao carrinho`);
        openOverlay(cartDrawer);
      }
    };
    addBtn?.addEventListener('click', () => runAdd(addBtn, { goToCheckout: false }));
    buyBtn?.addEventListener('click', () => runAdd(buyBtn, { goToCheckout: true }));

    // Barra fixa de compra: aparece quando os botões principais deixam de
    // estar visíveis e mantém produto, preço, tamanho e ação sempre à mão.
    const stickyBuy = $('#pdp-sticky-buy');
    const stickySize = $('#pdp-sticky-size');
    if (stickyBuy && stickySize) {
      $('#pdp-sticky-name').textContent = p.name;
      $('#pdp-sticky-price').textContent = euro(p.price);
      $('#pdp-sticky-thumb').innerHTML = LWD.productMedia(p);
      stickySize.innerHTML = `<option value="">Tamanho</option>${p.sizes.map((s) => `<option value="${s}">${s}</option>`).join('')}`;
      $$('.size-chip', sizesEl).forEach((chip) => chip.addEventListener('click', () => { stickySize.value = chip.textContent.trim(); }));
      stickySize.addEventListener('change', () => {
        $$('.size-chip', sizesEl).forEach((chip) => chip.classList.toggle('is-selected', chip.textContent.trim() === stickySize.value));
      });
      $('#pdp-sticky-add')?.addEventListener('click', () => runAdd($('#pdp-sticky-add'), { goToCheckout: false }));
      const actions = $('.pdp-actions');
      const observer = actions && 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && window.scrollY > actions.offsetTop;
        stickyBuy.classList.toggle('is-visible', show);
        stickyBuy.setAttribute('aria-hidden', String(!show));
      }, { threshold: 0.05 }) : null;
      if (observer) observer.observe(actions);
    }

    const favBtn = $('#pdp-fav-btn');
    if (favBtn) {
      favBtn.classList.toggle('is-active', favs.includes(p.id));
      favBtn.addEventListener('click', () => { toggleFav(p.id); favBtn.classList.toggle('is-active', favs.includes(p.id)); });
    }

    $$('.js-team-name').forEach(el => el.textContent = team.name);
    const related = LWD.getProductsByTeam(p.teamSlug).filter(rp => rp.id !== p.id).slice(0, 4);
    const relatedGrid = $('#related-grid');
    if (relatedGrid) {
      relatedGrid.innerHTML = related.map(productCardHTML).join('');
      wireProductGrid(relatedGrid);
    }
  }
  function initHomeReviews() {
    const track = $('#home-reviews-track');
    const viewport = $('#home-reviews-viewport');
    const progress = $('#home-reviews-progress');
    if (!track || !viewport || !progress) return;

    track.innerHTML = CUSTOMER_REVIEWS.map(([title, body], i) => `<article class="review-card" aria-label="Avaliação ${i + 1} de ${CUSTOMER_REVIEWS.length}">
      <div class="review-stars" aria-label="5 estrelas">★★★★★</div><h4>${title}</h4><p>${body}</p>
      <div class="review-brand">CLIENTE LOW WEAR</div></article>`).join('');

    const updateProgress = () => {
      const max = Math.max(1, viewport.scrollWidth - viewport.clientWidth);
      progress.style.width = `${Math.max(12, ((viewport.scrollLeft / max) * 88) + 12)}%`;
    };
    const move = (direction) => {
      const card = $('.review-card', viewport);
      const step = card ? card.getBoundingClientRect().width + 16 : viewport.clientWidth;
      const atEnd = viewport.scrollLeft + viewport.clientWidth >= viewport.scrollWidth - 8;
      if (direction > 0 && atEnd) viewport.scrollTo({ left: 0, behavior: 'smooth' });
      else viewport.scrollBy({ left: step * direction, behavior: 'smooth' });
    };
    $('#home-reviews-prev')?.addEventListener('click', () => move(-1));
    $('#home-reviews-next')?.addEventListener('click', () => move(1));
    viewport.addEventListener('scroll', updateProgress, { passive: true });

    let timer = null;
    const stop = () => clearInterval(timer);
    const start = () => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      stop();
      timer = setInterval(() => move(1), 4200);
    };
    viewport.addEventListener('pointerenter', stop);
    viewport.addEventListener('pointerleave', start);
    viewport.addEventListener('touchstart', stop, { passive: true });
    viewport.addEventListener('touchend', start, { passive: true });
    updateProgress();
    start();
  }

  /* ---------------- boot ---------------- */
  renderTeamGrid($('#team-grid'));
  renderWeeklySpotlight($('#spotlight-grid'));
  renderPortugalSection();
  if ($('#catalog-grid')) renderCatalog();
  initTeamPage();
  initProductPage();
  initHomeReviews();
  updateCounts();
  observeReveals();
  renderCart();

  window.LowWear = { toggleFav, openOverlay, closeAllOverlays };
})();

