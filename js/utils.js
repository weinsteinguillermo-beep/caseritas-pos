"use strict";

/**
 * Funciones auxiliares compartidas por la API, la lógica POS y la interfaz.
 */
const CaseritasUtils = {
  normalize(value) {
    return String(value || "")
      .trim()
      .toLocaleLowerCase("es");
  },

  sanitizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  },

  sanitizeBarcode(value) {
    return String(value || "")
      .replace(/[^\dA-Za-z-]/g, "")
      .slice(0, 32);
  },

  positiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0 ? number : 0;
  },

  money(value) {
    return new Intl.NumberFormat("es-UY", {
      style: "currency",
      currency: "UYU",
      maximumFractionDigits: 0,
    }).format(Math.max(0, Math.round(Number(value) || 0)));
  },

  todayIso() {
    return new Date().toISOString();
  },

  friendlyApiError(error) {
    return error && error.message
      ? error.message
      : "No se pudo completar la operación. Revisá la conexión con el servidor.";
  },
};

window.CaseritasUtils = CaseritasUtils;
