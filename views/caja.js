"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.Caja = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="caja-title">
        <p class="eyebrow">Finanzas</p>
        <h2 id="caja-title">Caja</h2>
        <p>Vista preparada para apertura, cierre, movimientos y arqueos de caja.</p>
      </section>
    `;
  },
  init() {},
  destroy() {},
};
