const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
function frontend() {
  let sent;
  const context = { window: {}, localStorage: { getItem: () => null, setItem() {} },
    fetch: async (url, options) => { sent = JSON.parse(options.body); return { ok:true, json: async () => ({url:'https://checkout.stripe.com/test-stub'}) }; } };
  vm.runInNewContext(fs.readFileSync(path.join(root,'js/data.js'),'utf8'), context);
  return { data:context.window.LowWearData, sent:() => sent };
}
const now = Date.parse('2026-09-20T12:00:00Z');
const cart = quantity => ({lines:[{productId:'sel-principal-24',size:'M',quantity,unitPrice:0.01}]});
for (const [qty,free] of [[2,0],[3,1],[5,1],[6,3],[8,3],[9,5],[11,5],[12,7],[14,7],[15,9],[16,9]]) {
  test('cart tier ' + qty + ' ignores stale stored price', () => {
    const totals = frontend().data.Cart.totals(cart(qty),now);
    assert.equal(totals.freeUnits,free);
    assert.equal(totals.total,(qty-free)*5990/100);
  });
}
test('checkout preserves all units without client pricing', async () => {
  const app = frontend();
  await app.data.Cart.checkout(cart(15));
  assert.deepEqual(app.sent(), {lines:Array.from({length:15}, () => ({productId:'sel-principal-24',size:'M',quantity:1}))});
});
test('permanent tiers work after campaign expiry', () => {
  const totals = frontend().data.Cart.totals(cart(12), Date.parse('2027-01-01'));
  assert.equal(totals.freeUnits,7);
});
test('mixed prices and personalization', () => {
  const totals = frontend().data.Cart.totals({lines:[
    {productId:'sao-principal-24',quantity:1},
    {productId:'sel-principal-24',quantity:1},
    {productId:'ben-principal-24',quantity:1,customName:'ANA'},
  ]},now);
  assert.equal(totals.discount,57.9);
  assert.equal(totals.total,129.8);
});
test('cart UI shows the winning tier and discounted total', () => {
  const {data} = frontend();
  // Fixed date keeps this UI test independent of when it is run.
  const totals = data.Cart.totals;
  data.Cart.totals = cart => totals(cart, now);
  const main = fs.readFileSync(path.join(root,'js/main.js'),'utf8');
  const render = main.slice(main.indexOf('  function renderCart()'), main.indexOf('  // Códigos promocionais'));
  const progress = main.slice(main.indexOf('  function renderPromoProgress('), main.indexOf('  function updateCounts()'));
  const elements = Object.fromEntries(['#drawer-body','#drawer-foot','#drawer-totals','#cart-promo-progress'].map(id => [id,{style:{},innerHTML:''}]));
  const context = { LWD:data, cart:cart(9), euro:data.euro, $:id=>elements[id], renderCouponUI(){}, updateCounts(){} };
  vm.runInNewContext(render + progress + '\nrenderCart();',context);
  assert.match(elements['#drawer-totals'].innerHTML, /Leva 9, paga 4/);
  assert.ok(elements['#drawer-totals'].innerHTML.includes(data.euro(239.6)));
  assert.match(elements['#cart-promo-progress'].innerHTML,/5 camisola/);
  context.cart = cart(3);
  vm.runInNewContext('renderCart();',context);
  assert.match(elements['#cart-promo-progress'].innerHTML,/Leva 3, paga 2/);
  assert.doesNotMatch(elements['#cart-promo-progress'].innerHTML,/Faltam 3/);
});
