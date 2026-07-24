# Dashboard Lab

## Objetivo

Diseñar el dashboard operativo de CASERITAS OS.

## Indicadores Prioritarios

- Ventas del dia.
- Ventas por forma de pago.
- Ticket promedio.
- Productos mas vendidos.
- Productos con stock bajo.
- Caja esperada vs caja contada.
- Anulaciones.
- Movimientos manuales de caja.

## Fuentes

- VENTAS.
- DETALLE_VENTA.
- MOVIMIENTOS_CAJA.
- MOVIMIENTOS_STOCK.
- PRODUCTOS.

## Riesgos

- Consultas lentas si se calcula todo en vivo.
- Diferencias si hay operaciones `RollbackPendiente`.

## Recomendacion

Crear endpoints de resumen preparados por n8n o tablas resumen antes de construir graficos complejos.
