"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.MovimientosCaja = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="cash-movements-title">
        <p class="eyebrow">Caja</p>
        <h2 id="cash-movements-title">Movimientos de Caja</h2>
        <form id="cash-movement-form" class="modal-form" autocomplete="off">
          <div class="payment-options" role="radiogroup" aria-label="Tipo de movimiento">
            <label><input type="radio" name="movementType" value="Ingreso" checked><span>Ingreso</span></label>
            <label><input type="radio" name="movementType" value="Egreso"><span>Egreso</span></label>
          </div>
          <div class="field-row stacked">
            <label for="movement-reason">Motivo</label>
            <input id="movement-reason" type="text" maxlength="120" required placeholder="Ej: cambio, retiro, compra menor">
          </div>
          <div class="field-row stacked">
            <label for="movement-amount">Importe</label>
            <input id="movement-amount" type="number" min="1" step="1" required>
          </div>
          <div class="message-area" id="movement-message" role="status" aria-live="polite"></div>
          <div class="modal-actions">
            <button class="primary-button" type="submit">Registrar movimiento</button>
          </div>
        </form>
        <div class="message-area" id="movement-list" aria-live="polite"></div>
      </section>
    `;
  },

  init(context) {
    const { api, appState } = context;
    const form = document.querySelector("#cash-movement-form");
    const submitButton = form.querySelector("button[type='submit']");
    const reason = document.querySelector("#movement-reason");
    const amount = document.querySelector("#movement-amount");
    const message = document.querySelector("#movement-message");
    const list = document.querySelector("#movement-list");
    let movementInFlight = false;

    function renderList() {
      const movimientos = appState.snapshot().movimientosCaja;
      list.innerHTML = movimientos.length
        ? movimientos.map((movimiento) => `
            <article class="cart-item">
              <div class="cart-item-top">
                <div>
                  <h4>${CaseritasUtils.escapeHtml(movimiento.tipo)}: ${CaseritasUtils.escapeHtml(movimiento.motivo)}</h4>
                  <small>${new Date(movimiento.fecha).toLocaleString("es-UY")}</small>
                </div>
                <strong>${CaseritasUtils.signedMoney(movimiento.importe)}</strong>
              </div>
            </article>
          `).join("")
        : `<div class="empty-cart">Todavía no hay movimientos manuales.</div>`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (movementInFlight) {
        return;
      }

      const state = appState.snapshot();
      if (!state.caja || state.caja.estado !== "abierta" || !state.caja.confirmadaBackend) {
        message.innerHTML = `<div class="message error">Abrí caja y confirmá el servidor antes de registrar movimientos.</div>`;
        return;
      }

      const type = document.querySelector("input[name='movementType']:checked").value;
      const positiveAmount = CaseritasUtils.positiveNumber(amount.value);
      const signedAmount = type === "Egreso" ? -positiveAmount : positiveAmount;
      const operationId = appState.beginCashOperation("movimiento", "caja", {
        empresaId: state.empresa.id,
        usuarioId: state.usuario ? state.usuario.id : null,
        cajaSesionId: state.caja.cajaSesionId,
        tipo: type.toUpperCase(),
        importe: positiveAmount,
      });

      movementInFlight = true;
      submitButton.disabled = true;
      message.innerHTML = `<div class="message warning">Registrando movimiento en servidor...</div>`;

      try {
        const result = await api.createCashMovement({
          operationId,
          empresaId: state.empresa.id,
          usuarioId: state.usuario ? state.usuario.id : null,
          cajaSesionId: state.caja.cajaSesionId,
          tipo: type.toUpperCase(),
          importe: positiveAmount,
          motivo: CaseritasUtils.sanitizeText(reason.value),
          fechaHora: CaseritasUtils.todayIso(),
        });

        appState.setServidor("online");
        appState.addMovimientoCaja({
          id: result.movimientoCajaId,
          operationId,
          tipo: type,
          motivo: CaseritasUtils.sanitizeText(reason.value),
          importe: signedAmount,
          estado: "confirmado",
        });
        appState.clearCashOperation("movimiento", operationId);
        form.reset();
        document.querySelector("input[name='movementType'][value='Ingreso']").checked = true;
        message.innerHTML = `<div class="message success">Movimiento registrado.</div>`;
        renderList();
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
          appState.markCashOperationUnknown("movimiento", operationId);
          message.innerHTML = `<div class="message warning">Movimiento pendiente de verificación. No lo repitas hasta consultar el estado.</div>`;
          return;
        }

        appState.clearCashOperation("movimiento", operationId);
        message.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        movementInFlight = false;
        submitButton.disabled = false;
      }
    });

    renderList();
  },

  destroy() {},
};
