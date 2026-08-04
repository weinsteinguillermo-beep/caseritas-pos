"use strict";

window.CaseritasDemo = (() => {
  const products = [
    { id: "demo-papas", name: "Papas rusticas", barcode: "7790001000012", price: 180, weight: 1, stock: 12 },
    { id: "demo-milanesa", name: "Milanesa de pollo", barcode: "7790001000029", price: 240, weight: 0.5, stock: 8 },
    { id: "demo-empanadas", name: "Empanadas surtidas", barcode: "7790001000036", price: 95, weight: 1, stock: 20 },
  ];

  function wait(ms) {
    if (stopRequested) return Promise.resolve();
    return new Promise((resolve) => {
      activeResolve = resolve;
      activeTimer = window.setTimeout(() => {
        activeTimer = null;
        activeResolve = null;
        resolve();
      }, ms);
    });
  }

  function requestStop() {
    stopRequested = true;
    if (activeTimer) {
      window.clearTimeout(activeTimer);
      activeTimer = null;
    }
    if (activeResolve) {
      const resolve = activeResolve;
      activeResolve = null;
      resolve();
    }
  }
  const money = (value) => (window.CaseritasUtils ? CaseritasUtils.money(value) : "$" + Math.round(value));
  const escapeHtml = (value) => window.CaseritasUtils ? CaseritasUtils.escapeHtml(String(value || "")) : String(value || "");

  let running = false;
  let stopRequested = false;
  let activeTimer = null;
  let activeResolve = null;
  let ticket = null;

  function totals(cart, cashReceived = 0) {
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    return { subtotal, discountAmount: 0, total: subtotal, change: Math.max(0, Number(cashReceived || 0) - subtotal) };
  }

  function setStatus(context, text, type = "success") {
    if (!context.operationStatus) return;
    context.operationStatus.className = "operation-bar " + type;
    context.operationStatus.textContent = text;
  }

  function setHeader(context, text, state = "online") {
    if (context.terminalContext) context.terminalContext.textContent = text;
    if (context.terminalServer) {
      context.terminalServer.dataset.state = state === "online" ? "online" : "warning";
      context.terminalServer.textContent = state === "online" ? "Demo Online" : "Demo";
    }
  }

  function showSalePanel(context) {
    context.openPanel && context.openPanel.classList.add("hidden");
    context.salePanel && context.salePanel.classList.remove("hidden");
    context.closeCashButton && context.closeCashButton.classList.add("hidden");
    context.shiftSalesButton && context.shiftSalesButton.classList.add("hidden");
  }

  async function typeSearch(input, text) {
    input.value = "";
    input.focus();
    for (const char of text) {
      if (stopRequested) return;
      input.value += char;
      await wait(95);
    }
  }

  function renderProducts(ui, addProduct) {
    ui.els.productList.textContent = "";
    ui.els.productCount.textContent = products.length + " productos demo";
    products.forEach((product, index) => {
      const card = ui.createEl("article", { className: "product-card demo-product-card" });
      card.style.animationDelay = index * 80 + "ms";
      const meta = ui.createEl("div", { className: "product-meta" });
      meta.append(
        ui.createEl("span", { text: product.barcode }),
        ui.createEl("strong", { text: money(product.price) }),
        ui.createEl("span", { text: "Stock " + product.stock })
      );
      const button = ui.createEl("button", { text: "Agregar", type: "button" });
      button.addEventListener("click", () => addProduct(product));
      card.append(ui.createEl("h4", { text: product.name }), meta, button);
      ui.els.productList.append(card);
    });
  }

  function renderCart(ui, cart, cashReceived = 0) {
    const currentTotals = totals(cart, cashReceived);
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    ui.els.cartItems.textContent = "";
    ui.els.cartCount.textContent = itemCount + (itemCount === 1 ? " articulo" : " articulos");

    if (!cart.length) {
      ui.els.cartItems.append(ui.createEl("div", { className: "empty-cart", text: "Demo preparando venta..." }));
    } else {
      cart.forEach((item) => {
        const row = ui.createEl("article", { className: "cart-item demo-cart-item" });
        const top = ui.createEl("div", { className: "cart-item-top" });
        const details = ui.createEl("div");
        details.append(ui.createEl("h4", { text: item.name }), ui.createEl("span", { text: item.quantity + " x " + money(item.price) }));
        top.append(details, ui.createEl("strong", { text: money(item.price * item.quantity) }));
        const actions = ui.createEl("div", { className: "cart-actions" });
        actions.append(ui.createEl("button", { type: "button", text: "-" }), ui.createEl("span", { text: item.quantity }), ui.createEl("button", { type: "button", text: "+" }));
        row.append(top, actions);
        ui.els.cartItems.append(row);
      });
    }

    ui.renderTotals(currentTotals);
    ui.els.chargeButton.disabled = cart.length === 0;
    ui.els.chargeButton.dataset.loading = "false";
    ui.els.chargeButton.textContent = cart.length ? "COBRAR - " + money(currentTotals.total) : "Agrega productos";
  }

  function addOrIncrease(cart, product, quantity = 1) {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) existing.quantity += quantity;
    else cart.push({ ...product, quantity });
  }

  function setPayment(ui, method, cashReceived) {
    ui.els.paymentInputs.forEach((input) => { input.checked = input.value === method; });
    ui.setPaymentUI(method);
    ui.els.cashReceived.value = method === "cash" ? String(cashReceived) : "";
  }

  function removeTicket() {
    if (ticket) ticket.remove();
    ticket = null;
  }

  function showTicket(cart, total, cashReceived) {
    removeTicket();
    ticket = document.createElement("div");
    ticket.className = "demo-ticket-backdrop";
    const lines = cart.map((item) => `<div><span>${escapeHtml(item.name)} x${item.quantity}</span><strong>${money(item.price * item.quantity)}</strong></div>`).join("");
    ticket.innerHTML = `
      <section class="demo-ticket" role="dialog" aria-modal="true" aria-label="Ticket de demostracion">
        <p class="eyebrow">Ticket demo</p>
        <h2>Venta confirmada</h2>
        <div class="demo-ticket-lines">${lines}</div>
        <div class="total-line final"><span>Total</span><strong>${money(total)}</strong></div>
        <div class="total-line"><span>Pago</span><strong>Efectivo ${money(cashReceived)}</strong></div>
        <div class="total-line"><span>Vuelto</span><strong>${money(cashReceived - total)}</strong></div>
        <div class="demo-dashboard-line">Dashboard demo actualizado: venta, caja y stock.</div>
      </section>
    `;
    document.body.append(ticket);
  }

  function resetDemoScreen(context) {
    removeTicket();
    context.ui.resetSaleControls();
    context.ui.els.searchInput.value = "";
    context.customerNameInput.value = "Consumidor final";
    context.ui.showMessage("Demo reiniciada. Preparando nueva venta.", "success");
    renderProducts(context.ui, () => {});
    renderCart(context.ui, []);
  }

  async function restoreProduction(context) {
    removeTicket();
    document.body.classList.remove("demo-mode-active");
    context.terminal && context.terminal.classList.remove("demo-running");
    if (context.demoButton) context.demoButton.textContent = "Ver demostración";
    if (context.customerNameInput) context.customerNameInput.value = "";
    context.ui.resetSaleControls();
    context.ui.clearSearch();
    context.renderCart();
    await context.loadProducts("", { keepMessage: true, force: true });
    context.renderOperationalState(context.appState.snapshot());
  }

  async function playSale(context) {
    const cart = [];
    const cashReceived = 700;
    showSalePanel(context);
    setHeader(context, "Caja 01 - Victoria - Demo", "online");
    setStatus(context, "Demo: caja abierta, online y cajero activo.", "success");
    context.ui.showMessage("Modo demo iniciado. No se usa backend ni se guardan datos reales.", "success");
    context.customerNameInput.value = "Consumidor final";
    renderCart(context.ui, cart);
    await wait(500);

    await typeSearch(context.ui.els.searchInput, "papas");
    if (stopRequested) return;
    renderProducts(context.ui, (product) => { addOrIncrease(cart, product); renderCart(context.ui, cart); });
    await wait(700);

    addOrIncrease(cart, products[0]);
    renderCart(context.ui, cart);
    setStatus(context, "Demo: producto agregado al carrito.", "success");
    await wait(850);
    if (stopRequested) return;

    addOrIncrease(cart, products[1]);
    renderCart(context.ui, cart);
    setStatus(context, "Demo: segundo producto agregado.", "success");
    await wait(850);
    if (stopRequested) return;

    addOrIncrease(cart, products[0]);
    renderCart(context.ui, cart);
    setStatus(context, "Demo: cantidad modificada.", "success");
    await wait(850);
    if (stopRequested) return;

    setPayment(context.ui, "cash", cashReceived);
    renderCart(context.ui, cart, cashReceived);
    setStatus(context, "Demo: forma de pago seleccionada.", "success");
    await wait(900);
    if (stopRequested) return;

    context.ui.els.chargeButton.dataset.loading = "true";
    context.ui.els.chargeButton.textContent = "Cobrando demo...";
    await wait(900);
    if (stopRequested) return;

    const currentTotals = totals(cart, cashReceived);
    showTicket(cart, currentTotals.total, cashReceived);
    setStatus(context, "Demo: venta, stock, caja y dashboard actualizados.", "success");
    context.ui.showMessage("Ticket demo generado. Reinicio automatico en 5 segundos.", "success");
    await wait(5000);
  }

  async function run(context) {
    if (running) {
      requestStop();
      return;
    }

    running = true;
    stopRequested = false;
    const terminal = document.querySelector(".pos-terminal");
    const runContext = { ...context, terminal };

    try {
      document.body.classList.add("demo-mode-active");
      terminal && terminal.classList.add("demo-running");
      context.demoButton.textContent = "Detener demo";

      while (!stopRequested && document.body.contains(context.demoButton)) {
        await playSale(runContext);
        if (!stopRequested && document.body.contains(context.demoButton)) resetDemoScreen(runContext);
      }
    } finally {
      await restoreProduction(runContext);
      running = false;
      stopRequested = false;
      activeTimer = null;
      activeResolve = null;
    }
  }

  return { run, products };
})();
