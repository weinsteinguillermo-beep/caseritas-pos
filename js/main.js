"use strict";

import "./api.js";

const api = new CaseritasAPI();
const appState = new CaseritasAppState();
const pos = new POS(api);

function updateOperationalHeader(state) {
  const context = document.querySelector("#header-context");
  const cash = document.querySelector("#header-cash-status");
  const server = document.querySelector("#header-server-status");
  const sync = document.querySelector("#header-sync-status");
  const clock = document.querySelector("#header-clock");

  if (!context || !cash || !server || !sync || !clock) {
    return;
  }

  const empresa = state.empresa?.nombre || "Sucursal principal";
  const cajaNombre = state.caja?.nombre || "Caja sin abrir";
  const cajero = state.usuario?.nombre || "Sin cajero";
  const cajaAbierta = state.caja?.estado === "abierta" && state.caja?.confirmadaBackend === true;
  const cajaPendiente = state.caja?.estado === "abierta" && state.caja?.confirmadaBackend !== true;
  const pending = state.pendingSaleOperation || Object.keys(state.pendingCashOperations || {}).length > 0 || Object.keys(state.pendingVoidOperations || {}).length > 0;
  const now = new Date();

  context.textContent = `${empresa} · ${cajaNombre} · Cajero: ${cajero}`;
  cash.textContent = cajaAbierta ? "Caja abierta" : cajaPendiente ? "Caja pendiente" : "Caja cerrada";
  cash.dataset.state = cajaAbierta ? "success" : cajaPendiente ? "warning" : "danger";
  server.textContent = state.estadoServidor === "offline" ? "Servidor no disponible" : state.estadoServidor === "online" ? "Servidor online" : "Servidor pendiente";
  server.dataset.state = state.estadoServidor === "offline" ? "danger" : state.estadoServidor === "online" ? "success" : "warning";
  sync.textContent = pending ? "Operación pendiente" : state.modoOffline ? "Modo offline" : "Sincronización correcta";
  sync.dataset.state = pending ? "warning" : state.modoOffline ? "danger" : "neutral";
  clock.dateTime = now.toISOString();
  clock.textContent = now.toLocaleTimeString("es-UY", { hour: "2-digit", minute: "2-digit" });
}

appState.subscribe(updateOperationalHeader);
window.setInterval(() => updateOperationalHeader(appState.snapshot()), 30000);

const router = new Router({
  outlet: "#app-view",
  nav: "#app-nav",
  defaultRoute: "pos",
  context: { api, pos, appState },
  routes: [
    { id: "pos", label: "POS", icon: "PV", group: "OPERACION", script: "views/pos.js", viewName: "POS" },
    { id: "apertura", label: "Apertura", icon: "AP", group: "OPERACION", script: "views/apertura-caja.js", viewName: "AperturaCaja" },
    { id: "historial", label: "Historial", icon: "HI", group: "OPERACION", script: "views/historial-dia.js", viewName: "HistorialDia" },
    { id: "movimientos", label: "Movimientos", icon: "MC", group: "OPERACION", script: "views/movimientos-caja.js", viewName: "MovimientosCaja" },
    { id: "cierre", label: "Cierre", icon: "CC", group: "OPERACION", script: "views/cierre-caja.js", viewName: "CierreCaja" },
    { id: "clientes", label: "Clientes", icon: "CL", group: "GESTION", script: "views/clientes.js", viewName: "Clientes" },
    { id: "productos", label: "Productos", icon: "PR", group: "GESTION", script: "views/productos.js", viewName: "Productos" },
    { id: "produccion", label: "Producción", icon: "PD", group: "GESTION", script: "views/produccion.js", viewName: "Producción" },
    { id: "caja", label: "Caja", icon: "CJ", group: "ADMINISTRACION", script: "views/caja.js", viewName: "Caja" },
    { id: "reportes", label: "Reportes", icon: "RP", group: "ADMINISTRACION", script: "views/reportes.js", viewName: "Reportes" },
    {
      id: "configuracion",
      label: "Configuración",
      icon: "CF",
      group: "ADMINISTRACION",
      script: "views/configuracion.js",
      viewName: "Configuración",
    },
  ],
});

router.init();

async function recoverCashState() {
  const state = appState.snapshot();
  const pendingOpen = state.pendingCashOperations && state.pendingCashOperations.abrir;
  const pendingOpenData = pendingOpen && pendingOpen.data ? pendingOpen.data : null;
  const usuario = state.usuario || pendingOpenData?.usuario || null;
  const caja = state.caja || (pendingOpenData ? { id: pendingOpenData.cajaId, nombre: pendingOpenData.cajaNombre } : null);

  if (!usuario || !caja) {
    return;
  }

  try {
    const status = await api.getCashStatus({
      empresaId: state.empresa.id,
      usuarioId: usuario.id,
      cajaId: caja.id,
    });
    appState.setServidor("online");
    appState.reconcileCajaStatus(status, {
      cajaId: caja.id,
      cajaNombre: caja.nombre,
      usuario,
    });

    if (status.abierta && pendingOpen) {
      appState.clearCashOperation("abrir", pendingOpen.operationId);
    }
  } catch (error) {
    if (error.message === "Servidor no disponible") {
      appState.setServidor("offline");
    }
  }
}

recoverCashState();
