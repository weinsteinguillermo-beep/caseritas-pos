"use strict";

const api = new CaseritasAPI();
const pos = new POS(api);

const router = new Router({
  outlet: "#app-view",
  nav: "#app-nav",
  defaultRoute: "pos",
  context: { api, pos },
  routes: [
    { id: "pos", label: "POS", icon: "PV", script: "views/pos.js", viewName: "POS" },
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
