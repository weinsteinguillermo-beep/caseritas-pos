# API

n8n is the API layer for CASERITAS OS.

Frontend base URL:

```txt
https://gweinstein26.app.n8n.cloud/webhook
```

Configured in:

```txt
js/config.js
```

The frontend must build all API URLs from `API_BASE`.

## Current Endpoints

### Search Products

```txt
GET /productos?text=papas
```

Purpose: search available products in PRODUCCION.

Rules:

- minimum 2 characters from frontend;
- frontend debounce: 500 ms;
- no repeated identical query;
- n8n filters `Stock Actual > 0`;
- searches by `Name` or `Codigo de Barras`.

Response:

```json
{
  "productos": [
    {
      "id": "rec...",
      "name": "Papas",
      "barcode": "779...",
      "price": 100,
      "weight": 500,
      "stock": 10
    }
  ]
}
```

### Get Product By Barcode

```txt
GET /producto?code=7790000000000
```

Purpose: find one available product by barcode.

Response:

```json
{
  "producto": {
    "id": "rec...",
    "name": "Producto",
    "barcode": "7790000000000",
    "price": 100,
    "weight": 500,
    "stock": 10
  }
}
```

If not found:

```json
{
  "producto": null
}
```

### Search Customers

```txt
GET /clientes?text=ana
```

Purpose: search customers.

Current response:

```json
{
  "clientes": [
    {
      "id": "rec...",
      "name": "Cliente",
      "phone": "099...",
      "email": "cliente@example.com",
      "address": "Direccion"
    }
  ]
}
```

### Create Sale

```txt
POST /venta
```

Purpose: register sale and create corresponding cash movement.

Request:

```json
{
  "createdAt": "2026-07-24T12:00:00.000Z",
  "items": [
    {
      "productId": "rec...",
      "name": "Producto",
      "barcode": "779...",
      "unitPrice": 100,
      "weight": 500,
      "quantity": 2,
      "lineTotal": 200
    }
  ],
  "paymentMethod": "cash",
  "cashReceived": 500,
  "subtotal": 200,
  "discountPercent": 0,
  "discountAmount": 0,
  "total": 200
}
```

Response:

```json
{
  "ok": true,
  "ventaId": "rec...",
  "operationId": "pos-...",
  "total": 200
}
```

The sale workflow must be idempotent. If the same `operationId` was already confirmed, n8n returns the existing sale instead of creating a duplicate.

The backend writes:

```txt
VENTAS
DETALLE_VENTA
MOVIMIENTOS_STOCK
PRODUCCION stock update
MOVIMIENTOS_CAJA
```

If a partial failure occurs, the workflow marks the sale as `RollbackPendiente` and returns a recovery response for manual review.

## Future Endpoints

### Products

```txt
GET  /productos/:id
POST /productos
PATCH /productos/:id
```

### Customers

```txt
GET   /clientes/:id
POST  /clientes
PATCH /clientes/:id
```

### Sales

```txt
POST /ventas/historial
POST /venta/detalle
POST /venta/anular
```

`POST /ventas/historial` returns server-side sales history. It must not depend on localStorage.

Request:

```json
{
  "empresaId": "empresa-caseritas",
  "usuarioId": "usuario-cajero",
  "cajaSesionId": "rec...",
  "fechaDesde": "2026-07-24T00:00:00.000Z",
  "fechaHasta": "2026-07-25T00:00:00.000Z",
  "estado": "CONFIRMADA",
  "busqueda": "cliente u operationId"
}
```

Response:

```json
{
  "ok": true,
  "ventas": [
    {
      "ventaId": "rec...",
      "operationId": "venta-...",
      "empresaId": "empresa-caseritas",
      "usuarioId": "usuario-cajero",
      "cajaSesionId": "rec...",
      "fechaHora": "2026-07-24T12:00:00.000Z",
      "cliente": "Consumidor final",
      "formaPago": "cash",
      "subtotal": 100,
      "total": 100,
      "estado": "CONFIRMADA",
      "detalle": []
    }
  ]
}
```

`POST /venta/detalle` returns sale header, detail, stock movements, cash movements and cancellation data.

`POST /venta/anular` performs controlled cancellation with inverse stock and cash movements. It requires `operationId`, `empresaId`, `usuarioId`, `ventaId` and `motivo`.

### Cash

```txt
POST /caja/abrir
POST /caja/estado
POST /caja/movimiento
POST /caja/cerrar
```

`POST /caja/abrir` opens a cash session.

Request:

```json
{
  "operationId": "caja-abrir-...",
  "empresaId": "empresa-caseritas",
  "usuarioId": "usuario-cajero",
  "cajaId": "caja-principal",
  "fondoInicial": 1000,
  "fechaHora": "2026-07-24T12:00:00.000Z"
}
```

Response:

```json
{
  "ok": true,
  "cajaSesionId": "rec...",
  "estado": "ABIERTA",
  "fondoInicial": 1000
}
```

`POST /caja/estado` returns the current open session for `empresaId`, `usuarioId` and `cajaId`.

`POST /caja/movimiento` registers `INGRESO` or `EGRESO` in `MOVIMIENTOS_CAJA`.

`POST /caja/cerrar` calculates expected total server-side and closes the session.

### Production

```txt
GET  /produccion?estado=...
POST /produccion
POST /produccion/:id/finalizar
```

### Inventory

```txt
GET  /inventario
POST /stock/movimiento
GET  /stock/movimientos?productId=...
```

### Purchases

```txt
GET  /compras
POST /compras
GET  /proveedores
POST /proveedores
```

### Dashboard

```txt
GET /dashboard/resumen?from=YYYY-MM-DD&to=YYYY-MM-DD
GET /dashboard/productos
GET /dashboard/caja
GET /dashboard/stock
```

## Error Contract

If n8n is unavailable, frontend displays:

```txt
Servidor no disponible
```

If n8n responds with an error, workflows should return a friendly `message`, `error` or `detail` field.

## API Rules

- `fetch()` only in `js/api.js`.
- n8n owns Airtable field names and table IDs.
- Frontend receives normalized JSON.
- Workflows must include CORS headers for GitHub Pages.
- Avoid expensive endpoints for every keypress.
