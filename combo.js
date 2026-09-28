/* Low Wear — combos fixos "2 por 79 €".
   combo.html?c=<id>   → um combo (selecao, flamengo, portugal)
   combo.html?c=todos  → Brasil e Portugal lado a lado (para anúncios com os dois combos)
   O preço é aplicado pelo servidor (PAIR_CONFIG em api/_catalog.js do
   backend): aqui só se escolhem os tamanhos e se vai direto ao checkout,
   sem mexer no carrinho que o cliente já tenha guardado. */
(() => {
  const D = window.LowWearData;
  const root = document.getElementById('combo-root');
  if (!D || !root) return;

  const COMBOS = {
    selecao: {
      name: 'Combo Seleção Brasileira', short: 'Brasil', kicker: 'Camisa amarela + camisa azul',
      ids: ['sel-principal-24', 'sel-alt-24'],
      lead: 'As duas cores da Seleção num só pedido. A amarela para o dia de jogo, a azul para o resto da semana.',
    },
    flamengo: {
      name: 'Combo Flamengo', short: 'Flamengo', kicker: 'Manto Rubro-Negro + Manto Branco',
      ids: ['fla-principal-24', 'fla-alt-24'],
      lead: 'O Manto Rubro-Negro e o Branco juntos, com entrega em Portugal. Uma vez Flamengo, sempre Flamengo.',
    },
    portugal: {
      name: 'Combo Seleção Portuguesa', short: 'Portugal', kicker: 'Camisola vermelha + alternativa',
      ids: ['por-principal-24', 'por-alt-24'],
      lead: 'As duas camisolas de Portugal. Uma para ti e outra para oferecer, ou as duas para o armário.',
    },
  };
  const MULTI = ['selecao', 'portugal'];

  const $ = sel => document.querySelector(sel);
  const euro = D.euro;
  const priceCents = (D.PAIR_CONFIG && D.PAIR_CONFIG.priceCents) || 7900;
  const itemsOf = id => COMBOS[id].ids.map(pid => D.getProduct(pid)).filter(Boolean);
  const sepOf = items => items.reduce((s, p) => s + Math.round(p.price * 100), 0);
  const track = (name, params) => {
    if (typeof window.fbq === 'function') window.fbq('track', name, params,
      { eventID: name + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10) });
  };

  const key = new URLSearchParams(location.search).get('c');
  const multi = key === 'todos';
  const id = multi ? null : (COMBOS[key] ? key : 'selecao');
  const shown = multi ? MULTI : [id];

  document.head.insertAdjacentHTML('beforeend', `<style id="lw-combo-multi">
    .combo-cards{display:grid;grid-template-columns:1fr 1fr;gap:22px;align-items:start}
    .combo-cards.is-single{grid-template-columns:1.25fr 1fr;gap:36px}
    .combo-card{display:grid;gap:16px}
    .combo-cards:not(.is-single) .combo-card{background:var(--bg-raise);border:1px solid var(--line-strong);border-radius:var(--radius-m);padding:18px}
    .combo-cards:not(.is-single) .combo-panel{background:transparent;border:0;padding:0}
    .combo-card-head{display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap}
    .combo-card-head h2{font-family:var(--font-display);font-size:40px;line-height:1;margin:0;letter-spacing:.02em}
    .combo-card-head span{font-family:var(--font-mono);font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:var(--accent)}
    .combo-cards:not(.is-single) .combo-price strong{font-size:52px}
    @media (max-width:860px){.combo-cards,.combo-cards.is-single{grid-template-columns:1fr;gap:20px}}
  </style>`);

  // cabeçalho da página
  if (multi) {
    document.title = 'Combos 2 por 79 € · Brasil e Portugal | Low Wear';
    $('#combo-kicker').textContent = 'Escolhe o teu combo';
    $('#combo-title').textContent = '2 camisolas por 79 €';
    $('#combo-lead').textContent = 'Seleção Brasileira ou Seleção Portuguesa: escolhe o combo, os tamanhos e paga. Portes grátis para todo Portugal.';
  } else {
    const c = COMBOS[id];
    document.title = c.name + ' · 2 por 79 € | Low Wear';
    $('#combo-kicker').textContent = 'Combo · ' + c.kicker;
    $('#combo-title').textContent = c.name;
    $('#combo-lead').textContent = c.lead;
  }

  const grid = root.querySelector('.combo-grid');
  grid.className = 'combo-cards' + (multi ? '' : ' is-single');

  const cardHTML = (cid) => {
    const c = COMBOS[cid], items = itemsOf(cid), sep = sepOf(items);
    const shirts = `<div class="combo-shirts">${items.map(p => `<figure class="combo-shirt">
        <a href="produto.html?id=${p.id}" aria-label="Ver ${D.fullName(p)}">${D.productMedia(p)}</a>
        <p>${p.name}</p></figure>`).join('')}<span class="combo-plus" aria-hidden="true">+</span></div>`;
    const panel = `<div class="combo-panel">
        <div class="combo-price"><strong>79 €</strong><s>Em separado ${euro(sep / 100)}</s><span>Poupa ${euro((sep - priceCents) / 100)}</span></div>
        <div class="combo-sizes">${items.map((p, i) => `<div class="combo-size-row" data-row="${i}">
            <label id="sz-${cid}-${i}">Tamanho · ${p.name}</label>
            <div class="chips" role="group" aria-labelledby="sz-${cid}-${i}">
              ${p.sizes.map(s => `<button type="button" data-size="${s}" aria-pressed="false">${s}</button>`).join('')}
            </div></div>`).join('')}
          <p class="combo-alt" style="margin:0">Em dúvida entre dois tamanhos? Escolha o maior. <a href="#" data-open-size-guide>Guia de tamanhos</a></p>
        </div>
        <button type="button" class="btn btn-primary combo-buy">Comprar as 2 por 79 €</button>
        <p class="combo-msg" role="status" aria-live="polite"></p>
        ${multi ? '' : `<ul class="combo-trust">
          <li>Portes grátis para Portugal</li>
          <li>Entrega em até 5 dias úteis, com rastreio</li>
          <li>Paga com MB WAY, cartão ou Klarna</li>
          <li>Trocas de tamanho em 14 dias</li>
        </ul>
        <p class="combo-alt">Prefere escolher as suas? <a href="index.html#catalogo">Quaisquer 2 camisolas por 79 € →</a></p>`}
      </div>`;
    const head = multi ? `<div class="combo-card-head"><h2>${c.short}</h2><span>${c.kicker}</span></div>` : '';
    return `<article class="combo-card" data-combo="${cid}">${head}${shirts}${panel}</article>`;
  };

  const available = shown.filter(cid => itemsOf(cid).length === 2);
  if (!available.length) { grid.innerHTML = '<p class="combo-msg">Este combo não está disponível de momento.</p>'; return; }
  grid.innerHTML = multi ? available.map(cardHTML).join('')
    // um combo: fotos à esquerda e painel à direita, como antes
    : cardHTML(available[0]).replace('<article class="combo-card" data-combo="' + available[0] + '">', '').replace(/<\/article>$/, '');
  if (!multi) grid.setAttribute('data-combo', available[0]);

  if (multi) {
    const trust = document.createElement('ul');
    trust.className = 'combo-trust';
    trust.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px 22px;margin-top:20px';
    trust.innerHTML = '<li>Portes grátis para Portugal</li><li>Entrega em até 5 dias úteis, com rastreio</li><li>Paga com MB WAY, cartão ou Klarna</li><li>Trocas de tamanho em 14 dias</li>';
    grid.after(trust);
  }

  // outros combos
  $('#combo-others').innerHTML = Object.entries(COMBOS).filter(([k]) => !shown.includes(k))
    .map(([k, c]) => `<a href="combo.html?c=${k}"><b>${c.name}</b><span>${c.kicker} · 2 por 79 €</span></a>`).join('')
    + (multi ? '' : `<a href="combo.html?c=todos"><b>Ver todos os combos</b><span>Brasil e Portugal lado a lado</span></a>`);

  document.querySelectorAll('[data-open-size-guide]').forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    const g = document.querySelector('.site-footer .size-guide-link');
    if (g) g.click();
  }));

  const allIds = available.flatMap(cid => COMBOS[cid].ids);
  track('ViewContent', { content_ids: allIds, content_type: 'product',
    content_name: multi ? 'Combos Brasil e Portugal' : COMBOS[available[0]].name, value: priceCents / 100, currency: 'EUR' });

  // cada combo tem os seus tamanhos e o seu botão
  document.querySelectorAll('[data-combo]').forEach(box => {
    const cid = box.dataset.combo, items = itemsOf(cid), chosen = {};
    const msg = box.querySelector('.combo-msg'), buy = box.querySelector('.combo-buy');
    box.querySelectorAll('.combo-size-row').forEach(row => row.addEventListener('click', e => {
      const b = e.target.closest('button[data-size]');
      if (!b) return;
      row.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      chosen[row.dataset.row] = b.dataset.size;
      row.classList.remove('needs-size');
      msg.textContent = '';
    }));
    buy.addEventListener('click', async () => {
      const missing = items.map((_, i) => i).filter(i => !chosen[i]);
      if (missing.length) {
        missing.forEach(i => box.querySelector(`.combo-size-row[data-row="${i}"]`).classList.add('needs-size'));
        msg.textContent = 'Escolha o tamanho das duas camisolas.';
        box.querySelector(`.combo-size-row[data-row="${missing[0]}"]`).scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }
      buy.disabled = true; buy.textContent = 'A abrir o pagamento…';
      track('InitiateCheckout', { content_ids: items.map(p => p.id), content_type: 'product', num_items: 2,
        content_name: COMBOS[cid].name, value: priceCents / 100, currency: 'EUR' });
      try {
        const url = await D.Cart.checkout({ lines: items.map((p, i) => ({ productId: p.id, size: chosen[i], quantity: 1, customName: '', version: 'Adepto', badge: '' })) });
        location.href = url;
      } catch (err) {
        buy.disabled = false; buy.textContent = 'Comprar as 2 por 79 €';
        msg.textContent = 'Não foi possível abrir o pagamento. Tente outra vez ou fale connosco por email (Lowwear@gmail.com).';
      }
    });
  });
})();
