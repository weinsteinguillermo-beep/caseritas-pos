"use strict";

class CaseritasAppState {
  constructor(storageKey = "caseritas-os-state") {
    this.storageKey = storageKey;
    this.listeners = new Set();
    this.state = this.load();
  }

  defaultState() {
    return {
      empresa: {
        id: "empresa-caseritas",
        nombre: "Caseritas",
      },
      usuario: null,
      caja: null,
      estadoServidor: "pendiente",
      modoOffline: false,
      operationId: null,
      pendingSaleOperation: null,
      pendingCashOperations: {},
      pendingVoidOperations: {},
      ventasDia: [],
      movimientosCaja: [],
    };
  }

  load() {
    try {
      const saved = window.localStorage.getItem(this.storageKey);
      return saved ? { ...this.defaultState(), ...JSON.parse(saved) } : this.defaultState();
    } catch (error) {
      return this.defaultState();
    }
  }

  save() {
    window.localStorage.setItem(this.storageKey, JSON.stringify(this.state));
    this.listeners.forEach((listener) => listener(this.snapshot()));
  }

  snapshot() {
    return typeof structuredClone === "function" ? structuredClone(this.state) : JSON.parse(JSON.stringify(this.state));
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.snapshot());
    return () => this.listeners.delete(listener);
  }

  setServidor(status) {
    this.state.estadoServidor = status;
    this.state.modoOffline = status === "offline";
    this.save();
  }

  setUsuario(usuario) {
    this.state.usuario = usuario;
    this.save();
  }

  abrirCaja({ cajero, cajaNombre, fondoInicial }) {
    const normalizedCaja = CaseritasUtils.normalize(cajaNombre).replace(/\s+/g, "-") || "principal";
    const usuario = {
      id: `usuario-${CaseritasUtils.normalize(cajero).replace(/\s+/g, "-") || Date.now()}`,
      nombre: cajero,
    };

    this.state.usuario = usuario;
    this.state.caja = {
      id: `caja-${normalizedCaja}`,
      nombre: cajaNombre,
      estado: "abierta",
      fondoInicial: CaseritasUtils.positiveNumber(fondoInicial),
      abiertaEn: CaseritasUtils.todayIso(),
      cerradaEn: null,
      totalContado: null,
      diferencia: null,
      observaciones: "",
      cajaSesionId: null,
      confirmadaBackend: false,
      estadoSincronizacion: "local",
    };
    this.save();
    return this.state.caja;
  }

  cerrarCaja({ totalContado, observaciones }) {
    if (!this.state.caja) {
      return null;
    }

    const esperado = this.totalEsperadoCaja();
    this.state.caja = {
      ...this.state.caja,
      estado: "cerrada",
      cerradaEn: CaseritasUtils.todayIso(),
      totalContado: CaseritasUtils.positiveNumber(totalContado),
      diferencia: CaseritasUtils.positiveNumber(totalContado) - esperado,
      observaciones: CaseritasUtils.sanitizeText(observaciones),
    };
    this.save();
    return this.state.caja;
  }

  cajaAbierta() {
    return this.state.caja && this.state.caja.estado === "abierta";
  }

  cajaAbiertaConfirmada() {
    return this.cajaAbierta() && this.state.caja.confirmadaBackend === true;
  }

  nextOperationId(prefix = "pos") {
    const operationId = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    this.state.operationId = operationId;
    this.save();
    return operationId;
  }

  beginSaleOperation(prefix = "venta") {
    if (this.state.pendingSaleOperation && this.state.pendingSaleOperation.operationId) {
      return this.state.pendingSaleOperation.operationId;
    }

    const operationId = this.nextOperationId(prefix);
    this.state.pendingSaleOperation = {
      operationId,
      startedAt: CaseritasUtils.todayIso(),
      status: "pending",
    };
    this.save();
    return operationId;
  }

  beginCashOperation(type, prefix = "caja", data = {}) {
    const key = String(type || "operacion");
    const pending = this.state.pendingCashOperations[key];

    if (pending && pending.operationId) {
      this.state.pendingCashOperations[key] = {
        ...pending,
        data: {
          ...(pending.data || {}),
          ...data,
        },
      };
      this.save();
      return pending.operationId;
    }

    const operationId = this.nextOperationId(`${prefix}-${key}`);
    this.state.pendingCashOperations[key] = {
      operationId,
      startedAt: CaseritasUtils.todayIso(),
      status: "pending",
      data,
    };
    this.save();
    return operationId;
  }

  clearCashOperation(type, operationId) {
    const key = String(type || "operacion");
    const pending = this.state.pendingCashOperations[key];

    if (!pending) {
      return;
    }

    if (!operationId || pending.operationId === operationId) {
      delete this.state.pendingCashOperations[key];
      this.save();
    }
  }

  markCashOperationUnknown(type, operationId) {
    const key = String(type || "operacion");
    const pending = this.state.pendingCashOperations[key] || { operationId };
    this.state.pendingCashOperations[key] = {
      ...pending,
      operationId: pending.operationId || operationId,
      status: "unknown",
      updatedAt: CaseritasUtils.todayIso(),
    };

    if (this.state.caja) {
      this.state.caja.estadoSincronizacion = "desconocido";
    }

    this.save();
  }

  setCajaAbiertaConfirmada({ cajaId, cajaNombre, cajaSesionId, fondoInicial, fechaApertura, usuario }) {
    if (usuario) {
      this.state.usuario = usuario;
    }

    this.state.caja = {
      id: cajaId,
      nombre: cajaNombre || "Caja principal",
      estado: "abierta",
      fondoInicial: CaseritasUtils.positiveNumber(fondoInicial),
      abiertaEn: fechaApertura || CaseritasUtils.todayIso(),
      cerradaEn: null,
      totalContado: null,
      diferencia: null,
      observaciones: "",
      cajaSesionId,
      confirmadaBackend: true,
      estadoSincronizacion: "confirmada",
    };
    this.save();
    return this.state.caja;
  }

  setCajaCerradaConfirmada({ cajaSesionId, totalEsperado, totalContado, diferencia, observaciones, fechaCierre }) {
    if (!this.state.caja) {
      return null;
    }

    this.state.caja = {
      ...this.state.caja,
      cajaSesionId: cajaSesionId || this.state.caja.cajaSesionId,
      estado: "cerrada",
      cerradaEn: fechaCierre || CaseritasUtils.todayIso(),
      totalEsperado: Number(totalEsperado || 0),
      totalContado: Number(totalContado || 0),
      diferencia: Number(diferencia || 0),
      observaciones: CaseritasUtils.sanitizeText(observaciones || ""),
      confirmadaBackend: true,
      estadoSincronizacion: "confirmada",
    };
    this.save();
    return this.state.caja;
  }

  reconcileCajaStatus(status, context = {}) {
    if (!status || status.ok === false) {
      return;
    }

    if (status.abierta) {
      this.setCajaAbiertaConfirmada({
        cajaId: context.cajaId || this.state.caja?.id || "caja-principal",
        cajaNombre: context.cajaNombre || this.state.caja?.nombre || "Caja principal",
        cajaSesionId: status.cajaSesionId,
        fondoInicial: status.fondoInicial,
        fechaApertura: status.fechaApertura,
        usuario: context.usuario || this.state.usuario,
      });
      return;
    }

    if (this.state.caja && this.state.caja.estado === "abierta") {
      this.state.caja = {
        ...this.state.caja,
        estado: "cerrada",
        confirmadaBackend: true,
        estadoSincronizacion: "servidor",
      };
      this.save();
    }
  }

  clearSaleOperation(operationId) {
    if (!this.state.pendingSaleOperation) {
      return;
    }

    if (!operationId || this.state.pendingSaleOperation.operationId === operationId) {
      this.state.pendingSaleOperation = null;
      this.save();
    }
  }

  beginVoidOperation(ventaId, data = {}) {
    const key = String(ventaId || "venta");
    const pending = this.state.pendingVoidOperations[key];

    if (pending && pending.operationId) {
      this.state.pendingVoidOperations[key] = {
        ...pending,
        data: {
          ...(pending.data || {}),
          ...data,
        },
      };
      this.save();
      return pending.operationId;
    }

    const operationId = this.nextOperationId("venta-anular");
    this.state.pendingVoidOperations[key] = {
      operationId,
      ventaId: key,
      startedAt: CaseritasUtils.todayIso(),
      status: "pending",
      data,
    };
    this.save();
    return operationId;
  }

  clearVoidOperation(ventaId, operationId) {
    const key = String(ventaId || "venta");
    const pending = this.state.pendingVoidOperations[key];

    if (!pending) {
      return;
    }

    if (!operationId || pending.operationId === operationId) {
      delete this.state.pendingVoidOperations[key];
      this.save();
    }
  }

  markVoidOperationUnknown(ventaId, operationId) {
    const key = String(ventaId || "venta");
    const pending = this.state.pendingVoidOperations[key] || { ventaId: key, operationId };
    this.state.pendingVoidOperations[key] = {
      ...pending,
      operationId: pending.operationId || operationId,
      status: "unknown",
      updatedAt: CaseritasUtils.todayIso(),
    };
    this.save();
  }

  markVentaAnulada(ventaId, operationId) {
    const index = this.state.ventasDia.findIndex((venta) => {
      return venta.id === ventaId || venta.ventaId === ventaId || venta.operationId === operationId;
    });

    if (index >= 0) {
      this.state.ventasDia[index] = {
        ...this.state.ventasDia[index],
        estado: "anulada",
        anuladoEn: CaseritasUtils.todayIso(),
      };
      this.save();
    }
  }

  addVenta(venta) {
    const operationId = venta.operationId || this.state.operationId;
    const existingIndex = this.state.ventasDia.findIndex((item) => item.operationId === operationId);
    const record = {
      id: venta.id || venta.ventaId || `venta-local-${Date.now()}`,
      operationId,
      fecha: venta.createdAt || CaseritasUtils.todayIso(),
      cliente: venta.customerName || "Consumidor final",
      total: Number(venta.total || 0),
      metodoPago: venta.paymentMethod || "",
      estado: venta.estado || "confirmada",
      items: venta.items || [],
    };

    if (existingIndex >= 0) {
      this.state.ventasDia[existingIndex] = record;
      this.save();
      return;
    }

    this.state.ventasDia.unshift({
      ...record,
    });
    this.save();
  }

  addMovimientoCaja(movimiento) {
    const operationId = movimiento.operationId || null;
    if (operationId && this.state.movimientosCaja.some((item) => item.operationId === operationId)) {
      return;
    }

    this.state.movimientosCaja.unshift({
      id: movimiento.id || `mov-caja-${Date.now()}`,
      operationId,
      fecha: movimiento.fecha || CaseritasUtils.todayIso(),
      tipo: movimiento.tipo,
      motivo: movimiento.motivo,
      importe: Number(movimiento.importe || 0),
      metodoPago: movimiento.metodoPago || "",
      estado: movimiento.estado || "confirmado",
    });
    this.save();
  }

  totalVentasDia() {
    return this.state.ventasDia
      .filter((venta) => venta.estado === "confirmada")
      .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  }

  totalVentasEfectivo() {
    return this.state.ventasDia
      .filter((venta) => venta.estado === "confirmada" && venta.metodoPago === "cash")
      .reduce((sum, venta) => sum + Number(venta.total || 0), 0);
  }

  totalMovimientosCaja() {
    return this.state.movimientosCaja
      .filter((movimiento) => !movimiento.metodoPago || movimiento.metodoPago === "cash")
      .reduce((sum, movimiento) => sum + Number(movimiento.importe || 0), 0);
  }

  totalEsperadoCaja() {
    const fondo = this.state.caja ? Number(this.state.caja.fondoInicial || 0) : 0;
    return fondo + this.totalMovimientosCaja();
  }
}

window.CaseritasAppState = CaseritasAppState;
