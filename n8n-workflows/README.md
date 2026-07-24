# Workflows n8n para Caseritas POS

Estos workflows conectan Caseritas POS con Airtable a traves de n8n Cloud.

URL base usada por el frontend:

```txt
https://gweinstein26.app.n8n.cloud/webhook
```

## Como importar

1. Entrar a n8n Cloud.
2. Ir a `Workflows`.
3. Elegir `Import from file`.
4. Importar estos archivos:
   - `productos.json`
   - `producto.json`
   - `clientes.json`
   - `venta.json`
   - `ventas-historial.json`
   - `venta-detalle.json`
   - `venta-anular.json`
   - `caja-abrir.json`
   - `caja-estado.json`
   - `caja-movimiento.json`
   - `caja-cerrar.json`
5. Abrir cada workflow importado.
6. Seleccionar la credencial Airtable real en cada nodo Airtable.
7. Activar cada workflow.

Los Base ID y Table ID ya estan configurados en los JSON. No hace falta usar variables de entorno ni editar IDs manualmente.

## Credencial manual pendiente

En cada nodo Airtable, seleccionar o crear una credencial Airtable con permisos sobre la base:

```txt
appyWpTmIw3rZEcuW
```

No hay claves, tokens ni credenciales guardadas en los JSON.

## IDs configurados

```txt
BASE        appyWpTmIw3rZEcuW
PRODUCCION  tblyBp7gm4Lheqr7s
VENTAS      tbleU4MHRm3Z2iRcY
CAJA        tblkRxqoxwCZiLiVl
CLIENTES    tblLjKNdmUB4OsTU1
```

## Ruteo por workflow

```txt
productos.json  -> consulta PRODUCCION
producto.json   -> consulta PRODUCCION
clientes.json   -> consulta CLIENTES
venta.json      -> motor de ventas: escribe VENTAS, DETALLE_VENTA, MOVIMIENTOS_STOCK, actualiza PRODUCCION y registra MOVIMIENTOS_CAJA
ventas-historial.json -> consulta historial server-side de VENTAS con DETALLE_VENTA
venta-detalle.json -> consulta cabecera, detalle, stock, caja y anulacion
venta-anular.json -> anula venta con movimientos inversos de stock y caja
caja-abrir.json -> abre SESIONES_CAJA
caja-estado.json -> consulta sesion abierta
caja-movimiento.json -> registra MOVIMIENTOS_CAJA manuales
caja-cerrar.json -> calcula y cierra SESIONES_CAJA
```

## Tablas esperadas en Airtable

### PRODUCCION

Campos esperados por `productos.json` y `producto.json`:

```txt
Name
Codigo de Barras
Importe
Precio x Kg
Peso
Stock Actual
```

Respuesta al frontend:

```json
{
  "productos": [
    {
      "id": "rec...",
      "name": "Producto",
      "barcode": "779...",
      "price": 100,
      "weight": 500,
      "stock": 10
    }
  ]
}
```

### CLIENTES

Campos esperados por `clientes.json`:

```txt
Nombre
Telefono
Email
Direccion
```

### VENTAS

Campos escritos por `venta.json`:

```txt
OperationId
EmpresaId
UsuarioId
CajaSesionId
Fecha
Cliente
ClienteNombre
MetodoPago
Subtotal
DescuentoPorcentaje
DescuentoImporte
Total
EfectivoRecibido
Vuelto
Estado
Cajero
Origen
CajaMovimiento
ErrorMensaje
FechaConfirmacion
FechaAnulacion
AnulacionOperationId
AnuladoPor
MotivoAnulacion
Notas
```

Estados esperados:

```txt
PENDIENTE
CONFIRMADA
ANULACION_PENDIENTE
ANULADA
ERROR
ERROR_ANULACION
```

### DETALLE_VENTA

Tabla requerida por `venta.json`.

Campos esperados:

```txt
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
Estado
Fecha
```

### MOVIMIENTOS_STOCK

Tabla requerida por `venta.json`.

Campos esperados:

```txt
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

### CAJAS

Tabla requerida por Caja Real.

Campos esperados:

```txt
id
empresa_id
nombre
estado
```

### SESIONES_CAJA

Tabla requerida por Caja Real.

Campos esperados:

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

### MOVIMIENTOS_CAJA

Tabla requerida por Caja Real y por `venta.json`.

Campos esperados:

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

## URLs que usa Caseritas POS

Con los workflows activos, las URLs esperadas son:

```txt
GET  https://gweinstein26.app.n8n.cloud/webhook/productos?text=texto
GET  https://gweinstein26.app.n8n.cloud/webhook/producto?code=7790000000000
GET  https://gweinstein26.app.n8n.cloud/webhook/clientes?text=texto
POST https://gweinstein26.app.n8n.cloud/webhook/venta
POST https://gweinstein26.app.n8n.cloud/webhook/ventas/historial
POST https://gweinstein26.app.n8n.cloud/webhook/venta/detalle
POST https://gweinstein26.app.n8n.cloud/webhook/venta/anular
POST https://gweinstein26.app.n8n.cloud/webhook/caja/abrir
POST https://gweinstein26.app.n8n.cloud/webhook/caja/estado
POST https://gweinstein26.app.n8n.cloud/webhook/caja/movimiento
POST https://gweinstein26.app.n8n.cloud/webhook/caja/cerrar
```

## CORS para GitHub Pages

Los nodos `Respond to Webhook` incluyen estos headers:

```txt
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET,POST,OPTIONS
Access-Control-Allow-Headers: *
```

El frontend envia ventas como `text/plain;charset=UTF-8` con contenido JSON para evitar problemas de preflight desde GitHub Pages. El workflow `venta.json` acepta el cuerpo como texto o como JSON parseado.

## Validaciones incluidas

`productos.json`:

- Recibe `text`.
- Busca por `Name` o `Codigo de Barras` en PRODUCCION.
- Filtra productos con `Stock Actual` mayor que cero.

`producto.json`:

- Exige `code`.
- Busca coincidencia exacta en `Codigo de Barras` en PRODUCCION.
- Filtra productos con `Stock Actual` mayor que cero.

`clientes.json`:

- Recibe `text`.
- Busca por `Nombre` o `Telefono` en CLIENTES.

`venta.json`:

- Exige al menos un item.
- Exige metodo de pago.
- Genera o reutiliza `OperationId`.
- Evita ventas duplicadas por `OperationId`.
- Recalcula subtotal, descuento y total.
- Valida productos existentes.
- Valida stock suficiente.
- Crea venta pendiente en VENTAS.
- Crea detalle en DETALLE_VENTA.
- Crea movimientos en MOVIMIENTOS_STOCK.
- Actualiza `Stock Actual` en PRODUCCION.
- Crea el ingreso correspondiente en MOVIMIENTOS_CAJA.
- Confirma la venta.
- Marca `RollbackPendiente` si detecta una falla parcial.

`ventas-historial.json`:

- Filtra por empresa, usuario, caja, fecha, estado y busqueda.
- Devuelve ventas ordenadas por fecha descendente.
- Agrega detalle de venta.

`venta-detalle.json`:

- Devuelve cabecera, detalle, movimientos de stock, movimientos de caja y datos de anulacion.

`venta-anular.json`:

- Valida venta confirmada y pertenencia a empresa.
- Marca `ANULACION_PENDIENTE` antes de crear compensaciones.
- Crea movimientos inversos en `MOVIMIENTOS_STOCK`.
- Restaura `Stock Actual`.
- Crea movimiento inverso en `MOVIMIENTOS_CAJA`.
- Marca la venta como `ANULADA`.
- Usa `AnulacionOperationId` para idempotencia.

## Configuracion manual pendiente en n8n

1. Conectar la credencial Airtable en cada nodo Airtable.
2. Crear las tablas `DETALLE_VENTA`, `MOVIMIENTOS_STOCK`, `CAJAS`, `SESIONES_CAJA` y `MOVIMIENTOS_CAJA` si todavia no existen.
3. Verificar que los nombres de campos coincidan exactamente con Airtable.
4. Activar los cuatro workflows.
5. Probar las cuatro URLs desde el navegador o desde la app publicada en GitHub Pages.
