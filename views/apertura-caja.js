"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.AperturaCaja = {
  render() {
    return `
      <section class="view-placeholder" aria-labelledby="apertura-title">
        <p class="eyebrow">Inicio de jornada</p>
        <h2 id="apertura-title">Apertura de Caja</h2>
        <form id="open-cash-form" class="modal-form" autocomplete="off">
          <div class="field-row stacked">
            <label for="cashier-name">Cajero</label>
            <input id="cashier-name" type="text" maxlength="80" required placeholder="Nombre del cajero">
          </div>
          <div class="field-row stacked">
            <label for="cash-register-name">Caja</label>
            <input id="cash-register-name" type="text" maxlength="80" required value="Caja principal">
          </div>
          <div class="field-row stacked">
            <label for="opening-fund">Fondo inicial</label>
            <input id="opening-fund" type="number" min="0" step="1" value="0" required>
          </div>
          <div class="message-area" id="open-cash-message" role="status" aria-live="polite"></div>
          <div class="modal-actions">
            <button class="primary-button" type="submit">Abrir caja</button>
          </div>
        </form>
      </section>
    `;
  },

  init(context) {
    const { api, appState } = context;
    const form = document.querySelector("#open-cash-form");
    const message = document.querySelector("#open-cash-message");
    const submitButton = form.querySelector("button[type='submit']");
    const cashier = document.querySelector("#cashier-name");
    const register = document.querySelector("#cash-register-name");
    const fund = document.querySelector("#opening-fund");
    let openingInFlight = false;

    const state = appState.snapshot();
    if (state.usuario) {
      cashier.value = state.usuario.nombre;
    }
    if (state.caja && state.caja.estado === "abierta") {
      register.value = state.caja.nombre;
      fund.value = state.caja.fondoInicial;
      message.innerHTML = `<div class="message success">Caja abierta desde ${new Date(state.caja.abiertaEn).toLocaleString("es-UY")}.</div>`;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (openingInFlight) {
        return;
      }

      const currentState = appState.snapshot();
      if (currentState.caja && currentState.caja.estado === "abierta" && currentState.caja.confirmadaBackend) {
        message.innerHTML = `<div class="message warning">Ya hay una caja abierta. Cerrala antes de abrir otra.</div>`;
        return;
      }

      const cajero = CaseritasUtils.sanitizeText(cashier.value);
      const cajaNombre = CaseritasUtils.sanitizeText(register.value);
      const normalizedCaja = CaseritasUtils.normalize(cajaNombre).replace(/\s+/g, "-") || "principal";
      const usuario = {
        id: `usuario-${CaseritasUtils.normalize(cajero).replace(/\s+/g, "-") || Date.now()}`,
        nombre: cajero,
      };
      const cajaId = `caja-${normalizedCaja}`;
      const operationId = appState.beginCashOperation("abrir", "caja", {
        empresaId: currentState.empresa.id,
        usuario,
        cajaId,
        cajaNombre,
        fondoInicial: CaseritasUtils.positiveNumber(fund.value),
      });

      openingInFlight = true;
      submitButton.disabled = true;
      message.innerHTML = `<div class="message warning">Abriendo caja en servidor...</div>`;

      try {
        const result = await api.openCashSession({
          operationId,
          empresaId: currentState.empresa.id,
          usuarioId: usuario.id,
          cajaId,
          fondoInicial: CaseritasUtils.positiveNumber(fund.value),
          fechaHora: CaseritasUtils.todayIso(),
        });

        appState.setServidor("online");
        appState.setCajaAbiertaConfirmada({
          cajaId,
          cajaNombre,
          cajaSesionId: result.cajaSesionId,
          fondoInicial: result.fondoInicial,
          fechaApertura: result.fechaApertura || CaseritasUtils.todayIso(),
          usuario,
        });
        appState.clearCashOperation("abrir", operationId);
        message.innerHTML = `<div class="message success">${CaseritasUtils.escapeHtml(cajaNombre)} abierta correctamente.</div>`;
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
          appState.markCashOperationUnknown("abrir", operationId);
          message.innerHTML = `<div class="message warning">Operación pendiente de verificación. No abras otra caja hasta consultar el estado.</div>`;
          return;
        }

        appState.clearCashOperation("abrir", operationId);
        message.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        openingInFlight = false;
        submitButton.disabled = false;
      }
    });
  },

  destroy() {},
};
