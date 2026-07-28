# Caseritas POS v1.0 Operacion

## Publicar frontend

1. Verificar que `js/config.js` apunte a `https://gweinstein26.app.n8n.cloud/webhook`.
2. Verificar que `USE_LOCAL_FALLBACK` este en `false`.
3. Publicar la rama correspondiente en GitHub Pages.
4. Abrir `https://weinsteinguillermo-beep.github.io/caseritas-pos/#pos`.
5. Confirmar que la pantalla de apertura de caja carga sin errores visibles.

## Importar workflows

1. En n8n Cloud, borrar o desactivar el workflow anterior del mismo endpoint.
2. Importar el archivo IaC correspondiente desde `n8n-workflows/`.
3. Asignar la credencial Airtable.
4. Guardar.
5. Activar.
6. Probar exclusivamente la Production URL.

Archivos objetivo v1.0:

- `workflow_productos.json`
- `workflow_producto.json`
- `workflow_caja_estado.json`
- `workflow_caja_abrir.json`
- `workflow_venta.json`
- `workflow_caja_cerrar.json`, si se certifica cierre en v1.0

## Asignar credenciales

Cada nodo Airtable debe usar la credencial Airtable de Guillermo en n8n Cloud. El repositorio no debe contener tokens ni claves.

## Activar workflows

Luego de importar y asignar credenciales:

1. Guardar workflow.
2. Desactivar si estaba activo.
3. Activar nuevamente.
4. Confirmar que no exista otro workflow activo con el mismo path.
5. Probar Production URL.
6. Revisar la ejecucion generada en n8n Executions.

## Abrir caja

1. Abrir el POS publicado.
2. Ingresar cajero.
3. Confirmar caja.
4. Ingresar fondo inicial.
5. Pulsar abrir caja.
6. Verificar que el POS pase automaticamente a venta.
7. Confirmar en Airtable que exista sesion de caja abierta.

## Realizar una venta

1. Buscar producto por nombre.
2. Agregar producto al carrito.
3. Buscar o escanear producto por codigo.
4. Cambiar cantidades si corresponde.
5. Seleccionar forma de pago.
6. Confirmar venta.
7. Verificar que el POS limpie carrito solo si n8n responde OK.

## Validar Airtable

Luego de una venta real, confirmar:

- Registro en `VENTAS` con estado confirmado.
- Registros en `DETALLE_VENTA` vinculados a venta.
- Movimiento en `MOVIMIENTOS_CAJA` vinculado a venta/caja.
- Movimientos en `MOVIMIENTOS_STOCK` vinculados a producto/venta.
- Descuento en `Stock Actual` de `PRODUCCION`.

## Cerrar caja

1. Abrir modal de cierre.
2. Ingresar total contado.
3. Agregar observaciones si existe diferencia.
4. Confirmar cierre.
5. Verificar sesion cerrada en Airtable.

## Si n8n esta fuera de linea

- No repetir aperturas, ventas ni cierres si el POS muestra operacion pendiente.
- Revisar n8n Executions antes de reintentar.
- Confirmar estado real en Airtable.
- Si una venta queda en estado desconocido, no marcarla manualmente como confirmada sin revisar detalle, caja y stock.

## Volver a una version anterior

1. Identificar el ultimo commit estable.
2. Restaurar frontend desde GitHub si fuera necesario.
3. En n8n, desactivar workflows importados recientemente.
4. Reactivar el workflow anterior solo si estaba certificado.
5. Registrar la incidencia en `CASERITAS_POS_V1_INCIDENCIAS.md`.
