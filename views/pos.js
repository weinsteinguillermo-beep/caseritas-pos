"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.POS = {
  ui: null,
  searchDebounceTimer: null,
  unsubscribeState: null,

  render() {
    return `
      <main class="layout">
        <section class="catalog-panel" aria-labelledby="sale-title">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Nueva venta</p>
              <h2 id="sale-title">Buscar y agregar productos</h2>
            </div>
            <button class="ghost-button" id="clear-sale-button" type="button">Limpiar venta</button>
          </div>

          <form class="search-box" id="search-form" autocomplete="off">
            <label for="product-search">Producto o código de barras</label>
            <div class="search-row">
              <input
                id="product-search"
                name="productSearch"
                type="search"
                inputmode="search"
                placeholder="Ej: milanesa, empanada o 7790001000012"
                aria-describedby="search-help"
              >
              <button type="submit">Agregar</button>
            </div>
            <p id="search-help">Escribí un nombre para filtrar o escaneá un código para agregar directo.</p>
          </form>

          <div class="message-area" id="message-area" role="status" aria-live="polite"></div>

          <div class="message-area" aria-live="polite">
            <div class="message warning" id="operation-status">Preparando estado operativo...</div>
          </div>

          <div class="field-row stacked">
            <label for="customer-name">Cliente</label>
            <input id="customer-name" type="text" maxlength="80" placeholder="Consumidor final">
          </div>

          <div class="results-header">
            <h3>Catálogo local</h3>
            <span id="product-count"></span>
          </div>
          <div class="product-grid" id="product-list" aria-live="polite"></div>
        </section>

        <aside class="cart-panel" aria-labelledby="cart-title">
          <div class="panel-heading">
            <div>
              <p class="eyebrow">Carrito</p>
              <h2 id="cart-title">Venta actual</h2>
            </div>
            <span class="item-counter" id="cart-count">0 ítems</span>
          </div>

          <div class="cart-items" id="cart-items"></div>

          <section class="totals" aria-label="Totales de la venta">
            <div class="field-row">
              <label for="discount">Descuento (%)</label>
              <input id="discount" type="number" min="0" max="100" step="1" value="0">
            </div>

            <div class="total-line">
              <span>Subtotal</span>
              <strong id="subtotal">$0</strong>
            </div>
            <div class="total-line">
              <span>Descuento</span>
              <strong id="discount-amount">$0</strong>
            </div>
            <div class="total-line final">
              <span>Total final</span>
              <strong id="total">$0</strong>
            </div>
          </section>

          <section class="payment" aria-label="Método de pago">
            <h3>Método de pago</h3>
            <div class="payment-options" role="radiogroup" aria-label="Elegir método de pago">
              <label>
                <input type="radio" name="payment" value="cash">
                <span>Efectivo</span>
              </label>
              <label>
                <input type="radio" name="payment" value="card">
                <span>Tarjeta</span>
              </label>
              <label>
                <input type="radio" name="payment" value="transfer">
                <span>Transferencia</span>
              </label>
            </div>

            <div class="cash-box hidden" id="cash-box">
              <div class="field-row">
                <label for="cash-received">Recibe</label>
                <input id="cash-received" type="number" min="0" step="1" placeholder="0">
              </div>
              <div class="total-line change">
                <span>Vuelto</span>
                <strong id="change">$0</strong>
              </div>
            </div>
          </section>

          <button class="charge-button" id="charge-button" type="button">Cobrar</button>
        </aside>
      </main>

      <div class="modal-backdrop hidden" id="missing-product-modal" role="presentation">
        <section
          class="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="missing-title"
          aria-describedby="missing-description"
        >
          <div class="modal-heading">
            <div>
              <p class="eyebrow">Producto no encontrado</p>
              <h2 id="missing-title">Carga rápida</h2>
            </div>
            <button class="icon-button" id="close-modal-button" type="button" aria-label="Cerrar">×</button>
          </div>
          <p id="missing-description">
            Guardá este producto temporalmente en memoria y agregalo a la venta actual.
          </p>

          <form id="missing-product-form" class="modal-form" autocomplete="off">
            <div class="field-row stacked">
              <label for="new-name">Nombre</label>
              <input id="new-name" name="newName" type="text" maxlength="80" required>
            </div>
            <div class="field-row stacked">
              <label for="new-barcode">Código de barras</label>
              <input id="new-barcode" name="newBarcode" type="text" maxlength="32" required>
            </div>
            <div class="split-fields">
              <div class="field-row stacked">
                <label for="new-price-kg">Precio por kg</label>
                <input id="new-price-kg" name="newPriceKg" type="number" min="1" step="1" required>
              </div>
              <div class="field-row stacked">
                <label for="new-weight">Peso en gramos</label>
                <input id="new-weight" name="newWeight" type="number" min="1" step="1" required>
              </div>
            </div>
            <div class="preview-total">
              <span>Importe calculado</span>
              <strong id="new-product-total">$0</strong>
            </div>
            <div class="modal-actions">
              <button class="ghost-button" id="cancel-modal-button" type="button">Cancelar</button>
              <button class="primary-button" type="submit">Guardar y agregar</button>
            </div>
          </form>
        </section>
      </div>
    `;
  },

  async init(context) {
    const { api, pos, appState } = context;
    const ui = new UI();
    this.ui = ui;
    const view = this;
    let lastRequestedSearch = null;
    let chargeInFlight = false;
    const operationStatus = document.querySelector("#operation-status");
    const customerNameInput = document.querySelector("#customer-name");

    function renderOperationalState(state) {
      const caja =
        state.caja && state.caja.estado === "abierta" && state.caja.confirmadaBackend
          ? `Caja abierta: ${state.caja.nombre}`
          : state.caja && state.caja.estado === "abierta"
            ? "Caja pendiente de verificacion"
            : "Caja cerrada";
      const usuario = state.usuario ? `Cajero: ${state.usuario.nombre}` : "Sin cajero";
      const servidor = state.estadoServidor === "offline" ? "Servidor no disponible" : "Servidor preparado";
      operationStatus.textContent = `${servidor} · ${caja} · ${usuario}`;
      operationStatus.className =
        state.caja && state.caja.estado === "abierta" && state.caja.confirmadaBackend ? "message success" : "message warning";
    }

    if (appState) {
      this.unsubscribeState = appState.subscribe(renderOperationalState);
    }

    function currentTotals() {
      const discount = ui.getDiscountValue();
      const subtotal = pos.subtotal();
      const discountPercent = pos.calcularDescuento(discount);
      const discountAmount = subtotal * (discountPercent / 100);

      return {
        subtotal,
        discountAmount,
        total: pos.total(discount),
        change: pos.calcularVuelto(ui.getCashReceived(), discount),
      };
    }

    function renderCart() {
      ui.renderCart(pos.cart, currentTotals(), {
        onQuantityChange(productId, delta) {
          pos.modificarCantidad(productId, delta);
          renderCart();
        },
        onRemoveProduct(productId) {
          pos.eliminarProducto(productId);
          renderCart();
        },
      });
    }

    async function loadProducts(search = "", options = {}) {
      const safeSearch = CaseritasUtils.sanitizeText(search);

      if (safeSearch.length < 2) {
        lastRequestedSearch = safeSearch;
        pos.products = [];
        ui.setLoading(false);
        ui.renderProducts(pos.products, addProductToCart);

        if (!options.keepMessage) {
          ui.showMessage("");
        }

        return;
      }

      if (!options.force && safeSearch === lastRequestedSearch) {
        return;
      }

      lastRequestedSearch = safeSearch;
      ui.setLoading(true, "Buscando productos...");

      try {
        await pos.cargarProductos(safeSearch);
        if (appState) {
          appState.setServidor("online");
        }
        ui.setLoading(false);
        ui.renderProducts(pos.products, addProductToCart);

        if (!options.keepMessage) {
          ui.showMessage("");
        }
      } catch (error) {
        if (appState && error.message === "Servidor no disponible") {
          appState.setServidor("offline");
        }
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
      view.searchDebounceTimer = window.setTimeout(() => {
        loadProducts(ui.getSearchTerm());
      }, 500);
    }

    async function handleSearchSubmit(event) {
      event.preventDefault();
      const term = ui.getSearchTerm();

      if (!term) {
        ui.showMessage("Ingresá un nombre o código de barras para agregar.", "warning");
        ui.els.searchInput.focus();
        return;
      }

      ui.setLoading(true, "Buscando producto...");

      try {
        const product = await pos.buscarProductoParaVenta(term);

        if (product) {
          addProductToCart(product);
          ui.clearSearch();
          await loadProducts("", { keepMessage: true, force: true });
          ui.showMessage(`${product.name} agregado al carrito.`, "success");
          return;
        }

        ui.showMessage("Producto no encontrado. Completá la carga rápida.", "warning");
        ui.openMissingProductModal(term);
      } catch (error) {
        ui.showMessage(CaseritasUtils.friendlyApiError(error), "error");
      } finally {
        ui.setLoading(false);
      }
    }

    async function handleMissingProductSubmit(event) {
      event.preventDefault();
      const form = ui.getMissingProductForm();

      if (!form.name || !form.barcode || !form.priceKg || !form.weight) {
        ui.showMessage("Completá nombre, código, precio por kg y peso con valores válidos.", "error");
        return;
      }

      ui.setLoading(true, "Guardando producto temporal...");

      try {
        const duplicate = await api.buscarProductoPorCodigo(form.barcode);

        if (duplicate) {
          addProductToCart(duplicate);
          ui.closeMissingProductModal();
          await loadProducts("", { keepMessage: true, force: true });
          ui.showMessage(`${duplicate.name} agregado al carrito.`, "success");
          return;
        }

        const product = await api.crearProducto({
          name: form.name,
          barcode: form.barcode,
          price: Math.round(form.priceKg * (form.weight / 1000)),
          weight: Math.round(form.weight),
          stock: 1,
        });

        addProductToCart(product);
        ui.closeMissingProductModal();
        ui.clearSearch();
        await loadProducts("", { keepMessage: true, force: true });
        ui.showMessage(`${product.name} agregado al carrito.`, "success");
      } catch (error) {
        ui.showMessage(CaseritasUtils.friendlyApiError(error), "error");
      } finally {
        ui.setLoading(false);
      }
    }

    async function handleCharge() {
      if (chargeInFlight) {
        return;
      }

      const discount = ui.getDiscountValue();
      const cashReceived = ui.getCashReceived();
      let operationId = null;

      try {
        const state = appState ? appState.snapshot() : null;

        if (!state || !state.caja || state.caja.estado !== "abierta" || !state.caja.confirmadaBackend) {
          ui.showMessage("Abrí caja y confirmá el estado del servidor para registrar ventas.", "error");
          return;
        }

        const error = pos.validarCobro(discount, cashReceived);

        if (error) {
          ui.showMessage(error, "error");
          return;
        }

        chargeInFlight = true;
        ui.setLoading(true, "Registrando venta...");
        operationId = appState.beginSaleOperation("venta");
        const payload = await pos.cobrarConMetadata(discount, cashReceived, {
          operationId,
          empresaId: state.empresa.id,
          cajaId: state.caja.id,
          cajaSesionId: state.caja.cajaSesionId,
          usuarioId: state.usuario ? state.usuario.id : null,
          customerName: CaseritasUtils.sanitizeText(customerNameInput.value) || "Consumidor final",
        });
        appState.setServidor("online");
        appState.addVenta(payload);
        appState.clearSaleOperation(operationId);
        appState.addMovimientoCaja({
          tipo: "Ingreso",
          motivo: "Venta POS",
          importe: payload.total,
          metodoPago: payload.paymentMethod,
        });
        ui.resetSaleControls();
        customerNameInput.value = "";
        renderCart();
        await loadProducts("", { keepMessage: true, force: true });
        ui.showMessage(`Cobro confirmado. Operación ${operationId}.`, "success");
        ui.clearSearch();
      } catch (error) {
        if (appState && error.message === "Servidor no disponible") {
          appState.setServidor("offline");
        }
        ui.showMessage(CaseritasUtils.friendlyApiError(error), "error");
      } finally {
        chargeInFlight = false;
        ui.setLoading(false);
      }
    }

    function handleClearSale() {
      if (appState) {
        appState.clearSaleOperation();
      }
      pos.limpiarVenta();
      ui.resetSaleControls();
      renderCart();
      ui.showMessage("Venta limpiada.", "success");
    }

    ui.bind({
      onSearchSubmit: handleSearchSubmit,
      onSearchInput: scheduleProductSearch,
      onTotalsChange: renderCart,
      onCharge: handleCharge,
      onClearSale: handleClearSale,
      onCloseModal: () => ui.closeMissingProductModal(),
      onMissingProductSubmit: handleMissingProductSubmit,
      onPaymentChange(method) {
        pos.setMetodoPago(method);
        ui.setPaymentUI(method);
        renderCart();
      },
    });

    renderCart();
    await loadProducts("", { force: true });
  },

  destroy() {
    window.clearTimeout(this.searchDebounceTimer);
    this.searchDebounceTimer = null;
    if (this.unsubscribeState) {
      this.unsubscribeState();
      this.unsubscribeState = null;
    }

    if (this.ui) {
      this.ui.destroy();
      this.ui = null;
    }
  },
};
