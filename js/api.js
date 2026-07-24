import { API_BASE, USE_LOCAL_FALLBACK } from "./config.js";

const DEFAULT_HEADERS = {
  Accept: "application/json",
};

const MIN_SEARCH_LENGTH = 2;
const LOCAL_FALLBACK_PRODUCTS = [
  {
    id: "local-papas",
    name: "Papas congeladas",
    barcode: "LOCAL-001",
    price: 0,
    weight: 0,
    stock: 1,
  },
  {
    id: "local-milanesa",
    name: "Milanesa congelada",
    barcode: "LOCAL-002",
    price: 0,
    weight: 0,
    stock: 1,
  },
];

let lastProductsSearch = {
  text: null,
  products: [],
};

function buildUrl(path, params = {}) {
  const url = new URL(`${API_BASE.replace(/\/$/, "")}/${path.replace(/^\//, "")}`);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      url.searchParams.set(key, String(value).trim());
    }
  });

  return url.toString();
}

async function readApiResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      payload && typeof payload === "object"
        ? payload.message || payload.error || payload.detail
        : payload;

    throw new Error(message || "No se pudo completar la operacion. Revisa los datos e intentalo nuevamente.");
  }

  return payload;
}

async function request(path, options = {}) {
  try {
    const response = await fetch(buildUrl(path, options.params), {
      method: options.method || "GET",
      headers: {
        ...DEFAULT_HEADERS,
        ...(options.body ? { "Content-Type": "text/plain;charset=UTF-8" } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    return await readApiResponse(response);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Servidor no disponible");
    }

    throw error;
  }
}

function normalizeProducts(payload) {
  const products = (() => {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.productos)) {
    return payload.productos;
  }

  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
  })();

  return products.map((product) => ({
    id: String(product.id || ""),
    name: String(product.name || ""),
    barcode: String(product.barcode || ""),
    price: Number(product.price || 0),
    weight: Number(product.weight || 0),
    stock: Number(product.stock || 0),
  }));
}

function normalizeProduct(payload) {
  const product = payload?.producto || payload?.product || payload?.data || payload || null;

  if (!product) {
    return null;
  }

  return normalizeProducts([product])[0] || null;
}

function normalizeCustomers(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.clientes)) {
    return payload.clientes;
  }

  if (Array.isArray(payload?.customers)) {
    return payload.customers;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

export async function searchProducts(text = "") {
  const cleanText = String(text || "").trim();

  if (cleanText.length < MIN_SEARCH_LENGTH) {
    lastProductsSearch = {
      text: cleanText,
      products: [],
    };
    return [];
  }

  if (lastProductsSearch.text === cleanText) {
    return lastProductsSearch.products;
  }

  if (USE_LOCAL_FALLBACK) {
    const normalized = cleanText.toLocaleLowerCase("es");
    const products = LOCAL_FALLBACK_PRODUCTS.filter((product) => {
      return (
        product.name.toLocaleLowerCase("es").includes(normalized) ||
        product.barcode.toLocaleLowerCase("es").includes(normalized)
      );
    });

    lastProductsSearch = {
      text: cleanText,
      products,
    };
    return products;
  }

  const payload = await request("/productos", {
    params: { text: cleanText },
  });

  const products = normalizeProducts(payload);
  lastProductsSearch = {
    text: cleanText,
    products,
  };
  return products;
}

export async function getProductByBarcode(code = "") {
  const cleanCode = String(code || "").trim();

  if (!cleanCode) {
    return null;
  }

  if (USE_LOCAL_FALLBACK) {
    return LOCAL_FALLBACK_PRODUCTS.find((product) => product.barcode === cleanCode) || null;
  }

  const payload = await request("/producto", {
    params: { code: cleanCode },
  });

  return normalizeProduct(payload);
}

export async function createSale(data) {
  if (USE_LOCAL_FALLBACK) {
    return {
      ok: true,
      id: `local-sale-${Date.now()}`,
      data,
    };
  }

  return await request("/venta", {
    method: "POST",
    body: data,
  });
}

export async function getCustomers(text = "") {
  const payload = await request("/clientes", {
    params: { text },
  });

  return normalizeCustomers(payload);
}

class CaseritasAPI {
  async searchProducts(text = "") {
    return await searchProducts(text);
  }

  async getProductByBarcode(code = "") {
    return await getProductByBarcode(code);
  }

  async createSale(data) {
    return await createSale(data);
  }

  async getCustomers(text = "") {
    return await getCustomers(text);
  }

  async buscarProductos(text = "") {
    return await this.searchProducts(text);
  }

  async buscarProductoPorCodigo(code = "") {
    return await this.getProductByBarcode(code);
  }

  async registrarVenta(data) {
    return await this.createSale(data);
  }

  async crearProducto() {
    throw new Error("Alta rapida no disponible. Crea el producto en Airtable y vuelve a buscarlo.");
  }

  async actualizarStock() {
    return null;
  }
}

window.CaseritasAPI = CaseritasAPI;
window.CaseritasApiClient = {
  searchProducts,
  getProductByBarcode,
  createSale,
  getCustomers,
};
