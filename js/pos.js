"use strict";

/**
 * Lógica central del punto de venta.
 * Mantiene el estado de productos, carrito, pago, descuentos y cobro.
 */
class POS {
  constructor(api) {
    this.api = api;
    this.products = [];
    this.cart = [];
    this.search = "";
    this.paymentMethod = "";
  }

  async cargarProductos(search = "") {
    this.search = CaseritasUtils.sanitizeText(search);
    this.products = await this.api.searchProducts(this.search);
    return this.products;
  }

  buscarProductoLocalPorNombre(term) {
    const normalized = CaseritasUtils.normalize(term);

    if (!normalized) {
      return null;
    }

    return this.products.find((product) => CaseritasUtils.normalize(product.name).includes(normalized)) || null;
  }

  async buscarProductoParaVenta(term) {
    const safeTerm = CaseritasUtils.sanitizeText(term);
    const looksLikeBarcode = /\d/.test(safeTerm) && /^[\dA-Za-z-]+$/.test(safeTerm);
    const barcodeProduct = looksLikeBarcode ? await this.api.getProductByBarcode(safeTerm) : null;

    if (barcodeProduct) {
      return barcodeProduct;
    }

    const products = await this.api.searchProducts(safeTerm);
    return (
      products.find((item) => CaseritasUtils.normalize(item.name) === CaseritasUtils.normalize(safeTerm)) ||
      products[0] ||
      this.buscarProductoLocalPorNombre(safeTerm) ||
      null
    );
  }

  agregarProducto(product) {
    const existing = this.cart.find((item) => item.product.id === product.id);

    if (existing) {
      existing.quantity += 1;
    } else {
      this.cart.push({ product, quantity: 1 });
    }

    return this.cart;
  }

  eliminarProducto(productId) {
    this.cart = this.cart.filter((item) => item.product.id !== productId);
    return this.cart;
  }

  modificarCantidad(productId, delta) {
    const item = this.cart.find((entry) => entry.product.id === productId);

    if (!item) {
      return this.cart;
    }

    item.quantity += delta;

    if (item.quantity <= 0) {
      return this.eliminarProducto(productId);
    }

    return this.cart;
  }

  setMetodoPago(method) {
    this.paymentMethod = method;
  }

  subtotal() {
    return this.cart.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);
  }

  calcularDescuento(discountValue) {
    const value = Number(discountValue);

    if (!Number.isFinite(value) || value < 0) {
      return 0;
    }

    if (value > 100) {
      return 100;
    }

    return value;
  }

  total(discountValue) {
    const saleSubtotal = this.subtotal();
    return saleSubtotal - saleSubtotal * (this.calcularDescuento(discountValue) / 100);
  }

  calcularVuelto(cashReceived, discountValue) {
    const received = CaseritasUtils.positiveNumber(cashReceived);
    const change = this.paymentMethod === "cash" ? received - this.total(discountValue) : 0;
    return change >= 0 ? change : 0;
  }

  validarCobro(discountValue, cashReceived) {
    if (this.cart.length === 0) {
      return "Agregá al menos un producto antes de cobrar.";
    }

    if (!this.paymentMethod) {
      return "Seleccioná un método de pago.";
    }

    if (this.paymentMethod === "cash" && CaseritasUtils.positiveNumber(cashReceived) < this.total(discountValue)) {
      return "El efectivo recibido no alcanza para cubrir el total.";
    }

    return "";
  }

  ventaPayload(discountValue, cashReceived) {
    const saleSubtotal = this.subtotal();
    const saleDiscountPercent = this.calcularDescuento(discountValue);
    const saleTotal = this.total(discountValue);

    return {
      createdAt: CaseritasUtils.todayIso(),
      items: this.cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        barcode: item.product.barcode,
        unitPrice: item.product.price,
        weight: item.product.weight,
        quantity: item.quantity,
        lineTotal: item.product.price * item.quantity,
      })),
      paymentMethod: this.paymentMethod,
      cashReceived: this.paymentMethod === "cash" ? CaseritasUtils.positiveNumber(cashReceived) : 0,
      subtotal: saleSubtotal,
      discountPercent: saleDiscountPercent,
      discountAmount: saleSubtotal * (saleDiscountPercent / 100),
      total: saleTotal,
    };
  }

  async cobrar(discountValue, cashReceived) {
    const error = this.validarCobro(discountValue, cashReceived);

    if (error) {
      throw new Error(error);
    }

    const payload = this.ventaPayload(discountValue, cashReceived);
    await this.api.createSale(payload);

    this.limpiarVenta();
    return payload;
  }

  limpiarVenta() {
    this.cart = [];
    this.paymentMethod = "";
    return this.cart;
  }
}

window.POS = POS;
