(() => {
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const LWD = window.LowWearData;
  const euro = LWD.euro;

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

  function addLineToCart({ productId, size, customName, version, badge, badgePrice }) {
    cart = LWD.Cart.addLine({ productId, size, quantity: 1, customName, version, badge, badgePrice });
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
      const extras = [line.version, line.customName ? `"${line.customName}"` : '', line.badge ? `Emblema ${line.badge}` : ''].filter(Boolean).join(' · ');
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
      const { subtotal } = LWD.Cart.totals(cart);
      totalsEl.innerHTML = `<div class="drawer-subtotal"><span>Total</span><strong>${euro(subtotal)}</strong></div>`;
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
    if (!LWD.isPromoActive()) { el.style.display = 'none'; el.innerHTML = ''; return; }

    const required = LWD.PROMO_CONFIG.requiredQuantity;
    const freeQty = LWD.PROMO_CONFIG.freeQuantity;

    const eligibleUnitPrices = [];
    lines.forEach((line) => {
      if (LWD.isPromoEligible(line.productId)) {
        for (let i = 0; i < line.quantity; i++) eligibleUnitPrices.push(line.unitPrice);
      }
    });
    const count = eligibleUnitPrices.length;
    el.style.display = 'block';

    if (count === 0) {
      el.innerHTML = `<p class="promo-progress-text">Adicione ${required} camisas participantes da promoção de inauguração para ativar "Escolha ${required}, pague ${required - freeQty}".</p>`;
      return;
    }
    if (count >= required) {
      const sorted = [...eligibleUnitPrices].sort((a, b) => a - b);
      const freeTotal = sorted.slice(0, freeQty).reduce((s, v) => s + v, 0);
      el.innerHTML = `
        <div class="promo-progress-active">
          <strong>🎉 PROMOÇÃO ATIVADA!</strong>
          <p>Escolheu ${count} camisas participantes${count > required ? ` — a promoção aplica-se às primeiras ${required}` : ''}, e vai pagar apenas pelas ${required - freeQty} de maior valor.</p>
          <p class="promo-progress-savings">Poupança estimada: ${euro(freeTotal)} <span class="promo-progress-note">(confirmada no checkout)</span></p>
        </div>`;
      return;
    }
    const remaining = required - count;
    const messages = {
      1: 'Ótima escolha! Adicione mais 5 camisas para ativar a promoção.',
      2: 'Faltam 4 camisas para desbloquear a promoção.',
      3: 'Faltam 3 camisas para desbloquear a promoção.',
      4: 'Faltam 2 camisas para desbloquear a promoção.',
      5: 'Falta apenas 1 camisa para ativar a oferta.',
    };
    el.innerHTML = `
      <p class="promo-progress-text">${messages[count] || `Faltam ${remaining} camisas para desbloquear a promoção.`}</p>
      <div class="promo-progress-bar"><div class="promo-progress-fill" style="width:${Math.min(100, (count / required) * 100)}%"></div></div>
      <a href="index.html#catalogo" class="btn btn-ghost btn-sm promo-progress-cta">ESCOLHER MAIS UMA</a>`;
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

    // ---- Avaliações (textos reais fornecidos pela loja, sem nomes/fotos inventados) ----
    const REVIEWS = [
      { title: 'Superou as expectativas!', body: 'Gostei das peças nas fotografias, mas ao vivo gostei ainda mais. Bons detalhes e um corte que resulta muito bem.' },
      { title: 'Estilo e conforto no dia a dia', body: 'Já usei várias vezes e sinto-me sempre confortável. São daquelas peças que acabam por sair do armário todas as semanas.' },
      { title: 'Tudo certo com a encomenda', body: 'Recebi os artigos que escolhi, bem apresentados e sem problemas. Foi a minha primeira compra na Low Wear e fiquei satisfeito.' },
      { title: 'Uma boa escolha para oferecer', body: 'Comprei uma peça para oferecer e acertei em cheio. A pessoa adorou o estilo e ficou logo a perguntar pela loja.' },
      { title: 'Gostei muito do corte!', body: 'Tinha algum receio de comprar roupa online, mas o tamanho ficou como queria. A peça funciona bem com vários looks.' },
    ];
    const ratingLink = $('#pdp-rating-link');
    if (ratingLink) {
      $('#pdp-rating-count').textContent = `${REVIEWS.length} avaliações`;
      ratingLink.style.display = 'inline-flex';
    }
    const reviewsGrid = $('#pdp-reviews-grid');
    if (reviewsGrid) {
      reviewsGrid.innerHTML = REVIEWS.map(r => `
        <div class="review-card">
          <div class="review-stars">★★★★★</div>
          <h4>${r.title}</h4>
          <p>${r.body}</p>
          <div class="review-brand">LOW WEAR</div>
        </div>`).join('');
    }

    // ---- Ícones de pagamento (mesmos métodos já assumidos no rodapé) ----
    const payEl = $('#pdp-payments');
    if (payEl) {
      payEl.innerHTML = ['Visa', 'Mastercard', 'PayPal'].map(m => `<span class="pay-chip">${m}</span>`).join('');
    }

    // ---- Tabela "Quanto mais levas, mais poupas" (informativa nesta página;
    // a aplicação real do desconto no pagamento depende da função do
    // servidor no repositório do checkout, tal como a promoção 6-por-3). ----
    const QTY_TIERS = [
      { leva: 3, paga: 2, off: 33 },
      { leva: 6, paga: 3, off: 50 },
      { leva: 9, paga: 4, off: 56 },
      { leva: 12, paga: 5, off: 58 },
      { leva: 15, paga: 6, off: 60 },
    ];
    const qtyTableEl = $('#qty-discount-table');
    if (qtyTableEl) {
      qtyTableEl.innerHTML = QTY_TIERS.map(t => `
        <div class="qty-tier">
          <span class="qty-tier-leva">Leva ${t.leva}</span>
          <span class="qty-tier-paga">Paga ${t.paga}</span>
          <span class="qty-tier-off">-${t.off}%</span>
        </div>`).join('');
    }

    const promoBadgeEl = $('#pdp-promo-badge');
    if (promoBadgeEl) {
      promoBadgeEl.innerHTML = (p.availability !== 'esgotado' && LWD.isPromoActive() && LWD.isPromoEligible(p.id))
        ? `<div class="promo-card-badge promo-pdp-badge">LEVE 6 · PAGUE 3</div>
           <p class="promo-pdp-note">Produto participante da promoção de inauguração. <a href="#" class="js-promo-how">Ver regras da promoção</a></p>`
        : '';
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
    thumbsEl.innerHTML = gallery.map((media, i) => `<button class="pdp-thumb${i === 0 ? ' is-active' : ''}${hasPhoto ? ' has-photo' : ''}" aria-label="Imagem ${i + 1}">${media}</button>`).join('');
    mainOuter.classList.toggle('has-photo', hasPhoto);
    mainEl.innerHTML = gallery[0];
    $$('.pdp-thumb', thumbsEl).forEach((thumb, i) => thumb.addEventListener('click', () => {
      $$('.pdp-thumb', thumbsEl).forEach(t => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
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
      setFrame(0);
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

    const badgeWrap = $('#badge-options');
    let selectedBadge = '';
    let selectedBadgePrice = 0;
    if (badgeWrap) {
      $$('.badge-chip', badgeWrap).forEach(chip => chip.addEventListener('click', () => {
        $$('.badge-chip', badgeWrap).forEach(c => c.classList.remove('is-selected'));
        chip.classList.add('is-selected');
        selectedBadge = chip.dataset.badge || '';
        selectedBadgePrice = parseFloat(chip.dataset.price || '0') || 0;
      }));
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
      const nameInput = $('#custom-name');
      const numInput = $('#custom-number');
      let custom = '';
      if (nameInput?.value || numInput?.value) custom = `${nameInput.value.toUpperCase()} ${numInput.value}`.trim();
      return {
        id: p.id, name: LWD.fullName(p), type: LWD.TYPE_LABEL[p.type],
        price: p.price + (custom ? 8 : 0) + selectedBadgePrice, size: selected.textContent.trim(),
        custom, version: versionWrap ? selectedVersion : '',
        badge: selectedBadge, badgePrice: selectedBadgePrice,
        media: gallery[0],
      };
    }
    const addBtn = $('#pdp-add-cart');
    const buyBtn = $('#pdp-buy-now');
    const runAdd = (btn, { goToCheckout }) => {
      const item = buildPdpProduct();
      if (!item) return;
      if (p.availability === 'esgotado') { showToast('Este produto está esgotado.'); return; }
      addLineToCart({ productId: p.id, size: item.size, customName: item.custom, version: item.version, badge: item.badge, badgePrice: item.badgePrice });
      if (goToCheckout) {
        $('#checkout-btn')?.dispatchEvent(new Event('click', { bubbles: true, cancelable: true }));
      } else {
        showToast(`${LWD.fullName(p)} adicionada ao carrinho`);
        openOverlay(cartDrawer);
      }
    };
    addBtn?.addEventListener('click', () => runAdd(addBtn, { goToCheckout: false }));
    buyBtn?.addEventListener('click', () => runAdd(buyBtn, { goToCheckout: true }));

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
  /* ---------------- boot ---------------- */
  renderTeamGrid($('#team-grid'));
  renderWeeklySpotlight($('#spotlight-grid'));
  renderPortugalSection();
  if ($('#catalog-grid')) renderCatalog();
  initTeamPage();
  initProductPage();
  updateCounts();
  observeReveals();
  renderCart();

  window.LowWear = { toggleFav, openOverlay, closeAllOverlays };
})();
