# Airtable Release Checklist

Estado del documento: EN PREPARACION.

Objetivo: guiar la verificacion manual de Airtable antes de importar y ejecutar workflows reales de Caseritas POS v1.0.

No crear registros reales durante esta verificacion. No cambiar nombres sin actualizar workflows IaC.

## 1. Obtener Table ID

Para cada tabla pendiente:

1. Abrir la base Airtable de Caseritas.
2. Entrar a la tabla.
3. Copiar el identificador de tabla desde la URL o desde la documentacion/API de Airtable.
4. Registrar el valor exacto en el formato `tbl...`.
5. Confirmar que el nombre visible coincide exactamente con el esperado.

Formato de reporte:

```txt
Tabla: SESIONES_CAJA
Table ID: tbl...
Nombre visible exacto: SESIONES_CAJA
Campo primario: ...
Estado: confirmado / no coincide
```

## 2. Obtener nombre exacto y tipo de campo

Para cada campo:

1. Abrir el menu del campo en Airtable.
2. Revisar el nombre exacto, respetando mayusculas, espacios y guiones bajos.
3. Revisar el tipo de campo.
4. Si es single select, abrir la lista de opciones.
5. Si es linked record, confirmar la tabla destino.
6. Si es formula/lookup/rollup, indicar que no es escribible.

Formato de reporte:

```txt
Tabla: MOVIMIENTOS_CAJA
Campo: caja_sesion_id
Tipo: Single line text / Linked record
Opciones: no aplica
Destino linked record: SESIONES_CAJA / no aplica
Escribible desde n8n: si / no
Observacion: ...
```

## 3. Confirmar campos primarios

Registrar el campo primario de cada tabla:

| Tabla | Campo primario esperado | Campo primario real | Estado |
|---|---|---|---|
| PRODUCCION | Name | Pendiente | Pendiente |
| VENTAS | Pendiente | Pendiente | Pendiente |
| SESIONES_CAJA | Pendiente | Pendiente | Pendiente |
| DETALLE_VENTA | Pendiente | Pendiente | Pendiente |
| MOVIMIENTOS_STOCK | Pendiente | Pendiente | Pendiente |
| MOVIMIENTOS_CAJA | Pendiente | Pendiente | Pendiente |

## 4. Confirmar opciones single select

### SESIONES_CAJA.estado

Esperado:

```txt
ABIERTA
CERRADA
```

### VENTAS.Estado

Esperado:

```txt
PENDIENTE
CONFIRMADA
ERROR
ROLLBACK_PENDIENTE
ANULACION_PENDIENTE
ANULADA
```

### DETALLE_VENTA.Estado

Esperado:

```txt
ACTIVO
ANULADO
COMPENSATORIO
ERROR
```

### MOVIMIENTOS_STOCK.Tipo

Esperado:

```txt
VENTA
ANULACION
AJUSTE
```

### MOVIMIENTOS_STOCK.Estado

Esperado:

```txt
ACTIVO
ANULADO
COMPENSATORIO
ERROR
```

### MOVIMIENTOS_CAJA.tipo

Esperado:

```txt
INGRESO
EGRESO
```

### MOVIMIENTOS_CAJA.origen

Esperado:

```txt
VENTA
INGRESO
EGRESO
ANULACION
MANUAL
ROLLBACK
```

### MOVIMIENTOS_CAJA.estado

Esperado:

```txt
ACTIVO
ANULADO
COMPENSATORIO
ERROR
```

## 5. Confirmar relaciones

| Tabla | Campo | Relacion esperada | Estado |
|---|---|---|---|
| DETALLE_VENTA | Venta | VENTAS | Pendiente |
| DETALLE_VENTA | Producto | PRODUCCION | Pendiente |
| MOVIMIENTOS_STOCK | Producto | PRODUCCION | Pendiente |
| MOVIMIENTOS_STOCK | Venta | VENTAS | Pendiente |
| MOVIMIENTOS_CAJA | venta_id | VENTAS o texto estable | Pendiente |
| MOVIMIENTOS_CAJA | caja_sesion_id | SESIONES_CAJA o texto estable | Pendiente |

Nota: si un workflow envia arrays como `[recordId]`, el campo debe ser linked record. Si Airtable usa texto, el workflow debera ajustarse antes de ejecutar produccion.

## 6. Confirmar permisos de credencial n8n

La credencial Airtable en n8n debe poder:

- Leer PRODUCCION.
- Actualizar `Stock Actual` en PRODUCCION.
- Leer y crear VENTAS.
- Actualizar VENTAS.
- Leer, crear y actualizar SESIONES_CAJA.
- Crear DETALLE_VENTA.
- Crear MOVIMIENTOS_STOCK.
- Crear y actualizar MOVIMIENTOS_CAJA.

## 7. Evidencia minima requerida

Guillermo debe enviar una de estas opciones:

- Capturas de Airtable de cada tabla con campos y tipos visibles.
- Copia textual de Table ID, campos, tipos y opciones.
- Export/documentacion de Airtable API para la base.

Formato compacto recomendado:

```txt
Tabla: DETALLE_VENTA
Table ID: tbl...
Campo primario: ...
Campos:
- Venta | linked record | VENTAS | escribible: si
- Producto | linked record | PRODUCCION | escribible: si
- ProductoNombre | single line text | escribible: si
- CodigoBarras | single line text | escribible: si
- Cantidad | number | escribible: si
- PrecioUnitario | currency | escribible: si
- TotalLinea | currency | escribible: si
- Estado | single select: ACTIVO, ANULADO, COMPENSATORIO, ERROR | escribible: si
```

## 8. Criterio para marcar esquema certificado

El esquema solo puede marcarse CERTIFICADO cuando:

- Todos los Table IDs pendientes esten confirmados.
- Todos los nombres de campos coincidan exactamente o los workflows esten ajustados.
- Todos los tipos de campos escribibles sean compatibles con payloads n8n.
- Todas las opciones single select existan.
- Todas las relaciones linked record apunten a la tabla correcta.
- La credencial Airtable tenga permisos suficientes.
- Los workflows importados ejecuten al menos una prueba controlada sin datos reales destructivos.

## 9. Orden recomendado de verificacion

1. PRODUCCION.
2. VENTAS.
3. SESIONES_CAJA.
4. MOVIMIENTOS_CAJA.
5. DETALLE_VENTA.
6. MOVIMIENTOS_STOCK.
7. Credencial Airtable en n8n.
8. Importacion de workflows.
9. Prueba controlada de apertura.
10. Prueba controlada de venta.
11. Prueba controlada de cierre.
