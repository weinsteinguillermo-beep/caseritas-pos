"use strict";

const mockProducts = [
  {
    id: "p-001",
    name: "Milanesas de pollo congeladas",
    barcode: "7790001000012",
    price: 420,
    weight: 1000,
    stock: 18,
  },
  {
    id: "p-002",
    name: "Empanadas de carne surtidas",
    barcode: "7790001000029",
    price: 780,
    weight: 1200,
    stock: 12,
  },
  {
    id: "p-003",
    name: "Ravioles de verdura",
    barcode: "7790001000036",
    price: 360,
    weight: 500,
    stock: 22,
  },
  {
    id: "p-004",
    name: "Hamburguesas caseras",
    barcode: "7790001000043",
    price: 690,
    weight: 800,
    stock: 15,
  },
  {
    id: "p-005",
    name: "Ñoquis de papa",
    barcode: "7790001000050",
    price: 310,
    weight: 500,
    stock: 20,
  },
  {
    id: "p-006",
    name: "Tarta de jamón y queso",
    barcode: "7790001000067",
    price: 520,
    weight: 650,
    stock: 9,
  },
  {
    id: "p-007",
    name: "Pascualina congelada",
    barcode: "7790001000074",
    price: 490,
    weight: 700,
    stock: 11,
  },
  {
    id: "p-008",
    name: "Croquetas de espinaca",
    barcode: "7790001000081",
    price: 450,
    weight: 600,
    stock: 16,
  },
];

/**
 * Capa de comunicación de Caseritas POS.
 * Es el único lugar donde se usa fetch() y donde luego se conectarán los webhooks de n8n.
 */
class CaseritasAPI {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = String(baseUrl || "").replace(/\/$/, "");
  }

  usarApiRemota() {
    return this.baseUrl.length > 0;
  }

  endpoint(path) {
    return `${this.baseUrl}${path}`;
  }

  async pedirJson(path, options = {}) {
    try {
      const response = await fetch(this.endpoint(path), {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`Respuesta HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      throw new Error(
        "No se pudo conectar con el servidor. La venta sigue disponible en modo local mientras se revisa n8n."
      );
    }
  }

  normalizarListaProductos(data) {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data.productos)) {
      return data.productos;
    }

    if (Array.isArray(data.products)) {
      return data.products;
    }

    return [];
  }

  async buscarProductos(busqueda = "") {
    const term = CaseritasUtils.normalize(busqueda);

    if (this.usarApiRemota()) {
      // n8n consultará Airtable y devolverá productos normalizados.
      const data = await this.pedirJson(`/productos?buscar=${encodeURIComponent(busqueda)}`);
      return this.normalizarListaProductos(data);
    }

    if (!term) {
      return [...mockProducts];
    }

    return mockProducts.filter((product) => {
      return (
        CaseritasUtils.normalize(product.name).includes(term) ||
        CaseritasUtils.normalize(product.barcode).includes(term)
      );
    });
  }

  async buscarProductoPorCodigo(codigo = "") {
    const term = CaseritasUtils.normalize(codigo);

    if (!term) {
      return null;
    }

    if (this.usarApiRemota()) {
      // n8n recibirá el código escaneado y responderá con el producto de Airtable o null.
      const data = await this.pedirJson(`/productos/codigo/${encodeURIComponent(codigo)}`);
      return data.producto || data.product || data || null;
    }

    return mockProducts.find((product) => CaseritasUtils.normalize(product.barcode) === term) || null;
  }

  async crearProducto(producto) {
    if (this.usarApiRemota()) {
      // n8n creará el producto en Airtable y devolverá el registro normalizado.
      const data = await this.pedirJson("/productos", {
        method: "POST",
        body: JSON.stringify(producto),
      });
      return data.producto || data.product || data;
    }

    const nuevoProducto = {
      ...producto,
      id: producto.id || `tmp-${Date.now()}`,
    };

    mockProducts.unshift(nuevoProducto);
    return nuevoProducto;
  }

  async registrarVenta(venta) {
    if (this.usarApiRemota()) {
      // n8n registrará la venta y podrá disparar flujos posteriores de stock o comprobantes.
      return await this.pedirJson("/ventas", {
        method: "POST",
        body: JSON.stringify(venta),
      });
    }

    return {
      ok: true,
      id: `venta-${Date.now()}`,
      venta,
    };
  }

  async actualizarStock(productoId, cantidadVendida) {
    if (this.usarApiRemota()) {
      // n8n actualizará el stock real en Airtable cuando esta integración se active.
      return await this.pedirJson(`/productos/${encodeURIComponent(productoId)}/stock`, {
        method: "PATCH",
        body: JSON.stringify({ cantidadVendida }),
      });
    }

    const product = mockProducts.find((item) => item.id === productoId);

    if (product) {
      product.stock = Math.max(0, product.stock - Number(cantidadVendida || 0));
    }

    return product || null;
  }
}

window.CaseritasAPI = CaseritasAPI;
