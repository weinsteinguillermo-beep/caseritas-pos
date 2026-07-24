"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.Caja = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="caja-title">
        <p class="eyebrow">Finanzas</p>
        <h2 id="caja-title">Caja</h2>
        <div class="totals" aria-label="Estado de caja">
          <div class="total-line"><span>Estado</span><strong id="cash-state">-</strong></div>
          <div class="total-line"><span>Fondo inicial</span><strong id="cash-opening">$0</strong></div>
          <div class="total-line"><span>Total esperado</span><strong id="cash-expected">$0</strong></div>
        </div>
        <div class="message-area" id="cash-status-message" role="status" aria-live="polite"></div>
        <div class="modal-actions">
          <a class="primary-button" href="#apertura">Apertura</a>
          <a class="ghost-button" href="#movimientos">Movimientos</a>
          <a class="ghost-button" href="#cierre">Cierre</a>
        </div>
      </section>
    `;
  },
  async init(context) {
    const { api, appState } = context;
    const stateEl = document.querySelector("#cash-state");
    const openingEl = document.querySelector("#cash-opening");
    const expectedEl = document.querySelector("#cash-expected");
    const message = document.querySelector("#cash-status-message");

    function render() {
      const state = appState.snapshot();
      const caja = state.caja;
      stateEl.textContent = caja ? `${caja.estado}${caja.confirmadaBackend ? "" : " pendiente"}` : "cerrada";
      openingEl.textContent = CaseritasUtils.money(caja ? caja.fondoInicial : 0);
      expectedEl.textContent = CaseritasUtils.money(appState.totalEsperadoCaja());
    }

    render();

    const state = appState.snapshot();
    if (!state.usuario || !state.caja) {
      message.innerHTML = `<div class="message warning">Sin caja local para consultar.</div>`;
      return;
    }

    try {
      const status = await api.getCashStatus({
        empresaId: state.empresa.id,
        usuarioId: state.usuario.id,
        cajaId: state.caja.id,
      });
      appState.setServidor("online");
      appState.reconcileCajaStatus(status, {
        cajaId: state.caja.id,
        cajaNombre: state.caja.nombre,
        usuario: state.usuario,
      });
      render();
      message.innerHTML = status.abierta
        ? `<div class="message success">Caja abierta confirmada por servidor.</div>`
        : `<div class="message warning">No hay caja abierta en servidor.</div>`;
    } catch (error) {
      if (error.message === "Servidor no disponible") {
        appState.setServidor("offline");
      }
      message.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
    }
  },
  destroy() {},
};
