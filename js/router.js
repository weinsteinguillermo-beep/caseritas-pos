"use strict";

/**
 * Router SPA propio para Caseritas POS.
 * Carga vistas bajo demanda, ejecuta render/init/destroy y evita recargas de página.
 */
class Router {
  constructor(options) {
    this.routes = options.routes;
    this.outlet = document.querySelector(options.outlet);
    this.nav = document.querySelector(options.nav);
    this.defaultRoute = options.defaultRoute;
    this.context = options.context;
    this.currentView = null;
    this.loadedScripts = new Set();
  }

  init() {
    this.installShellStyles();
    this.renderNavigation();
    window.addEventListener("hashchange", () => this.handleRoute());

    if (!window.location.hash) {
      window.location.hash = this.defaultRoute;
      return;
    }

    this.handleRoute();
  }

  renderNavigation() {
    this.nav.textContent = "";
    const groupLabels = {
      OPERACION: "Operación",
      GESTION: "Gestión",
      ADMINISTRACION: "Administración",
    };
    let currentGroup = "";

    this.routes.forEach((route) => {
      if (route.group && route.group !== currentGroup) {
        currentGroup = route.group;
        const heading = document.createElement("p");
        heading.className = "spa-nav-group";
        heading.textContent = groupLabels[currentGroup] || currentGroup;
        this.nav.append(heading);
      }

      const link = document.createElement("a");
      link.href = `#${route.id}`;
      link.className = "spa-nav-link";
      link.dataset.route = route.id;

      const icon = document.createElement("span");
      icon.className = "spa-nav-icon";
      icon.textContent = route.icon;

      const label = document.createElement("span");
      label.textContent = route.label;

      link.append(icon, label);
      this.nav.append(link);
    });
  }

  async handleRoute() {
    const routeId = window.location.hash.replace("#", "") || this.defaultRoute;
    const route = this.routes.find((item) => item.id === routeId) || this.routes[0];
    await this.navigate(route);
  }

  async navigate(route) {
    if (this.currentView && typeof this.currentView.destroy === "function") {
      this.currentView.destroy();
    }

    const view = await this.loadView(route);
    this.currentView = view;
    this.outlet.innerHTML = view.render(this.context);
    this.updateActiveLink(route.id);

    if (typeof view.init === "function") {
      await view.init(this.context);
    }
  }

  async loadView(route) {
    if (!this.loadedScripts.has(route.script)) {
      await this.loadScript(route.script);
      this.loadedScripts.add(route.script);
    }

    const view = window.CaseritasViews && window.CaseritasViews[route.viewName];

    if (!view) {
      throw new Error(`La vista ${route.viewName} no está disponible.`);
    }

    return view;
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.defer = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`No se pudo cargar ${src}.`));
      document.body.append(script);
    });
  }

  updateActiveLink(routeId) {
    this.nav.querySelectorAll(".spa-nav-link").forEach((link) => {
      const isActive = link.dataset.route === routeId;
      link.classList.toggle("active", isActive);
      link.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  installShellStyles() {
    if (document.querySelector("#spa-router-styles")) {
      return;
    }

    const style = document.createElement("style");
    style.id = "spa-router-styles";
    style.textContent = `
      .spa-shell {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
      }

      .spa-sidebar {
        min-height: calc(100vh - 92px);
        padding: 18px 12px;
        background: #162219;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }

      .spa-nav {
        display: grid;
        gap: 8px;
      }

      .spa-nav-link {
        display: flex;
        align-items: center;
        gap: 10px;
        min-height: 46px;
        padding: 0 12px;
        border-radius: 8px;
        color: #eaf4ec;
        font-weight: 800;
        text-decoration: none;
      }

      .spa-nav-link:hover,
      .spa-nav-link.active {
        background: rgba(255, 255, 255, 0.12);
      }

      .spa-nav-icon {
        display: grid;
        place-items: center;
        width: 28px;
        height: 28px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.14);
        font-size: 0.78rem;
      }

      .spa-outlet {
        min-width: 0;
      }

      .view-placeholder {
        margin: 18px clamp(12px, 3vw, 30px) 30px;
        padding: clamp(18px, 3vw, 28px);
        background: var(--surface);
        border: 1px solid var(--line);
        border-radius: var(--radius);
        box-shadow: var(--shadow);
      }

      .view-placeholder h2 {
        margin: 0 0 10px;
      }

      .view-placeholder p {
        margin: 0;
        color: var(--muted);
      }

      @media (max-width: 880px) {
        .spa-shell {
          grid-template-columns: 1fr;
        }

        .spa-sidebar {
          min-height: auto;
          padding: 10px 12px;
        }

        .spa-nav {
          grid-auto-flow: column;
          grid-auto-columns: max-content;
          overflow-x: auto;
        }
      }
    `;
    document.head.append(style);
  }
}

window.Router = Router;
