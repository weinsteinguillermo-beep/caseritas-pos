"use strict";

/**
 * Capa de interfaz de Caseritas POS.
 * Centraliza lectura y actualización del DOM sin mezclar reglas de negocio.
 */
class UI {
  constructor() {
    this.loading = false;
    this.abortController = null;
    this.els = {
      searchForm: document.querySelector("#search-form"),
      searchInput: document.querySelector("#product-search"),
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

    if (options.className) {
      element.className = options.className;
    }

    if (options.text !== undefined) {
      element.textContent = options.text;
    }

    if (options.type) {
      element.type = options.type;
    }

    if (options.ariaLabel) {
      element.setAttribute("aria-label", options.ariaLabel);
    }

    return element;
  }

  showMessage(text, type = "success") {
    this.els.messageArea.textContent = "";

    if (!text) {
      return;
    }

    const message = this.createEl("div", {
      className: `message ${type}`,
      text,
    });
    this.els.messageArea.append(message);
  }

  setLoading(isLoading, text = "Cargando...") {
    this.loading = isLoading;
    this.els.searchButton.disabled = isLoading;
    this.els.chargeButton.disabled = isLoading;
    this.els.clearSaleButton.disabled = isLoading;

    if (isLoading) {
      this.showMessage(text, "warning");
    }
  }

  renderProducts(products, onAddProduct) {
    this.els.productList.textContent = "";
    this.els.productCount.textContent = `${products.length} productos`;

    if (this.loading) {
      this.els.productList.append(
        this.createEl("div", {
          className: "empty-cart",
          text: "Cargando productos...",
        })
      );
      return;
    }

    if (products.length === 0) {
      this.els.productList.append(
        this.createEl("div", {
          className: "empty-cart",
          text: "No hay coincidencias. Usá Agregar para abrir la carga rápida.",
        })
      );
      return;
    }

    products.forEach((product) => {
      const card = this.createEl("article", { className: "product-card" });
      const title = this.createEl("h4", { text: product.name });
      const meta = this.createEl("div", { className: "product-meta" });
      const price = this.createEl("span", { text: `${CaseritasUtils.money(product.price)} - ${product.weight} g` });
      const barcode = this.createEl("span", { text: `Código: ${product.barcode}` });
      const stock = this.createEl("span", { text: `Stock: ${product.stock}` });
      const button = this.createEl("button", { type: "button", text: "Agregar" });

      button.disabled = this.loading;
      button.addEventListener("click", () => onAddProduct(product));

      meta.append(price, barcode, stock);
      card.append(title, meta, button);
      this.els.productList.append(card);
    });
  }

  renderCart(cart, totals, callbacks) {
    this.els.cartItems.textContent = "";

    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    this.els.cartCount.textContent = `${itemCount} ${itemCount === 1 ? "ítem" : "ítems"}`;

    if (cart.length === 0) {
      this.els.cartItems.append(
        this.createEl("div", {
          className: "empty-cart",
          text: "El carrito está vacío. Agregá productos desde el buscador o el catálogo.",
        })
      );
    } else {
      cart.forEach((item) => {
        const row = this.createEl("article", { className: "cart-item" });
        const top = this.createEl("div", { className: "cart-item-top" });
        const details = this.createEl("div");
        const name = this.createEl("h4", { text: item.product.name });
        const unit = this.createEl("small", {
          text: `${CaseritasUtils.money(item.product.price)} c/u - ${item.product.weight} g`,
        });
        const lineTotal = this.createEl("strong", {
          text: CaseritasUtils.money(item.product.price * item.quantity),
        });

        const actions = this.createEl("div", { className: "cart-item-actions" });
        const qty = this.createEl("div", { className: "qty-controls" });
        const decrease = this.createEl("button", {
          type: "button",
          text: "−",
          ariaLabel: `Disminuir cantidad de ${item.product.name}`,
        });
        const quantity = this.createEl("span", { text: String(item.quantity) });
        const increase = this.createEl("button", {
          type: "button",
          text: "+",
          ariaLabel: `Aumentar cantidad de ${item.product.name}`,
        });
        const remove = this.createEl("button", {
          className: "remove-button",
          type: "button",
          text: "Eliminar",
        });

        decrease.addEventListener("click", () => callbacks.onQuantityChange(item.product.id, -1));
        increase.addEventListener("click", () => callbacks.onQuantityChange(item.product.id, 1));
        remove.addEventListener("click", () => callbacks.onRemoveProduct(item.product.id));

        details.append(name, unit);
        top.append(details, lineTotal);
        qty.append(decrease, quantity, increase);
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

  openMissingProductModal(term) {
    const safeTerm = CaseritasUtils.sanitizeText(term);
    this.els.missingForm.reset();
    this.els.newName.value = safeTerm && !/^\d+$/.test(safeTerm) ? safeTerm : "";
    this.els.newBarcode.value = CaseritasUtils.sanitizeBarcode(term);
    this.updateNewProductPreview();
    this.els.modal.classList.remove("hidden");
    this.els.newName.focus();
  }

  closeMissingProductModal() {
    this.els.modal.classList.add("hidden");
    this.els.searchInput.focus();
  }

  updateNewProductPreview() {
    const priceKg = CaseritasUtils.positiveNumber(this.els.newPriceKg.value);
    const weight = CaseritasUtils.positiveNumber(this.els.newWeight.value);
    const amount = priceKg * (weight / 1000);
    this.els.newProductTotal.textContent = CaseritasUtils.money(amount);
  }

  setPaymentUI(method) {
    this.els.cashBox.classList.toggle("hidden", method !== "cash");
  }

  resetSaleControls() {
    this.els.discount.value = "0";
    this.els.cashReceived.value = "";
    this.els.paymentInputs.forEach((input) => {
      input.checked = false;
    });
    this.els.cashBox.classList.add("hidden");
  }

  clearSearch() {
    this.els.searchInput.value = "";
    this.els.searchInput.focus();
  }

  normalizeDiscountInput() {
    if (Number(this.els.discount.value) > 100) {
      this.els.discount.value = "100";
    }
  }

  getSearchTerm() {
    return CaseritasUtils.sanitizeText(this.els.searchInput.value);
  }

  getDiscountValue() {
    this.normalizeDiscountInput();
    return this.els.discount.value;
  }

  getCashReceived() {
    return this.els.cashReceived.value;
  }

  getMissingProductForm() {
    return {
      name: CaseritasUtils.sanitizeText(this.els.newName.value),
      barcode: CaseritasUtils.sanitizeBarcode(this.els.newBarcode.value),
      priceKg: CaseritasUtils.positiveNumber(this.els.newPriceKg.value),
      weight: CaseritasUtils.positiveNumber(this.els.newWeight.value),
    };
  }

  bind(events) {
    this.abortController = new AbortController();
    const options = { signal: this.abortController.signal };

    this.els.searchForm.addEventListener("submit", events.onSearchSubmit, options);
    this.els.searchInput.addEventListener("input", events.onSearchInput, options);
    this.els.discount.addEventListener("input", events.onTotalsChange, options);
    this.els.cashReceived.addEventListener("input", events.onTotalsChange, options);
    this.els.chargeButton.addEventListener("click", events.onCharge, options);
    this.els.clearSaleButton.addEventListener("click", events.onClearSale, options);
    this.els.closeModalButton.addEventListener("click", events.onCloseModal, options);
    this.els.cancelModalButton.addEventListener("click", events.onCloseModal, options);
    this.els.missingForm.addEventListener("submit", events.onMissingProductSubmit, options);
    this.els.newPriceKg.addEventListener("input", () => this.updateNewProductPreview(), options);
    this.els.newWeight.addEventListener("input", () => this.updateNewProductPreview(), options);

    this.els.paymentInputs.forEach((input) => {
      input.addEventListener("change", () => events.onPaymentChange(input.value), options);
    });

    this.els.modal.addEventListener("click", (event) => {
      if (event.target === this.els.modal) {
        events.onCloseModal();
      }
    }, options);

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !this.els.modal.classList.contains("hidden")) {
        events.onCloseModal();
      }
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
