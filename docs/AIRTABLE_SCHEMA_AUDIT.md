# Airtable Schema Audit

Estado del documento: EN PREPARACION.

Objetivo: confirmar que Airtable real coincide con los workflows IaC de Caseritas POS v1.0 antes de ejecutar operaciones reales de caja y venta.

No usar este documento como certificacion final hasta completar `Tipo real`, `Table ID` y evidencia visual o textual desde Airtable.

## Estados de auditoria

- CONFIRMADO: existe evidencia real de Airtable.
- FALTA CREAR: la tabla o campo no existe en Airtable real.
- NOMBRE DIFERENTE: existe, pero con nombre distinto al esperado por workflows.
- TIPO INCORRECTO: existe, pero su tipo puede romper el workflow.
- DESCONOCIDO: pendiente de relevar.

## Tablas confirmadas por ID

| Tabla | Table ID | Estado | Observacion |
|---|---|---|---|
| PRODUCCION | tblyBp7gm4Lheqr7s | CONFIRMADO | Tabla real usada por catalogo y stock. |
| VENTAS | tbleU4MHRm3Z2iRcY | CONFIRMADO | Tabla real usada por cabecera de venta. |

## Tablas pendientes por ID

| Tabla | Table ID | Estado | Observacion |
|---|---|---|---|
| SESIONES_CAJA | Pendiente | DESCONOCIDO | Requerida por `/caja/estado`, `/caja/abrir`, `/caja/cerrar` y `/venta`. |
| DETALLE_VENTA | Pendiente | DESCONOCIDO | Requerida por `/venta`. |
| MOVIMIENTOS_STOCK | Pendiente | DESCONOCIDO | Requerida por `/venta`. |
| MOVIMIENTOS_CAJA | Pendiente | DESCONOCIDO | Requerida por `/venta` y `/caja/cerrar`. |

## Matriz de campos

| Tabla | Table ID | Campo | Tipo esperado | Tipo real | Estado | Observacion |
|---|---|---|---|---|---|---|
| PRODUCCION | tblyBp7gm4Lheqr7s | Name | primary/single line text | Pendiente | CONFIRMADO | Nombre real confirmado; tipo pendiente de captura. |
| PRODUCCION | tblyBp7gm4Lheqr7s | Codigo de Barras | single line text | Pendiente | CONFIRMADO | Nunca debe ser number para no perder ceros iniciales. |
| PRODUCCION | tblyBp7gm4Lheqr7s | Importe | currency o number | Pendiente | CONFIRMADO | Precio de venta principal. |
| PRODUCCION | tblyBp7gm4Lheqr7s | Precio x Kg | currency o number | Pendiente | CONFIRMADO | Fallback de precio. |
| PRODUCCION | tblyBp7gm4Lheqr7s | Peso | number | Pendiente | CONFIRMADO | Peso informativo. |
| PRODUCCION | tblyBp7gm4Lheqr7s | Stock Actual | number | Pendiente | CONFIRMADO | Debe permitir decrementos desde workflow `/venta`. |
| VENTAS | tbleU4MHRm3Z2iRcY | OperationId | single line text | Pendiente | DESCONOCIDO | Requerido para idempotencia. |
| VENTAS | tbleU4MHRm3Z2iRcY | EmpresaId | single line text | Pendiente | DESCONOCIDO | Scope multiempresa futuro. |
| VENTAS | tbleU4MHRm3Z2iRcY | UsuarioId | single line text | Pendiente | DESCONOCIDO | Workflow puede usar este campo si existe. |
| VENTAS | tbleU4MHRm3Z2iRcY | Cajero | single line text | Pendiente | DESCONOCIDO | Alternativa actual usada por POS/workflow. |
| VENTAS | tbleU4MHRm3Z2iRcY | CajaSesionId | single line text o linked record | Pendiente | DESCONOCIDO | Debe guardar la sesion real de caja. |
| VENTAS | tbleU4MHRm3Z2iRcY | ClienteNombre | single line text | Pendiente | DESCONOCIDO | Cliente visible en venta. |
| VENTAS | tbleU4MHRm3Z2iRcY | Fecha | date/time UTC | Pendiente | DESCONOCIDO | Fecha de venta. |
| VENTAS | tbleU4MHRm3Z2iRcY | MetodoPago | single select | Pendiente | DESCONOCIDO | Valores esperados: cash, card, transfer o equivalentes acordados. |
| VENTAS | tbleU4MHRm3Z2iRcY | Subtotal | currency o number | Pendiente | DESCONOCIDO | Calculado por backend. |
| VENTAS | tbleU4MHRm3Z2iRcY | DescuentoPorcentaje | number | Pendiente | DESCONOCIDO | Porcentaje aplicado. |
| VENTAS | tbleU4MHRm3Z2iRcY | DescuentoImporte | currency o number | Pendiente | DESCONOCIDO | Importe calculado. |
| VENTAS | tbleU4MHRm3Z2iRcY | Total | currency o number | Pendiente | DESCONOCIDO | Total final calculado por backend. |
| VENTAS | tbleU4MHRm3Z2iRcY | EfectivoRecibido | currency o number | Pendiente | DESCONOCIDO | Requerido para efectivo. |
| VENTAS | tbleU4MHRm3Z2iRcY | Vuelto | currency o number | Pendiente | DESCONOCIDO | Calculado por backend si existe en tabla. |
| VENTAS | tbleU4MHRm3Z2iRcY | Estado | single select | Pendiente | DESCONOCIDO | Valores: PENDIENTE, CONFIRMADA, ERROR, ROLLBACK_PENDIENTE, ANULACION_PENDIENTE, ANULADA. |
| SESIONES_CAJA | Pendiente | empresa_id | single line text | Pendiente | DESCONOCIDO | Obligatorio. |
| SESIONES_CAJA | Pendiente | usuario_id | single line text | Pendiente | DESCONOCIDO | Obligatorio. |
| SESIONES_CAJA | Pendiente | caja_id | single line text | Pendiente | DESCONOCIDO | Obligatorio. |
| SESIONES_CAJA | Pendiente | estado | single select | Pendiente | DESCONOCIDO | Valores: ABIERTA, CERRADA. |
| SESIONES_CAJA | Pendiente | fondo_inicial | currency o number | Pendiente | DESCONOCIDO | Obligatorio al abrir. |
| SESIONES_CAJA | Pendiente | fecha_apertura | date/time UTC | Pendiente | DESCONOCIDO | Obligatorio al abrir. |
| SESIONES_CAJA | Pendiente | fecha_cierre | date/time UTC | Pendiente | DESCONOCIDO | Se completa al cerrar. |
| SESIONES_CAJA | Pendiente | total_esperado | currency o number | Pendiente | DESCONOCIDO | Calculado por `/caja/cerrar`. |
| SESIONES_CAJA | Pendiente | total_contado | currency o number | Pendiente | DESCONOCIDO | Enviado por cajero y validado. |
| SESIONES_CAJA | Pendiente | diferencia | currency o number | Pendiente | DESCONOCIDO | Calculada por backend. |
| SESIONES_CAJA | Pendiente | observaciones | long text | Pendiente | DESCONOCIDO | Requerida si hay diferencia segun UI. |
| SESIONES_CAJA | Pendiente | operation_id_apertura | single line text | Pendiente | DESCONOCIDO | Idempotencia apertura. |
| SESIONES_CAJA | Pendiente | operation_id_cierre | single line text | Pendiente | DESCONOCIDO | Idempotencia cierre. |
| DETALLE_VENTA | Pendiente | Venta | linked record a VENTAS | Pendiente | DESCONOCIDO | Relacion con cabecera. |
| DETALLE_VENTA | Pendiente | Producto | linked record a PRODUCCION | Pendiente | DESCONOCIDO | Relacion con producto. |
| DETALLE_VENTA | Pendiente | ProductoNombre | single line text | Pendiente | DESCONOCIDO | Snapshot historico. |
| DETALLE_VENTA | Pendiente | CodigoBarras | single line text | Pendiente | DESCONOCIDO | Snapshot historico. |
| DETALLE_VENTA | Pendiente | Cantidad | number | Pendiente | DESCONOCIDO | Obligatorio, mayor a cero. |
| DETALLE_VENTA | Pendiente | PrecioUnitario | currency o number | Pendiente | DESCONOCIDO | Calculado desde PRODUCCION. |
| DETALLE_VENTA | Pendiente | TotalLinea | currency o number | Pendiente | DESCONOCIDO | Calculado por backend. |
| DETALLE_VENTA | Pendiente | Estado | single select | Pendiente | DESCONOCIDO | Valores: ACTIVO, ANULADO, COMPENSATORIO, ERROR. |
| MOVIMIENTOS_STOCK | Pendiente | OperationId | single line text | Pendiente | DESCONOCIDO | Relaciona movimiento con venta/anulacion. |
| MOVIMIENTOS_STOCK | Pendiente | Producto | linked record a PRODUCCION | Pendiente | DESCONOCIDO | Producto afectado. |
| MOVIMIENTOS_STOCK | Pendiente | Tipo | single select | Pendiente | DESCONOCIDO | Valores: VENTA, ANULACION, AJUSTE. |
| MOVIMIENTOS_STOCK | Pendiente | Cantidad | number | Pendiente | DESCONOCIDO | Venta debe registrar cantidad negativa. |
| MOVIMIENTOS_STOCK | Pendiente | StockAntes | number | Pendiente | DESCONOCIDO | Snapshot antes del cambio. |
| MOVIMIENTOS_STOCK | Pendiente | StockDespues | number | Pendiente | DESCONOCIDO | Snapshot despues del cambio. |
| MOVIMIENTOS_STOCK | Pendiente | Origen | single select o text | Pendiente | DESCONOCIDO | Esperado: VENTA, ANULACION, AJUSTE. |
| MOVIMIENTOS_STOCK | Pendiente | Venta | linked record a VENTAS | Pendiente | DESCONOCIDO | Venta origen. |
| MOVIMIENTOS_STOCK | Pendiente | Responsable | single line text | Pendiente | DESCONOCIDO | Usuario/cajero. |
| MOVIMIENTOS_STOCK | Pendiente | Estado | single select | Pendiente | DESCONOCIDO | Valores: ACTIVO, ANULADO, COMPENSATORIO, ERROR. |
| MOVIMIENTOS_CAJA | Pendiente | venta_id | single line text o linked record a VENTAS | Pendiente | DESCONOCIDO | Venta origen cuando aplica. |
| MOVIMIENTOS_CAJA | Pendiente | caja_sesion_id | single line text o linked record a SESIONES_CAJA | Pendiente | DESCONOCIDO | Sesion afectada. |
| MOVIMIENTOS_CAJA | Pendiente | usuario_id | single line text | Pendiente | DESCONOCIDO | Usuario responsable. |
| MOVIMIENTOS_CAJA | Pendiente | tipo | single select | Pendiente | DESCONOCIDO | Valores: INGRESO, EGRESO. |
| MOVIMIENTOS_CAJA | Pendiente | origen | single select | Pendiente | DESCONOCIDO | Valores: VENTA, INGRESO, EGRESO, ANULACION. |
| MOVIMIENTOS_CAJA | Pendiente | importe | currency o number | Pendiente | DESCONOCIDO | Importe positivo; tipo define sentido. |
| MOVIMIENTOS_CAJA | Pendiente | estado | single select | Pendiente | DESCONOCIDO | Valores: ACTIVO, ANULADO, COMPENSATORIO, ERROR. |
| MOVIMIENTOS_CAJA | Pendiente | motivo | single line text o long text | Pendiente | DESCONOCIDO | Motivo operativo. |
| MOVIMIENTOS_CAJA | Pendiente | operation_id | single line text | Pendiente | DESCONOCIDO | Idempotencia/trazabilidad. |
| MOVIMIENTOS_CAJA | Pendiente | fecha_hora | date/time UTC | Pendiente | DESCONOCIDO | Fecha del movimiento. |

## Valores controlados a confirmar

| Dominio | Valores esperados | Estado | Observacion |
|---|---|---|---|
| Estados de caja | ABIERTA, CERRADA | DESCONOCIDO | Deben coincidir exactamente con workflows. |
| Estados de venta | PENDIENTE, CONFIRMADA, ERROR, ROLLBACK_PENDIENTE, ANULACION_PENDIENTE, ANULADA | DESCONOCIDO | Evitar acentos/minusculas si son single select. |
| Estados de movimientos | ACTIVO, ANULADO, COMPENSATORIO, ERROR | DESCONOCIDO | Usado por cierres y rollback. |
| Tipos de movimientos de caja | INGRESO, EGRESO | DESCONOCIDO | `origen` distingue VENTA, MANUAL, ANULACION. |
| Origenes de movimientos de caja | VENTA, INGRESO, EGRESO, ANULACION, MANUAL, ROLLBACK | DESCONOCIDO | Confirmar opciones reales. |
| Tipos de movimientos de stock | VENTA, ANULACION, AJUSTE | DESCONOCIDO | Confirmar opciones reales. |

## Diferencias detectadas sin tocar Airtable

| Area | Diferencia | Riesgo | Accion requerida |
|---|---|---|---|
| POS cierre | El contrato conceptual incluye `cajaId`, pero el POS actual no lo envia al cerrar caja. | Bajo | Workflow `/caja/cerrar` lo acepta como opcional y valida contra Airtable solo si llega. |
| Table IDs | Workflows IaC usan nombres para tablas transaccionales pendientes. | Medio | Confirmar Table IDs reales y luego decidir si reemplazar nombres por IDs. |
| Tipos reales | No hay evidencia de tipos Airtable para campos transaccionales. | Alto | Guillermo debe relevar tipos antes de ejecutar venta real. |
| Single select | Si faltan opciones, Airtable puede rechazar escrituras. | Alto | Confirmar/crear opciones exactas antes del piloto. |
| Relaciones | Si `Venta` o `Producto` no son linked records, la escritura de arrays puede fallar. | Alto | Confirmar tipo exacto de campos de relacion. |

## Evidencia requerida para certificar

- Captura o copia de Table ID de cada tabla pendiente.
- Captura o copia de todos los campos visibles con tipo.
- Captura de opciones de single select.
- Confirmacion de campos primarios.
- Confirmacion de campos linked record y tabla destino.
- Confirmacion de permisos de la credencial Airtable usada por n8n.
