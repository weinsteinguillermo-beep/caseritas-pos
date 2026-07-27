"use strict";

class UI {
  constructor() {
    this.loading = false;
    this.abortController = null;
    this.els = {
      searchForm: document.querySelector("#search-form"),
      searchInput: document.querySelector("#product-search"),
      customerName: document.querySelector("#customer-name"),
      searchButton: document.querySelector("#search-form button[type='submit']"),
      messageArea: document.querySelector("#message-area"),
      productList: document.querySelector("#product-list"),
      productCount: document.querySelector("#product-count"),
      cartItems: document.querySelector("#cart-items"),
      cartCount: document.querySelector("#cart-count"),
      subtotal: document.querySelector("#subtotal"),
      discount: document.querySelector("#discount"),
      discountAmount: document.querySelector("#discount-amount"),
      total: document.querySelector("#total"),
      paymentInputs: document.querySelectorAll("input[name='payment']"),
      cashBox: document.querySelector("#cash-box"),
      cashReceived: document.querySelector("#cash-received"),
      change: document.querySelector("#change"),
      chargeButton: document.querySelector("#charge-button"),
      clearSaleButton: document.querySelector("#clear-sale-button"),
      modal: document.querySelector("#missing-product-modal"),
      missingForm: document.querySelector("#missing-product-form"),
      closeModalButton: document.querySelector("#close-modal-button"),
      cancelModalButton: document.querySelector("#cancel-modal-button"),
      newName: document.querySelector("#new-name"),
      newBarcode: document.querySelector("#new-barcode"),
      newPriceKg: document.querySelector("#new-price-kg"),
      newWeight: document.querySelector("#new-weight"),
      newProductTotal: document.querySelector("#new-product-total"),
    };
  }

  createEl(tag, options = {}) {
    const element = document.createElement(tag);
    if (options.className) element.className = options.className;
    if (options.text !== undefined) element.textContent = options.text;
    if (options.type) element.type = options.type;
    if (options.ariaLabel) element.setAttribute("aria-label", options.ariaLabel);
    return element;
  }

  showMessage(text, type = "success") {
    this.els.messageArea.textContent = "";
    if (!text) return;
    this.els.messageArea.append(this.createEl("div", { className: `message ${type}`, text }));
  }

  setLoading(isLoading, text = "Cargando...") {
    this.loading = isLoading;
    this.els.searchButton.disabled = isLoading;
    this.els.clearSaleButton.disabled = isLoading;
    const isSaleOperation = /venta|cobro|operacion/i.test(text);
    if (!isLoading) {
      this.els.chargeButton.dataset.loading = "false";
    } else if (isSaleOperation) {
      this.els.chargeButton.disabled = true;
      this.els.chargeButton.dataset.loading = "true";
      this.els.chargeButton.textContent = text;
    }
    if (isLoading) this.showMessage(text, "warning");
  }

  renderProducts(products, onAddProduct) {
    this.els.productList.textContent = "";
    this.els.productCount.textContent = `${products.length} productos`;
    if (this.loading) {
      this.els.productList.append(this.createEl("div", { className: "empty-cart", text: "Cargando productos..." }));
      return;
    }
    if (products.length === 0) {
      const empty = this.createEl("div", { className: "empty-cart catalog-empty" });
      empty.append(
        this.createEl("strong", { text: "No hay productos cargados." }),
        this.createEl("span", { text: "Busca por nombre o escanea un codigo." })
      );
      this.els.productList.append(empty);
      return;
    }
    products.forEach((product) => {
      const card = this.createEl("article", { className: "product-card" });
      const meta = this.createEl("div", { className: "product-meta" });
      const button = this.createEl("button", { type: "button", text: "Agregar" });
      button.disabled = this.loading;
      button.addEventListener("click", () => onAddProduct(product));
      meta.append(
        this.createEl("span", { text: `${CaseritasUtils.money(product.price)} - ${product.weight} g` }),
        this.createEl("span", { text: `Codigo: ${product.barcode}` }),
        this.createEl("span", { text: `Stock: ${product.stock}` })
      );
      card.append(this.createEl("h4", { text: product.name }), meta, button);
      this.els.productList.append(card);
    });
  }

  renderCart(cart, totals, callbacks) {
    this.els.cartItems.textContent = "";
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.els.cartCount.textContent = `${itemCount} ${itemCount === 1 ? "articulo" : "articulos"}`;
    if (cart.length === 0) {
      this.els.cartItems.append(this.createEl("div", { className: "empty-cart", text: "El carrito esta vacio. Agrega productos desde el buscador." }));
    } else {
      cart.forEach((item) => {
        const row = this.createEl("article", { className: "cart-item" });
        const top = this.createEl("div", { className: "cart-item-top" });
        const details = this.createEl("div");
        details.append(
          this.createEl("h4", { text: item.product.name }),
          this.createEl("small", { text: `${CaseritasUtils.money(item.product.price)} c/u - ${item.product.weight} g` })
        );
        top.append(details, this.createEl("strong", { text: CaseritasUtils.money(item.product.price * item.quantity) }));
        const actions = this.createEl("div", { className: "cart-item-actions" });
        const qty = this.createEl("div", { className: "qty-controls" });
        const decrease = this.createEl("button", { type: "button", text: "-", ariaLabel: `Disminuir cantidad de ${item.product.name}` });
        const increase = this.createEl("button", { type: "button", text: "+", ariaLabel: `Aumentar cantidad de ${item.product.name}` });
        const remove = this.createEl("button", { className: "remove-button", type: "button", text: "Eliminar" });
        decrease.addEventListener("click", () => callbacks.onQuantityChange(item.product.id, -1));
        increase.addEventListener("click", () => callbacks.onQuantityChange(item.product.id, 1));
        remove.addEventListener("click", () => callbacks.onRemoveProduct(item.product.id));
        qty.append(decrease, this.createEl("span", { text: String(item.quantity) }), increase);
        actions.append(qty, remove);
        row.append(top, actions);
        this.els.cartItems.append(row);
      });
    }
    this.renderTotals(totals);
  }

  renderTotals(totals) {
    this.els.subtotal.textContent = CaseritasUtils.money(totals.subtotal);
    this.els.discountAmount.textContent = CaseritasUtils.money(totals.discountAmount);
    this.els.total.textContent = CaseritasUtils.money(totals.total);
    this.els.change.textContent = CaseritasUtils.money(totals.change);
  }

  updateChargeButton(totals, cart, blockedReason = "") {
    if (this.els.chargeButton.dataset.loading === "true") return;
    const hasProducts = cart.length > 0 && totals.total > 0;
    const hasPayment = Array.from(this.els.paymentInputs).some((input) => input.checked);
    this.els.chargeButton.disabled = Boolean(blockedReason) || !hasProducts || !hasPayment;
    if (blockedReason) {
      this.els.chargeButton.textContent = blockedReason;
      return;
    }
    if (!hasProducts) {
      this.els.chargeButton.textContent = "Agrega productos";
      return;
    }
    this.els.chargeButton.textContent = hasPayment ? `COBRAR - ${CaseritasUtils.money(totals.total)}` : "Selecciona forma de pago";
  }

  openMissingProductModal() {}
  closeMissingProductModal() { this.els.searchInput.focus(); }
  updateNewProductPreview() {}

  setPaymentUI(method) {
    this.els.cashBox.classList.toggle("hidden", method !== "cash");
  }

  resetSaleControls() {
    this.els.discount.value = "0";
    this.els.cashReceived.value = "";
    this.els.paymentInputs.forEach((input) => { input.checked = false; });
    this.els.cashBox.classList.add("hidden");
  }

  clearSearch() {
    this.els.searchInput.value = "";
    this.els.searchInput.focus();
  }

  normalizeDiscountInput() {
    if (Number(this.els.discount.value) > 100) this.els.discount.value = "100";
  }

  getSearchTerm() { return CaseritasUtils.sanitizeText(this.els.searchInput.value); }
  getDiscountValue() { this.normalizeDiscountInput(); return this.els.discount.value; }
  getCashReceived() { return this.els.cashReceived.value; }
  getMissingProductForm() { return { name: "", barcode: "", priceKg: 0, weight: 0 }; }

  bind(events) {
    this.abortController = new AbortController();
    const options = { signal: this.abortController.signal };
    this.els.searchForm.addEventListener("submit", events.onSearchSubmit, options);
    this.els.searchInput.addEventListener("input", events.onSearchInput, options);
    this.els.discount.addEventListener("input", events.onTotalsChange, options);
    this.els.cashReceived.addEventListener("input", events.onTotalsChange, options);
    this.els.chargeButton.addEventListener("click", events.onCharge, options);
    this.els.clearSaleButton.addEventListener("click", events.onClearSale, options);
    this.els.missingForm.addEventListener("submit", events.onMissingProductSubmit, options);
    this.els.paymentInputs.forEach((input) => input.addEventListener("change", () => events.onPaymentChange(input.value), options));
    document.addEventListener("keydown", (event) => {
      const tag = event.target && event.target.tagName ? event.target.tagName.toUpperCase() : "";
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(tag);
      if (event.key === "F2") { event.preventDefault(); this.els.searchInput.focus(); this.els.searchInput.select(); return; }
      if (event.key === "F4") { event.preventDefault(); this.els.customerName.focus(); return; }
      if (event.key === "F8" && !isTyping) { event.preventDefault(); this.els.chargeButton.click(); return; }
      if (event.key === "Escape" && event.target === this.els.searchInput && this.els.searchInput.value) { event.preventDefault(); this.clearSearch(); events.onSearchInput(); }
    }, options);
  }

  destroy() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }
}

window.UI = UI;
