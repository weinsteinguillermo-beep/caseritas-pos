"use strict";

import "./api.js";

const api = new CaseritasAPI();
const appState = new CaseritasAppState();
const pos = new POS(api);

const router = new Router({
  outlet: "#app-view",
  nav: "#app-nav",
  defaultRoute: "pos",
  context: { api, pos, appState },
  routes: [
    { id: "pos", label: "POS", icon: "PV", script: "views/pos.js", viewName: "POS" },
    { id: "apertura", label: "Apertura", icon: "AP", script: "views/apertura-caja.js", viewName: "AperturaCaja" },
    { id: "historial", label: "Historial", icon: "HI", script: "views/historial-dia.js", viewName: "HistorialDia" },
    { id: "movimientos", label: "Movimientos", icon: "MC", script: "views/movimientos-caja.js", viewName: "MovimientosCaja" },
    { id: "cierre", label: "Cierre", icon: "CC", script: "views/cierre-caja.js", viewName: "CierreCaja" },
    { id: "clientes", label: "Clientes", icon: "CL", script: "views/clientes.js", viewName: "Clientes" },
    { id: "productos", label: "Productos", icon: "PR", script: "views/productos.js", viewName: "Productos" },
    { id: "produccion", label: "Producción", icon: "PD", script: "views/produccion.js", viewName: "Produccion" },
    { id: "caja", label: "Caja", icon: "CJ", script: "views/caja.js", viewName: "Caja" },
    { id: "reportes", label: "Reportes", icon: "RP", script: "views/reportes.js", viewName: "Reportes" },
    {
      id: "configuracion",
      label: "Configuración",
      icon: "CF",
      script: "views/configuracion.js",
      viewName: "Configuracion",
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
