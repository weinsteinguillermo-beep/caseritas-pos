"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.CierreCaja = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="close-cash-title">
        <p class="eyebrow">Fin de jornada</p>
        <h2 id="close-cash-title">Cierre de Caja</h2>
        <div class="totals" aria-label="Resumen de cierre">
          <div class="total-line"><span>Total esperado</span><strong id="expected-total">$0</strong></div>
          <div class="total-line"><span>Total contado</span><strong id="counted-total">$0</strong></div>
          <div class="total-line final"><span>Diferencia</span><strong id="cash-difference">$0</strong></div>
        </div>
        <form id="close-cash-form" class="modal-form" autocomplete="off">
          <div class="field-row stacked">
            <label for="counted-cash">Total contado</label>
            <input id="counted-cash" type="number" min="0" step="1" required>
          </div>
          <div class="field-row stacked">
            <label for="close-notes">Observaciones</label>
            <input id="close-notes" type="text" maxlength="160" placeholder="Detalle diferencias o comentarios">
          </div>
          <div class="message-area" id="close-message" role="status" aria-live="polite"></div>
          <div class="modal-actions">
            <button class="primary-button" type="submit">Cerrar caja</button>
          </div>
        </form>
      </section>
    `;
  },

  init(context) {
    const { api, appState } = context;
    const expected = document.querySelector("#expected-total");
    const counted = document.querySelector("#counted-total");
    const difference = document.querySelector("#cash-difference");
    const countedInput = document.querySelector("#counted-cash");
    const notes = document.querySelector("#close-notes");
    const form = document.querySelector("#close-cash-form");
    const submitButton = form.querySelector("button[type='submit']");
    const message = document.querySelector("#close-message");
    let closeInFlight = false;

    function renderTotals() {
      const expectedValue = appState.totalEsperadoCaja();
      const countedValue = CaseritasUtils.positiveNumber(countedInput.value);
      expected.textContent = CaseritasUtils.money(expectedValue);
      counted.textContent = CaseritasUtils.money(countedValue);
      difference.textContent = CaseritasUtils.signedMoney(countedValue - expectedValue);
    }

    countedInput.addEventListener("input", renderTotals);

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (closeInFlight) {
        return;
      }

      const state = appState.snapshot();
      if (!state.caja || state.caja.estado !== "abierta" || !state.caja.confirmadaBackend) {
        message.innerHTML = `<div class="message error">No hay caja abierta para cerrar.</div>`;
        return;
      }
      const expectedValue = appState.totalEsperadoCaja();
      const countedValue = CaseritasUtils.positiveNumber(countedInput.value);
      if (countedValue !== expectedValue && !CaseritasUtils.sanitizeText(notes.value)) {
        message.innerHTML = `<div class="message warning">Agregá observaciones para cerrar con diferencia.</div>`;
        return;
      }
      const operationId = appState.beginCashOperation("cerrar", "caja", {
        empresaId: state.empresa.id,
        usuarioId: state.usuario ? state.usuario.id : null,
        cajaSesionId: state.caja.cajaSesionId,
        totalContado: countedValue,
      });
      closeInFlight = true;
      submitButton.disabled = true;
      message.innerHTML = `<div class="message warning">Cerrando caja en servidor...</div>`;

      try {
        const result = await api.closeCashSession({
          operationId,
          empresaId: state.empresa.id,
          usuarioId: state.usuario ? state.usuario.id : null,
          cajaSesionId: state.caja.cajaSesionId,
          totalContado: countedValue,
          observaciones: CaseritasUtils.sanitizeText(notes.value),
          fechaHora: CaseritasUtils.todayIso(),
        });

        appState.setServidor("online");
        appState.setCajaCerradaConfirmada({
          cajaSesionId: result.cajaSesionId,
          totalEsperado: result.totalEsperado,
          totalContado: result.totalContado,
          diferencia: result.diferencia,
          observaciones: notes.value,
          fechaCierre: result.fechaCierre || CaseritasUtils.todayIso(),
        });
        appState.clearCashOperation("cerrar", operationId);
        expected.textContent = CaseritasUtils.money(result.totalEsperado);
        counted.textContent = CaseritasUtils.money(result.totalContado);
        difference.textContent = CaseritasUtils.signedMoney(result.diferencia);
        message.innerHTML = `<div class="message success">Caja cerrada correctamente.</div>`;
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
          appState.markCashOperationUnknown("cerrar", operationId);
          message.innerHTML = `<div class="message warning">Cierre pendiente de verificación. No vuelvas a cerrar la caja hasta consultar el estado.</div>`;
          return;
        }

        appState.clearCashOperation("cerrar", operationId);
        message.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        closeInFlight = false;
        submitButton.disabled = false;
      }
    });

    renderTotals();
  },

  destroy() {},
};
