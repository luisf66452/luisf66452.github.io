/* Low Wear — página de combos fixos "2 por 79 €" (combo.html?c=<id>).
   O preço é aplicado pelo servidor (PAIR_CONFIG em api/_catalog.js do
   backend): aqui só se escolhem os tamanhos e se vai direto ao checkout,
   sem mexer no carrinho que o cliente já tenha guardado. */
(() => {
  const D = window.LowWearData;
  const root = document.getElementById('combo-root');
  if (!D || !root) return;

  const COMBOS = {
    selecao: {
      name: 'Combo Seleção Brasileira', kicker: 'Amarelinha + Azul da Copa',
      ids: ['sel-principal-24', 'sel-alt-24'],
      lead: 'As duas cores da Seleção num só pedido. A amarela para o dia de jogo, a azul para o resto da semana.',
    },
    flamengo: {
      name: 'Combo Flamengo', kicker: 'Manto Rubro-Negro + Manto Branco',
      ids: ['fla-principal-24', 'fla-alt-24'],
      lead: 'O Manto Rubro-Negro e o Branco juntos, com entrega em Portugal. Uma vez Flamengo, sempre Flamengo.',
    },
    portugal: {
      name: 'Combo Seleção Portugal', kicker: 'Vermelha + Azul de Portugal',
      ids: ['por-principal-24', 'por-alt-24'],
      lead: 'As duas camisolas de Portugal. Uma para ti e outra para oferecer, ou as duas para o armário.',
    },
  };

  const key = new URLSearchParams(location.search).get('c');
  const id = COMBOS[key] ? key : 'selecao';
  const combo = COMBOS[id];
  const items = combo.ids.map(pid => D.getProduct(pid)).filter(Boolean);
  const $ = sel => document.querySelector(sel);
  const euro = D.euro;
  if (items.length !== 2) { $('#combo-msg').textContent = 'Este combo não está disponível de momento.'; $('#combo-buy').disabled = true; return; }

  const priceCents = (D.PAIR_CONFIG && D.PAIR_CONFIG.priceCents) || 7900;
  const sepCents = items.reduce((s, p) => s + Math.round(p.price * 100), 0);
  document.title = combo.name + ' · 2 por 79 € | Low Wear';
  $('#combo-kicker').textContent = 'Combo · ' + combo.kicker;
  $('#combo-title').textContent = combo.name;
  $('#combo-lead').textContent = combo.lead;
  $('#combo-was').textContent = 'Em separado ' + euro(sepCents / 100);
  $('#combo-save').textContent = 'Poupa ' + euro((sepCents - priceCents) / 100);

  $('#combo-shirts').innerHTML = items.map(p => `<figure class="combo-shirt">
      <a href="produto.html?id=${p.id}" aria-label="Ver ${D.fullName(p)}">${D.productMedia(p)}</a>
      <p>${p.name}</p></figure>`).join('') + '<span class="combo-plus" aria-hidden="true">+</span>';

  const chosen = {};
  $('#combo-sizes').innerHTML = items.map((p, i) => `<div class="combo-size-row" data-row="${i}">
      <label id="combo-size-label-${i}">Tamanho · ${p.name}</label>
      <div class="chips" role="group" aria-labelledby="combo-size-label-${i}">
        ${p.sizes.map(s => `<button type="button" data-size="${s}" aria-pressed="false">${s}</button>`).join('')}
      </div></div>`).join('') + '<p class="combo-alt" style="margin:0">Em dúvida entre dois tamanhos? Escolha o maior. <a href="#" data-open-size-guide>Guia de tamanhos</a></p>';
  document.querySelectorAll('.combo-size-row').forEach(row => {
    row.addEventListener('click', e => {
      const b = e.target.closest('button[data-size]');
      if (!b) return;
      row.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
      chosen[row.dataset.row] = b.dataset.size;
      row.classList.remove('needs-size');
      $('#combo-msg').textContent = '';
    });
  });
  document.querySelector('[data-open-size-guide]')?.addEventListener('click', e => {
    e.preventDefault();
    const g = document.querySelector('.site-footer .size-guide-link');
    if (g) g.click(); else location.href = 'produto.html?id=' + items[0].id;
  });

  $('#combo-others').innerHTML = Object.entries(COMBOS).filter(([k]) => k !== id)
    .map(([k, c]) => `<a href="combo.html?c=${k}"><b>${c.name}</b><span>${c.kicker} · 2 por 79 €</span></a>`).join('');

  const track = (name, params) => {
    if (typeof window.fbq === 'function') window.fbq('track', name, params,
      { eventID: name + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10) });
  };
  const ids = items.map(p => p.id);
  track('ViewContent', { content_ids: ids, content_type: 'product', content_name: combo.name, value: priceCents / 100, currency: 'EUR' });

  const buy = $('#combo-buy');
  buy.addEventListener('click', async () => {
    const missing = items.map((_, i) => i).filter(i => !chosen[i]);
    if (missing.length) {
      missing.forEach(i => document.querySelector(`.combo-size-row[data-row="${i}"]`).classList.add('needs-size'));
      $('#combo-msg').textContent = 'Escolha o tamanho das duas camisolas.';
      document.querySelector(`.combo-size-row[data-row="${missing[0]}"]`).scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    buy.disabled = true; buy.textContent = 'A abrir o pagamento…';
    track('InitiateCheckout', { content_ids: ids, content_type: 'product', num_items: 2, value: priceCents / 100, currency: 'EUR' });
    try {
      const url = await D.Cart.checkout({ lines: items.map((p, i) => ({ productId: p.id, size: chosen[i], quantity: 1, customName: '', version: 'Adepto', badge: '' })) });
      location.href = url;
    } catch (err) {
      buy.disabled = false; buy.textContent = 'Comprar as 2 por 79 €';
      $('#combo-msg').textContent = 'Não foi possível abrir o pagamento. Tente outra vez ou fale connosco por email (Lowwear@gmail.com).';
    }
  });
})();
