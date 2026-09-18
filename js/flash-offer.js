/* ============================================================
   Low Wear — Oferta Relâmpago Surpresa (DESATIVADA nesta versão)

   Esta funcionalidade escolhia um produto que tivesse um desconto
   automático configurado na Shopify (Shopify Admin → Descontos) e lia
   essa percentagem em tempo real da Shopify. Sem loja Shopify, essa
   fonte de descontos deixou de existir, por isso a oferta relâmpago
   está desligada por agora em vez de mostrar descontos inventados no
   browser (o que seria enganoso para o cliente).

   Para reativar esta funcionalidade sem a Shopify, seria preciso um
   pequeno painel/admin próprio para definir "produto X tem Y% de
   desconto entre estas datas" — dá para construir como próximo passo,
   ligado à mesma função de checkout em api/create-checkout-session.js
   (bastaria essa função também aceitar e validar um desconto por
   produto, tal como já valida os preços do catálogo).
   ============================================================ */
(() => {
  // Intencionalmente vazio: sem fonte real de desconto, não mostramos
  // nenhuma oferta relâmpago em vez de simular uma falsa.
})();
