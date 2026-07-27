"use strict";

window.CaseritasViews = window.CaseritasViews || {};

window.CaseritasViews.HistorialDia = {
  sales: [],
  detailCache: new Map(),
  loading: false,
  voidInFlight: false,
  pendingVoidSale: null,

  render() {
    return `
      <section class="view-placeholder" aria-labelledby="history-title">
        <p class="eyebrow">Ventas</p>
        <h2 id="history-title">Historial del Dia</h2>
        <div class="field-row stacked">
          <label for="history-search">Buscar</label>
          <input id="history-search" type="search" placeholder="Cliente, total, forma de pago u operacion">
        </div>
        <div class="field-row stacked">
          <label for="history-status">Estado</label>
          <select id="history-status">
            <option value="">Todos</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="ANULADA">Anuladas</option>
            <option value="ANULACION_PENDIENTE">Anulacion pendiente</option>
            <option value="ERROR">Error</option>
          </select>
        </div>
        <div class="message-area" id="history-message" role="status" aria-live="polite"></div>
        <div class="modal-actions">
          <button class="ghost-button" id="refresh-history-button" type="button">Reintentar consulta</button>
        </div>
        <div class="message-area" id="history-list" aria-live="polite"></div>
        <div class="message-area" id="history-detail" aria-live="polite"></div>
      </section>

      <div class="modal-backdrop hidden" id="void-sale-modal" role="presentation">
        <section class="modal" role="dialog" aria-modal="true" aria-labelledby="void-sale-title" aria-describedby="void-sale-description">
          <div class="modal-heading">
            <div>
              <p class="eyebrow">Anulación controlada</p>
              <h2 id="void-sale-title">Anular venta</h2>
            </div>
            <button class="icon-button" id="void-cancel-x" type="button" aria-label="Cerrar">×</button>
          </div>
          <p id="void-sale-description">Ingresá el motivo para registrar los movimientos inversos.</p>
          <form id="void-sale-form" class="modal-form" autocomplete="off">
            <div class="field-row stacked">
              <label for="void-reason">Motivo</label>
              <input id="void-reason" type="text" maxlength="160" required placeholder="Ej: error de cobro">
            </div>
            <div class="modal-actions">
              <button class="ghost-button" id="void-cancel-button" type="button">Cancelar</button>
              <button class="primary-button" type="submit">Anular venta</button>
            </div>
          </form>
        </section>
      </div>
    `;
  },

  async init(context) {
    const { api, appState } = context;
    const search = document.querySelector("#history-search");
    const status = document.querySelector("#history-status");
    const message = document.querySelector("#history-message");
    const list = document.querySelector("#history-list");
    const detail = document.querySelector("#history-detail");
    const refreshButton = document.querySelector("#refresh-history-button");
    const voidModal = document.querySelector("#void-sale-modal");
    const voidForm = document.querySelector("#void-sale-form");
    const voidReason = document.querySelector("#void-reason");
    const voidCancelButton = document.querySelector("#void-cancel-button");
    const voidCancelX = document.querySelector("#void-cancel-x");
    const view = this;

    function normalizeSale(sale) {
      const ventaId = String(sale.ventaId || sale.id || "");
      const operationId = String(sale.operationId || "");
      return {
        ventaId,
        id: ventaId,
        operationId,
        empresaId: sale.empresaId || "",
        usuarioId: sale.usuarioId || "",
        cajaSesionId: sale.cajaSesionId || "",
        fechaHora: sale.fechaHora || sale.fecha || sale.createdAt || "",
        cliente: sale.cliente || sale.customerName || "Consumidor final",
        formaPago: sale.formaPago || sale.metodoPago || sale.paymentMethod || "",
        subtotal: Number(sale.subtotal || 0),
        total: Number(sale.total || 0),
        estado: String(sale.estado || "PENDIENTE").toUpperCase(),
        detalle: Array.isArray(sale.detalle) ? sale.detalle : sale.items || [],
        source: sale.source || "server",
      };
    }

    function localPendingSales() {
      const state = appState.snapshot();
      return state.ventasDia
        .filter((sale) => {
          const estado = String(sale.estado || "").toLowerCase();
          return estado !== "confirmada" || state.pendingSaleOperation?.operationId === sale.operationId;
        })
        .map((sale) => normalizeSale({ ...sale, source: "local" }));
    }

    function mergeSales(serverSales) {
      const merged = new Map();
      [...localPendingSales(), ...serverSales.map(normalizeSale)].forEach((sale) => {
        const key = sale.operationId || sale.ventaId;
        const existing = merged.get(key);
        if (!existing || sale.source === "server") {
          merged.set(key, sale);
        }
      });
      return Array.from(merged.values()).sort((a, b) => new Date(b.fechaHora || 0) - new Date(a.fechaHora || 0));
    }

    function currentFilters() {
      const state = appState.snapshot();
      const today = new Date();
      const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
      return {
        empresaId: state.empresa.id,
        usuarioId: state.usuario ? state.usuario.id : "",
        cajaSesionId: state.caja ? state.caja.cajaSesionId : "",
        fechaDesde: start,
        fechaHasta: end,
        estado: status.value,
        busqueda: CaseritasUtils.sanitizeText(search.value),
      };
    }

    function saleMatches(sale) {
      const term = CaseritasUtils.normalize(search.value);
      if (!term) {
        return true;
      }

      const haystack = `${sale.ventaId} ${sale.operationId} ${sale.cliente} ${sale.formaPago} ${sale.total} ${sale.estado}`;
      return CaseritasUtils.normalize(haystack).includes(term);
    }

    function renderList() {
      const filtered = view.sales.filter((sale) => {
        return (!status.value || sale.estado === status.value) && saleMatches(sale);
      });

      if (view.loading) {
        list.innerHTML = `<div class="empty-cart">Consultando historial...</div>`;
        return;
      }

      if (filtered.length === 0) {
        list.innerHTML = `<div class="empty-cart">No hay ventas para mostrar.</div>`;
        return;
      }

      list.innerHTML = filtered
        .map((sale) => {
          const cliente = CaseritasUtils.escapeHtml(sale.cliente);
          const metodoPago = CaseritasUtils.escapeHtml(sale.formaPago);
          const operationId = CaseritasUtils.escapeHtml(sale.operationId || "");
          const estado = CaseritasUtils.escapeHtml(sale.estado);
          const canVoid = sale.estado === "CONFIRMADA" && sale.source === "server";
          return `
          <article class="cart-item">
            <div class="cart-item-top">
              <div>
                <h4>${cliente}</h4>
                <small>${new Date(sale.fechaHora).toLocaleString("es-UY")} - ${metodoPago} - ${operationId} - ${estado}</small>
              </div>
              <strong>${CaseritasUtils.money(sale.total)}</strong>
            </div>
            <div class="cart-item-actions">
              <button type="button" data-detail="${CaseritasUtils.escapeHtml(sale.ventaId)}">Detalle</button>
              <button type="button" data-reprint="${CaseritasUtils.escapeHtml(sale.ventaId)}">Reimprimir</button>
              ${canVoid ? `<button class="remove-button" type="button" data-void="${CaseritasUtils.escapeHtml(sale.ventaId)}">Anular</button>` : ""}
            </div>
          </article>
        `;
        })
        .join("");

      list.querySelectorAll("[data-reprint]").forEach((button) => {
        button.addEventListener("click", () => window.print());
      });

      list.querySelectorAll("[data-detail]").forEach((button) => {
        button.addEventListener("click", () => loadDetail(button.dataset.detail));
      });

      list.querySelectorAll("[data-void]").forEach((button) => {
        button.addEventListener("click", () => voidSale(button.dataset.void));
      });
    }

    function renderDetail(payload) {
      const sale = payload.venta || payload;
      const detailRows = Array.isArray(payload.detalle) ? payload.detalle : sale.detalle || [];
      const stockRows = Array.isArray(payload.movimientosStock) ? payload.movimientosStock : [];
      const cajaRows = Array.isArray(payload.movimientosCaja) ? payload.movimientosCaja : [];
      detail.innerHTML = `
        <article class="cart-item">
          <div class="cart-item-top">
            <div>
              <h4>Detalle ${CaseritasUtils.escapeHtml(sale.ventaId || sale.id || "")}</h4>
              <small>${CaseritasUtils.escapeHtml(sale.estado || "")} - ${CaseritasUtils.escapeHtml(sale.operationId || "")}</small>
            </div>
            <strong>${CaseritasUtils.money(sale.total || 0)}</strong>
          </div>
          <div class="cart-item-actions">
            <span>${detailRows.length} productos</span>
            <span>${stockRows.length} movimientos stock</span>
            <span>${cajaRows.length} movimientos caja</span>
          </div>
        </article>
      `;
    }

    async function loadHistory() {
      view.loading = true;
      message.innerHTML = `<div class="message warning">Consultando servidor...</div>`;
      renderList();

      try {
        const ventas = await api.getSalesHistory(currentFilters());
        appState.setServidor("online");
        view.sales = mergeSales(ventas);
        message.innerHTML = `<div class="message success">Historial actualizado desde servidor.</div>`;
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
        }
        view.sales = mergeSales([]);
        message.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        view.loading = false;
        renderList();
      }
    }

    async function loadDetail(ventaId) {
      if (!ventaId) {
        return;
      }

      detail.innerHTML = `<div class="empty-cart">Consultando detalle...</div>`;

      try {
        const state = appState.snapshot();
        const payload = await api.getSaleDetail({
          empresaId: state.empresa.id,
          ventaId,
        });
        appState.setServidor("online");
        view.detailCache.set(ventaId, payload);
        renderDetail(payload);
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
        }
        detail.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      }
    }

    async function voidSale(ventaId) {
      if (view.voidInFlight || !ventaId) {
        return;
      }

      const sale = view.sales.find((item) => item.ventaId === ventaId);
      if (!sale || sale.estado !== "CONFIRMADA") {
        message.innerHTML = `<div class="message warning">La venta no está disponible para anular.</div>`;
        return;
      }

      await loadDetail(ventaId);
      view.pendingVoidSale = sale;
      voidReason.value = "";
      voidModal.classList.remove("hidden");
      voidReason.focus();
    }

    function closeVoidModal() {
      view.pendingVoidSale = null;
      voidModal.classList.add("hidden");
    }

    async function confirmVoidSale(event) {
      event.preventDefault();
      if (view.voidInFlight || !view.pendingVoidSale) {
        return;
      }

      const sale = view.pendingVoidSale;
      const ventaId = sale.ventaId;
      const cleanReason = CaseritasUtils.sanitizeText(voidReason.value || "");

      if (!cleanReason) {
        message.innerHTML = `<div class="message warning">El motivo es obligatorio para anular.</div>`;
        voidReason.focus();
        return;
      }

      const state = appState.snapshot();
      const operationId = appState.beginVoidOperation(ventaId, {
        empresaId: state.empresa.id,
        usuarioId: state.usuario ? state.usuario.id : "",
        cajaSesionId: state.caja ? state.caja.cajaSesionId : "",
        motivo: cleanReason,
      });

      view.voidInFlight = true;
      voidForm.querySelector("button[type='submit']").disabled = true;
      message.innerHTML = `<div class="message warning">Anulando venta...</div>`;
      renderList();

      try {
        const result = await api.voidSale({
          operationId,
          empresaId: state.empresa.id,
          usuarioId: state.usuario ? state.usuario.id : "",
          cajaSesionId: state.caja ? state.caja.cajaSesionId : "",
          ventaId,
          motivo: cleanReason,
          fechaHora: CaseritasUtils.todayIso(),
        });
        appState.setServidor("online");
        appState.markVentaAnulada(ventaId, sale.operationId);
        appState.clearVoidOperation(ventaId, operationId);
        closeVoidModal();
        message.innerHTML = `<div class="message success">Venta anulada correctamente.</div>`;
        await loadHistory();
        if (result.ventaId) {
          await loadDetail(result.ventaId);
        }
      } catch (error) {
        if (error.message === "Servidor no disponible") {
          appState.setServidor("offline");
          appState.markVoidOperationUnknown(ventaId, operationId);
          closeVoidModal();
          message.innerHTML = `<div class="message warning">Anulación pendiente de verificación. Consultá el detalle antes de repetirla.</div>`;
          return;
        }

        appState.clearVoidOperation(ventaId, operationId);
        message.innerHTML = `<div class="message error">${CaseritasUtils.escapeHtml(CaseritasUtils.friendlyApiError(error))}</div>`;
      } finally {
        view.voidInFlight = false;
        voidForm.querySelector("button[type='submit']").disabled = false;
        renderList();
      }
    }
    voidForm.addEventListener("submit", confirmVoidSale);
    voidCancelButton.addEventListener("click", closeVoidModal);
    voidCancelX.addEventListener("click", closeVoidModal);
    voidModal.addEventListener("click", (event) => {
      if (event.target === voidModal) {
        closeVoidModal();
      }
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !voidModal.classList.contains("hidden")) {
        closeVoidModal();
      }
    });
    search.addEventListener("input", renderList);
    status.addEventListener("change", loadHistory);
    refreshButton.addEventListener("click", loadHistory);
    await loadHistory();
  },

  destroy() {
    this.sales = [];
    this.detailCache.clear();
    this.loading = false;
    this.voidInFlight = false;
  },
};
