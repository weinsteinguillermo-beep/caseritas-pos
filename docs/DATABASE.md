# Database

Airtable is the current operational database.

Current base ID:

```txt
appyWpTmIw3rZEcuW
```

Current known table IDs:

```txt
PRODUCCION  tblyBp7gm4Lheqr7s
VENTAS      tbleU4MHRm3Z2iRcY
CAJA        tblkRxqoxwCZiLiVl
CLIENTES    tblLjKNdmUB4OsTU1
```

Future tables should be created with stable IDs and documented here.

## PRODUCCION

Status: current.

Purpose: stores products available for sale and production-related product data.

Known real fields:

```txt
Name
Codigo de Barras
Importe
Precio x Kg
Peso
Stock Actual
```

Frontend normalized product shape:

```json
{
  "id": "rec...",
  "name": "Producto",
  "barcode": "779...",
  "price": 100,
  "weight": 500,
  "stock": 10
}
```

Notes:

- `Importe` is used as sale price.
- `Precio x Kg` is a fallback for price if `Importe` is empty.
- `Stock Actual` must be greater than zero to appear in POS search.

## VENTAS

Status: current.

Purpose: stores sale headers.

Current expected fields:

```txt
EmpresaId
UsuarioId
CajaSesionId
ClienteNombre
OperationId
Fecha
MetodoPago
Subtotal
DescuentoPorcentaje
DescuentoImporte
Total
EfectivoRecibido
ItemsJSON
Estado
AnulacionOperationId
AnuladoPor
MotivoAnulacion
FechaAnulacion
```

Notes:

- `OperationId` protects sale idempotency.
- `AnulacionOperationId` protects cancellation idempotency.
- `Estado` expected values: `PENDIENTE`, `CONFIRMADA`, `ANULACION_PENDIENTE`, `ANULADA`, `ERROR`, `ERROR_ANULACION`.
- Sale detail should live in `DETALLE_VENTA`, not only in JSON.

## DETALLE_VENTA

Status: required for Sprint 1 sale engine. Table ID pending after Airtable creation.

Purpose: stores one row per sold product.

Recommended fields:

```txt
DetalleVentaId
Venta
OperationId
Producto
ProductoNombre
CodigoBarras
Cantidad
PrecioUnitario
Peso
SubtotalLinea
DescuentoLinea
TotalLinea
StockAntes
StockDespues
Fecha
Estado
```

Benefits:

- easier reporting by product;
- cleaner stock movement generation;
- avoids parsing JSON for analytics.

## CLIENTES

Status: current.

Purpose: stores customer records.

Current expected fields:

```txt
Nombre
Telefono
Email
Direccion
```

Recommended future fields:

```txt
Estado
Notas
UltimaCompra
TotalCompras
FechaAlta
ProximaAccion
Responsable
```

## CAJAS

Status: required for Caja Real. Table ID pending after Airtable creation.

Purpose: stores cash register master data.

Expected fields:

```txt
id
empresa_id
nombre
estado
```

## SESIONES_CAJA

Status: required for Caja Real. Table ID pending after Airtable creation.

Purpose: stores opening and closing state for each cash session.

Expected fields:

```txt
id
empresa_id
caja_id
usuario_id
estado
fondo_inicial
fecha_apertura
fecha_cierre
total_esperado
total_contado
diferencia
observaciones
operation_id_apertura
operation_id_cierre
```

## MOVIMIENTOS_CAJA

Status: required for Caja Real. Table ID pending after Airtable creation.

Purpose: stores every cash/payment movement.

Expected fields:

```txt
id
empresa_id
caja_sesion_id
usuario_id
venta_id
tipo
origen
importe
estado
motivo
operation_id
fecha_hora
```

Allowed movement types:

```txt
INGRESO
EGRESO
```

Expected origins:

```txt
VENTA
MANUAL
ANULACION
ROLLBACK
```

Expected states:

```txt
ACTIVO
ANULADO
COMPENSATORIO
ERROR
```

Notes:

- `SESIONES_CAJA` is the cash session.
- `MOVIMIENTOS_CAJA` is the financial ledger.
- The old `CAJA` table must not continue mixing sessions and movements for production.

## MOVIMIENTOS_STOCK

Status: required for Sprint 1 sale engine. Table ID pending after Airtable creation.

Purpose: stores every stock increase/decrease.

Recommended fields:

```txt
MovimientoStockId
OperationId
Fecha
Producto
ProductoNombre
Tipo
Cantidad
StockAntes
StockDespues
Motivo
Origen
Venta
DetalleVenta
Responsable
Estado
Notas
```

Expected movement types:

```txt
PRODUCCION
VENTA
ANULACION
AJUSTE
COMPRA
MERMA
DEVOLUCION
```

Expected states:

```txt
ACTIVO
ANULADO
COMPENSATORIO
ERROR
```

## COMPRAS

Status: future.

Purpose: stores supplier purchases.

Recommended fields:

```txt
Fecha
Proveedor
Subtotal
Impuestos
Total
Estado
Comprobante
MetodoPago
FechaPago
Responsable
Notas
```

## PROVEEDORES

Status: future.

Purpose: stores supplier master data.

Recommended fields:

```txt
Nombre
RUT
Telefono
Email
Direccion
Contacto
Categoria
Estado
Notas
FechaAlta
```

## Data Modeling Rules

- Master data and transactional data must stay separate.
- Every transactional record needs date, status and source.
- Do not duplicate product/customer data unless needed as historical snapshot.
- Use record links where Airtable operations and reporting benefit from relationships.
- Prefer normalized detail tables for analytics and auditability.
