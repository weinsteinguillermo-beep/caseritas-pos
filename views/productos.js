"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.Productos = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="productos-title">
        <p class="eyebrow">Inventario</p>
        <h2 id="productos-title">Productos</h2>
        <p>Vista preparada para administrar catálogo, códigos de barras, precios, pesos y stock.</p>
      </section>
    `;
  },
  init() {},
  destroy() {},
};
