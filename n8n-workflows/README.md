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
venta.json      -> escribe VENTAS y luego registra ingreso en CAJA
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
Fecha
MetodoPago
Subtotal
DescuentoPorcentaje
DescuentoImporte
Total
EfectivoRecibido
ItemsJSON
Estado
```

`ItemsJSON` guarda el detalle completo de productos vendidos como JSON.

### CAJA

Campos escritos despues de registrar una venta:

```txt
Fecha
Tipo
Concepto
MetodoPago
Importe
VentaId
Estado
```

## URLs que usa Caseritas POS

Con los workflows activos, las URLs esperadas son:

```txt
GET  https://gweinstein26.app.n8n.cloud/webhook/productos?text=texto
GET  https://gweinstein26.app.n8n.cloud/webhook/producto?code=7790000000000
GET  https://gweinstein26.app.n8n.cloud/webhook/clientes?text=texto
POST https://gweinstein26.app.n8n.cloud/webhook/venta
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
- Exige total numerico mayor a cero.
- Crea la venta en VENTAS.
- Crea el ingreso correspondiente en CAJA.

## Configuracion manual pendiente en n8n

1. Conectar la credencial Airtable en cada nodo Airtable.
2. Verificar que los nombres de campos coincidan exactamente con Airtable.
3. Activar los cuatro workflows.
4. Probar las cuatro URLs desde el navegador o desde la app publicada en GitHub Pages.
