"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.Configuracion = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="configuracion-title">
        <p class="eyebrow">Sistema</p>
        <h2 id="configuracion-title">Configuración</h2>
        <p>Vista preparada para datos del comercio, parámetros de venta e integración con n8n.</p>
      </section>
    `;
  },
  init() {},
  destroy() {},
};
