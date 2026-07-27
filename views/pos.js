"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.POS = {
  ui: null,
  searchDebounceTimer: null,
  unsubscribeState: null,
  abortController: null,
  closeInFlight: false,
  openingInFlight: false,

  render() {
    return `
      <section class="pos-terminal" aria-labelledby="terminal-title">
        <header class="terminal-header">
          <div>
            <p class="eyebrow">Terminal de venta</p>
            <h2 id="terminal-title">CASERITAS POS</h2>
            <p class="terminal-context" id="terminal-context">Caja cerrada - Sin cajero</p>
          </div>
          <div class="terminal-actions">
            <span class="status-pill" id="terminal-server-status" data-state="warning">Servidor pendiente</span>
            <button class="ghost-button" id="shift-sales-button" type="button">Ventas del turno</button>
            <button class="ghost-button danger-action" id="open-close-cash-button" type="button">Cerrar caja</button>
          </div>
        </header>

        <section class="operation-bar warning" id="global-status-bar" role="status" aria-live="polite">Preparando estado operativo...</section>

        <section class="open-shift-panel" id="open-shift-panel" aria-labelledby="open-shift-title">
          <div class="open-shift-card">
            <p class="eyebrow">Inicio de jornada</p>
            <h2 id="open-shift-title">Abrir caja</h2>
            <p class="terminal-note">Airtable queda como panel administrativo. Esta pantalla es solo para abrir caja y vender.</p>
            <form id="open-cash-form" class="modal-form" autocomplete="off">
              <div class="field-row stacked"><label for="cashier-name">Cajero</label><input id="cashier-name" type="text" maxlength="80" required placeholder="Nombre del cajero"></div>
              <div class="field-row stacked"><label for="cash-register-name">Caja</label><input id="cash-register-name" type="text" maxlength="80" required value="Caja principal"></div>
              <div class="field-row stacked"><label for="opening-fund">Fondo inicial</label><input id="opening-fund" type="number" min="0" step="1" value="0" required></div>
              <div class="message-area inline-message" id="open-cash-message" role="status" aria-live="polite"></div>
              <div class="modal-actions"><button class="primary-button terminal-primary" type="submit">Abrir caja</button></div>
            </form>
          </div>
        </section>

        <main class="layout pos-layout terminal-sale hidden" id="terminal-sale-panel">
          <section class="catalog-panel" aria-labelledby="sale-title">
            <div class="panel-heading">
              <div><p class="eyebrow">Venta</p><h2 id="sale-title">Buscar producto</h2></div>
              <button class="ghost-button" id="clear-sale-button" type="button" aria-label="Limpiar venta actual">Limpiar venta</button>
            </div>
            <form class="search-box" id="search-form" autocomplete="off">
              <label for="product-search">Producto o codigo de barras</label>
              <div class="search-row">
                <input id="product-search" name="productSearch" type="search" inputmode="search" placeholder="Ej: milanesa, empanada o 7790001000012" aria-describedby="search-help">
                <button type="submit">Agregar</button>
              </div>
              <p id="search-help">F2 Buscar producto - Enter Agregar - Esc Limpiar busqueda</p>
            </form>
            <div class="message-area" id="message-area" role="status" aria-live="polite"></div>
            <div class="field-row stacked customer-field"><label for="customer-name">Cliente opcional</label><input id="customer-name" type="text" maxlength="80" placeholder="Consumidor final"></div>
            <div class="results-header"><h3>Resultados</h3><span id="product-count"></span></div>
            <div class="product-grid" id="product-list" aria-live="polite"></div>
          </section>

          <aside class="cart-panel" aria-labelledby="cart-title">
            <div class="panel-heading cart-heading"><div><p class="eyebrow">Venta actual</p><h2 id="cart-title">Carrito</h2></div><span class="item-counter" id="cart-count">0 articulos</span></div>
            <div class="cart-items" id="cart-items"></div>
            <section class="totals" aria-label="Totales de la venta">
              <div class="field-row discount-row"><label for="discount">Descuento (%)</label><input id="discount" type="number" min="0" max="100" step="1" value="0"></div>
              <div class="total-line"><span>Subtotal</span><strong id="subtotal">$0</strong></div>
              <div class="total-line"><span>Descuento</span><strong id="discount-amount">$0</strong></div>
              <div class="total-line final"><span>TOTAL</span><strong id="total">$0</strong></div>
            </section>
            <section class="payment" aria-label="Metodo de pago">
              <h3>Metodo de pago</h3>
              <div class="payment-options" role="radiogroup" aria-label="Elegir metodo de pago">
                <label><input type="radio" name="payment" value="cash"><span>Efectivo</span></label>
                <label><input type="radio" name="payment" value="card"><span>Tarjeta</span></label>
                <label><input type="radio" name="payment" value="transfer"><span>Transferencia</span></label>
              </div>
              <div class="cash-box hidden" id="cash-box"><div class="field-row"><label for="cash-received">Recibe</label><input id="cash-received" type="number" min="0" step="1" placeholder="0"></div><div class="total-line change"><span>Vuelto</span><strong id="change">$0</strong></div></div>
            </section>
            <button class="charge-button" id="charge-button" type="button" aria-keyshortcuts="F8">Agrega productos</button>
          </aside>
        </main>
      </section>

      <div class="modal-backdrop hidden" id="missing-product-modal" role="presentation"><section class="modal" role="dialog" aria-modal="true"><button id="close-modal-button" type="button" class="hidden">Cerrar</button><button id="cancel-modal-button" type="button" class="hidden">Cancelar</button><form id="missing-product-form"><input id="new-name"><input id="new-barcode"><input id="new-price-kg"><input id="new-weight"><strong id="new-product-total">$0</strong></form></section></div>

      <div class="modal-backdrop hidden" id="close-cash-modal" role="presentation">
        <section class="modal close-cash-modal" role="dialog" aria-modal="true" aria-labelledby="close-cash-title">
          <div class="modal-heading"><div><p class="eyebrow">Fin de jornada</p><h2 id="close-cash-title">Cerrar caja</h2></div><button class="icon-button" id="close-cash-x" type="button" aria-label="Cerrar">x</button></div>
          <div class="cash-close-summary" aria-label="Resumen de caja">
            <div class="total-line"><span>Fondo inicial</span><strong id="close-opening-total">$0</strong></div>
            <div class="total-line"><span>Ventas registradas</span><strong id="close-sales-total">$0</strong></div>
            <div class="total-line"><span>Ingresos</span><strong id="close-income-total">$0</strong></div>
            <div class="total-line"><span>Egresos</span><strong id="close-expense-total">$0</strong></div>
            <div class="total-line"><span>Total esperado</span><strong id="close-expected-total">$0</strong></div>
            <div class="total-line"><span>Total contado</span><strong id="close-counted-total">$0</strong></div>
            <div class="total-line final"><span>Diferencia</span><strong id="close-difference-total">$0</strong></div>
          </div>
          <form id="close-cash-form" class="modal-form" autocomplete="off">
            <div class="field-row stacked"><label for="close-counted-cash">Total contado</label><input id="close-counted-cash" type="number" min="0" step="1" required></div>
            <div class="field-row stacked"><label for="close-notes">Observaciones</label><input id="close-notes" type="text" maxlength="160" placeholder="Detalle diferencias o comentarios"></div>
            <div class="message-area inline-message" id="close-cash-message" role="status" aria-live="polite"></div>
            <div class="modal-actions"><button class="ghost-button" id="cancel-close-cash-button" type="button">Cancelar</button><button class="primary-button" type="submit">Confirmar cierre</button></div>
          </form>
        </section>
      </div>
    `;
  },

  async init(context) {
    const { api, pos, appState } = context;
    const ui = new UI();
    this.ui = ui;
    this.abortController = new AbortController();
    const options = { signal: this.abortController.signal };
    const view = this;
    let lastRequestedSearch = null;
    let chargeInFlight = false;

    const openPanel = document.querySelector("#open-shift-panel");
    const salePanel = document.querySelector("#terminal-sale-panel");
    const operationStatus = document.querySelector("#global-status-bar");
    const terminalContext = document.querySelector("#terminal-context");
    const terminalServer = document.querySelector("#terminal-server-status");
    const closeCashButton = document.querySelector("#open-close-cash-button");
    const shiftSalesButton = document.querySelector("#shift-sales-button");
    const customerNameInput = document.querySelector("#customer-name");
    const openForm = document.querySelector("#open-cash-form");
    const openMessage = document.querySelector("#open-cash-message");
    const cashierInput = document.querySelector("#cashier-name");
    const registerInput = document.querySelector("#cash-register-name");
    const openingFundInput = document.querySelector("#opening-fund");
    const openSubmit = openForm.querySelector("button[type='submit']");
    const closeModal = document.querySelector("#close-cash-modal");
    const closeForm = document.querySelector("#close-cash-form");
    const closeMessage = document.querySelector("#close-cash-message");
    const countedInput = document.querySelector("#close-counted-cash");
    const closeNotes = document.querySelector("#close-notes");
    const closeSubmit = closeForm.querySelector("button[type='submit']");

    function cashReady(state) {
      return state.caja && state.caja.estado === "abierta" && state.caja.confirmadaBackend === true;
    }

    function pendingCashState(state) {
      return (state.pendingCashOperations && state.pendingCashOperations.abrir) || null;
    }

    function renderOperationalState(state) {
      const cajaLista = cashReady(state);
      const pendingCash = pendingCashState(state);
      const cajaNombre = state.caja ? state.caja.nombre : "Caja cerrada";
      const cajero = state.usuario ? state.usuario.nombre : "Sin cajero";
      const openedAt = state.caja && state.caja.abiertaEn ? new Date(state.caja.abiertaEn).toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" }) : "sin apertura";
      let text = cajaLista ? "Caja abierta. Listo para vender." : "Caja cerrada. Abrir caja para comenzar.";
      let level = cajaLista ? "success" : "danger";
      if (pendingCash) {
        text = "Apertura pendiente de verificación.";
        level = "warning";
      } else if (state.estadoServidor === "offline") {
        text = cajaLista ? "Servidor offline. Las ventas reales estan bloqueadas." : "Servidor offline. No se puede abrir caja.";
        level = "danger";
      } else if (state.pendingSaleOperation) {
        text = "Operacion pendiente de verificacion. No repitas el cobro.";
        level = "warning";
      }
      terminalContext.textContent = `${cajero} - ${cajaNombre} - Apertura: ${openedAt}`;
      terminalServer.textContent = state.estadoServidor === "offline" ? "Servidor offline" : state.estadoServidor === "online" ? "Online" : "Servidor pendiente";
      terminalServer.dataset.state = state.estadoServidor === "offline" ? "danger" : state.estadoServidor === "online" ? "success" : "warning";
      operationStatus.textContent = text;
      operationStatus.className = `operation-bar ${level}`;
      openPanel.classList.toggle("hidden", cajaLista);
      salePanel.classList.toggle("hidden", !cajaLista);
      closeCashButton.classList.toggle("hidden", !cajaLista);
      shiftSalesButton.classList.toggle("hidden", !cajaLista);
      openSubmit.disabled = state.estadoServidor === "offline" || Boolean(pendingCash) || view.openingInFlight;
      openSubmit.textContent = pendingCash ? "Verificando apertura..." : state.estadoServidor === "offline" ? "Servidor offline" : view.openingInFlight ? "Abriendo..." : "Abrir caja";
      renderCart();
      window.setTimeout(() => (cajaLista ? ui.els.searchInput : cashierInput).focus(), 0);
    }

    if (appState) this.unsubscribeState = appState.subscribe(renderOperationalState);

    function currentTotals() {
      const discount = ui.getDiscountValue();
      const subtotal = pos.subtotal();
      const discountPercent = pos.calcularDescuento(discount);
      return { subtotal, discountAmount: subtotal * (discountPercent / 100), total: pos.total(discount), change: pos.calcularVuelto(ui.getCashReceived(), discount) };
    }

    function renderCart() {
      const totals = currentTotals();
      ui.renderCart(pos.cart, totals, {
        onQuantityChange(productId, delta) { pos.modificarCantidad(productId, delta); renderCart(); },
        onRemoveProduct(productId) { pos.eliminarProducto(productId); renderCart(); },
      });
      const state = appState ? appState.snapshot() : null;
      const blockedReason = !state || state.estadoServidor === "offline" ? "Sin conexion" : !cashReady(state) ? "Caja cerrada" : !state.usuario ? "Sin cajero" : state.pendingSaleOperation ? "Verificando operacion" : "";
      ui.updateChargeButton(totals, pos.cart, blockedReason);
    }

    async function loadProducts(search = "", opts = {}) {
      const safeSearch = CaseritasUtils.sanitizeText(search);
      if (safeSearch.length < 2) {
        lastRequestedSearch = safeSearch;
        pos.products = [];
        ui.setLoading(false);
        ui.renderProducts(pos.products, addProductToCart);
        if (!opts.keepMessage) ui.showMessage("");
        return;
      }
      if (!opts.force && safeSearch === lastRequestedSearch) return;
      lastRequestedSearch = safeSearch;
      ui.setLoading(true, "Buscando productos...");
      try {
        await pos.cargarProductos(safeSearch);
        appState.setServidor("online");
        ui.setLoading(false);
        ui.renderProducts(pos.products, addProductToCart);
        if (!opts.keepMessage) ui.showMessage("");
      } catch (error) {
        if (error.message === "Servidor no disponible") appState.setServidor("offline");
        lastRequestedSearch = null;
        pos.products = [];
        ui.setLoading(false);
        ui.renderProducts(pos.products, addProductToCart);
        ui.showMessage(CaseritasUtils.friendlyApiError(error), "error");
      }
    }

    function addProductToCart(product) {
      pos.agregarProducto(product);
      renderCart();
      ui.showMessage(`${product.name} agregado al carrito.`, "success");
    }

    function scheduleProductSearch() {
      window.clearTimeout(view.searchDebounceTimer);
      view.searchDebounceTimer = window.setTimeout(() => loadProducts(ui.getSearchTerm()), 500);
    }

    async function handleSearchSubmit(event) {
      event.preventDefault();
      if (!cashReady(appState.snapshot())) { ui.showMessage("Abrir caja antes de vender.", "error"); return; }
      const term = ui.getSearchTerm();
      if (!term) { ui.showMessage("Ingresa un nombre o codigo de barras.", "warning"); ui.els.searchInput.focus(); return; }
      ui.setLoading(true, "Buscando producto...");
      try {
        const product = await pos.buscarProductoParaVenta(term);
        if (product) {
          addProductToCart(product);
          ui.clearSearch();
          await loadProducts("", { keepMessage: true, force: true });
          return;
        }
        ui.showMessage("Producto no encontrado. Revisar productos en Airtable.", "warning");
      } catch (error) {
        ui.showMessage(CaseritasUtils.friendlyApiError(error), "error");
      } finally {
        ui.setLoading(false);
        renderCart();
      }
    }

    async function handleCharge() {
      if (chargeInFlight) return;
      const discount = ui.getDiscountValue();
      const cashReceived = ui.getCashReceived();
      let operationId = null;
      try {
        const state = appState.snapshot();
        if (!cashReady(state)) { ui.showMessage("Abrir caja antes de cobrar.", "error"); return; }
        const error = pos.validarCobro(discount, cashReceived);
        if (error) { ui.showMessage(error, "error"); return; }
        chargeInFlight = true;
        ui.setLoading(true, "Procesando venta...");
        operationId = appState.beginSaleOperation("venta");
        const payload = await pos.cobrarConMetadata(discount, cashReceived, { operationId, empresaId: state.empresa.id, cajaId: state.caja.id, cajaSesionId: state.caja.cajaSesionId, usuarioId: state.usuario ? state.usuario.id : null, customerName: CaseritasUtils.sanitizeText(customerNameInput.value) || "Consumidor final" });
        appState.setServidor("online");
        appState.addVenta(payload);
        appState.clearSaleOperation(operationId);
        appState.addMovimientoCaja({ tipo: "Ingreso", motivo: "Venta POS", importe: payload.total, metodoPago: payload.paymentMethod });
        ui.resetSaleControls();
        customerNameInput.value = "";
        renderCart();
        await loadProducts("", { keepMessage: true, force: true });
        ui.showMessage(`Venta confirmada. Operacion ${operationId}.`, "success");
        ui.clearSearch();
      } catch (error) {
        if (error.message === "Servidor no disponible") appState.setServidor("offline");
        ui.showMessage(CaseritasUtils.friendlyApiError(error), "error");
      } finally {
        chargeInFlight = false;
        ui.setLoading(false, "Procesando venta...");
        renderCart();
      }
    }

    async function handleOpenCash(event) {
      event.preventDefault();
      if (view.openingInFlight) return;
      const state = appState.snapshot();
      const pending = state.pendingCashOperations && state.pendingCashOperations.abrir;
      if (state.estadoServidor === "offline") { openMessage.innerHTML = `<div class="message error">Servidor offline. No se puede abrir caja.</div>`; return; }
      if (pending && pending.operationId) { openMessage.innerHTML = `<div class="message warning">Apertura pendiente de verificación. Consulta el estado real antes de repetir.</div>`; return; }
      const cajero = CaseritasUtils.sanitizeText(cashierInput.value);
      const cajaNombre = CaseritasUtils.sanitizeText(registerInput.value) || "Caja principal";
      if (!cajero) { openMessage.innerHTML = `<div class="message error">Ingresa el nombre del cajero.</div>`; cashierInput.focus(); return; }
      const normalizedCaja = CaseritasUtils.normalize(cajaNombre).replace(/\s+/g, "-") || "principal";
      const usuario = { id: `usuario-${CaseritasUtils.normalize(cajero).replace(/\s+/g, "-") || Date.now()}`, nombre: cajero };
      const cajaId = `caja-${normalizedCaja}`;
      const fondoInicial = CaseritasUtils.positiveNumber(openingFundInput.value);
      const operationId = appState.beginCashOperation("abrir", "caja", { empresaId: state.empresa.id, usuario, cajaId, cajaNombre, fondoInicial });
      view.openingInFlight = true;
      openSubmit.disabled = true;
      openSubmit.textContent = "Abriendo...";
      openMessage.innerHTML = `<div class="message warning">Abriendo caja...</div>`;
      try {
        const result = await api.openCashSession({ operationId, empresaId: state.empresa.id, usuarioId: usuario.id, cajaId, fondoInicial, fechaHora: CaseritasUtils.todayIso() });
        appState.setServidor("online");
        appState.setCajaAbiertaConfirmada({ cajaId, cajaNombre, cajaSesionId: result.cajaSesionId, fondoInicial: result.fondoInicial, fechaApertura: result.fechaApertura || CaseritasUtils.todayIso(), usuario });
        appState.clearCashOperation("abrir", operationId);
        openMessage.innerHTML = `<div class="message success">Caja abierta correctamente.</div>`;
        renderOperationalState(appState.snapshot());
        window.setTimeout(() => ui.els.searchInput.focus(), 50);
      } catch (error) {
        if (error.message === "Servidor no disponible") { appState.setServidor("offline"); appState.markCashOperationUnknown("abrir", operationId); openMessage.innerHTML = `<div class="message warning">Apertura pendiente de verificación.</div>`; return; }
        appState.clearCashOperation("abrir", operationId);
        openMessage.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        view.openingInFlight = false;
        renderOperationalState(appState.snapshot());
      }
    }

    async function recoverPendingOpen() {
      const state = appState.snapshot();
      const pending = state.pendingCashOperations && state.pendingCashOperations.abrir;
      const pendingData = pending && pending.data ? pending.data : null;
      const usuario = state.usuario || pendingData?.usuario || null;
      const cajaId = state.caja?.id || pendingData?.cajaId || null;
      const cajaNombre = state.caja?.nombre || pendingData?.cajaNombre || "Caja principal";

      if (!pending || !pending.operationId || !usuario || !cajaId) {
        return;
      }

      openSubmit.disabled = true;
      openSubmit.textContent = "Verificando apertura...";
      openMessage.innerHTML = `<div class="message warning">Apertura pendiente de verificación.</div>`;

      try {
        const status = await api.getCashStatus({ empresaId: state.empresa.id, usuarioId: usuario.id, cajaId });
        appState.setServidor("online");
        if (status && status.abierta) {
          appState.reconcileCajaStatus(status, { cajaId, cajaNombre, usuario });
          appState.clearCashOperation("abrir", pending.operationId);
          openMessage.innerHTML = `<div class="message success">Caja abierta correctamente.</div>`;
          renderOperationalState(appState.snapshot());
          window.setTimeout(() => ui.els.searchInput.focus(), 50);
          return;
        }

        appState.clearCashOperation("abrir", pending.operationId);
        openMessage.innerHTML = `<div class="message warning">Caja cerrada. Podes abrir caja nuevamente.</div>`;
        renderOperationalState(appState.snapshot());
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
        }
        openMessage.innerHTML = `<div class="message warning">Apertura pendiente de verificación.</div>`;
        renderOperationalState(appState.snapshot());
      }
    }
    function cashCloseTotals() {
      const state = appState.snapshot();
      const fondo = state.caja ? Number(state.caja.fondoInicial || 0) : 0;
      const ventas = appState.totalVentasDia();
      const movimientos = state.movimientosCaja || [];
      const ingresos = movimientos.filter((m) => Number(m.importe || 0) > 0 && m.motivo !== "Venta POS").reduce((sum, m) => sum + Number(m.importe || 0), 0);
      const egresos = movimientos.filter((m) => Number(m.importe || 0) < 0).reduce((sum, m) => sum + Math.abs(Number(m.importe || 0)), 0);
      const esperado = appState.totalEsperadoCaja();
      const contado = CaseritasUtils.positiveNumber(countedInput.value);
      return { fondo, ventas, ingresos, egresos, esperado, contado, diferencia: contado - esperado };
    }

    function renderCloseTotals() {
      const totals = cashCloseTotals();
      document.querySelector("#close-opening-total").textContent = CaseritasUtils.money(totals.fondo);
      document.querySelector("#close-sales-total").textContent = CaseritasUtils.money(totals.ventas);
      document.querySelector("#close-income-total").textContent = CaseritasUtils.money(totals.ingresos);
      document.querySelector("#close-expense-total").textContent = CaseritasUtils.money(totals.egresos);
      document.querySelector("#close-expected-total").textContent = CaseritasUtils.money(totals.esperado);
      document.querySelector("#close-counted-total").textContent = CaseritasUtils.money(totals.contado);
      document.querySelector("#close-difference-total").textContent = CaseritasUtils.signedMoney(totals.diferencia);
    }

    function openCloseModal() { countedInput.value = ""; closeNotes.value = ""; closeMessage.textContent = ""; renderCloseTotals(); closeModal.classList.remove("hidden"); countedInput.focus(); }
    function closeCloseModal() { closeModal.classList.add("hidden"); ui.els.searchInput.focus(); }

    async function handleCloseCash(event) {
      event.preventDefault();
      if (view.closeInFlight) return;
      const state = appState.snapshot();
      if (!cashReady(state)) { closeMessage.innerHTML = `<div class="message error">No hay caja abierta para cerrar.</div>`; return; }
      const totals = cashCloseTotals();
      if (totals.diferencia !== 0 && !CaseritasUtils.sanitizeText(closeNotes.value)) { closeMessage.innerHTML = `<div class="message warning">Agrega observaciones para cerrar con diferencia.</div>`; return; }
      const operationId = appState.beginCashOperation("cerrar", "caja", { empresaId: state.empresa.id, usuarioId: state.usuario ? state.usuario.id : null, cajaSesionId: state.caja.cajaSesionId, totalContado: totals.contado });
      view.closeInFlight = true;
      closeSubmit.disabled = true;
      closeMessage.innerHTML = `<div class="message warning">Cerrando caja...</div>`;
      try {
        const result = await api.closeCashSession({ operationId, empresaId: state.empresa.id, usuarioId: state.usuario ? state.usuario.id : null, cajaSesionId: state.caja.cajaSesionId, totalContado: totals.contado, observaciones: CaseritasUtils.sanitizeText(closeNotes.value), fechaHora: CaseritasUtils.todayIso() });
        appState.setServidor("online");
        appState.setCajaCerradaConfirmada({ cajaSesionId: result.cajaSesionId, totalEsperado: result.totalEsperado, totalContado: result.totalContado, diferencia: result.diferencia, observaciones: closeNotes.value, fechaCierre: result.fechaCierre || CaseritasUtils.todayIso() });
        appState.clearCashOperation("cerrar", operationId);
        pos.limpiarVenta();
        ui.resetSaleControls();
        renderCart();
        closeMessage.innerHTML = `<div class="message success">Caja cerrada correctamente.</div>`;
        window.setTimeout(closeCloseModal, 600);
      } catch (error) {
        if (error.message === "Servidor no disponible") { appState.setServidor("offline"); appState.markCashOperationUnknown("cerrar", operationId); closeMessage.innerHTML = `<div class="message warning">Cierre pendiente de verificacion.</div>`; return; }
        appState.clearCashOperation("cerrar", operationId);
        closeMessage.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        view.closeInFlight = false;
        closeSubmit.disabled = false;
      }
    }

    function handleClearSale() { appState.clearSaleOperation(); pos.limpiarVenta(); ui.resetSaleControls(); renderCart(); ui.showMessage("Venta limpiada.", "success"); }

    ui.bind({
      onSearchSubmit: handleSearchSubmit,
      onSearchInput: scheduleProductSearch,
      onTotalsChange: renderCart,
      onCharge: handleCharge,
      onClearSale: handleClearSale,
      onCloseModal: () => {},
      onMissingProductSubmit: (event) => event.preventDefault(),
      onPaymentChange(method) { pos.setMetodoPago(method); ui.setPaymentUI(method); renderCart(); },
    });

    openForm.addEventListener("submit", handleOpenCash, options);
    closeCashButton.addEventListener("click", openCloseModal, options);
    document.querySelector("#close-cash-x").addEventListener("click", closeCloseModal, options);
    document.querySelector("#cancel-close-cash-button").addEventListener("click", closeCloseModal, options);
    closeForm.addEventListener("submit", handleCloseCash, options);
    countedInput.addEventListener("input", renderCloseTotals, options);
    closeModal.addEventListener("click", (event) => { if (event.target === closeModal) closeCloseModal(); }, options);
    shiftSalesButton.addEventListener("click", () => { ui.showMessage("Ventas del turno disponibles en Airtable durante el piloto.", "warning"); }, options);

    const current = appState.snapshot();
    if (current.usuario) cashierInput.value = current.usuario.nombre;
    if (current.caja) { registerInput.value = current.caja.nombre || "Caja principal"; openingFundInput.value = current.caja.fondoInicial || 0; }
    renderCart();
    await loadProducts("", { force: true });
    renderOperationalState(appState.snapshot());
    await recoverPendingOpen();
  },

  destroy() {
    window.clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = null;
    if (this.unsubscribeState) { this.unsubscribeState(); this.unsubscribeState = null; }
    if (this.abortController) { this.abortController.abort(); this.abortController = null; }
    if (this.ui) { this.ui.destroy(); this.ui = null; }
  },
};
