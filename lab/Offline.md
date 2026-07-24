# Offline Lab

## Objetivo

Explorar si CASERITAS OS puede operar sin conexion de forma segura.

## Principio

No se debe vender offline hasta tener reconciliacion robusta con `OperationId`, stock reservado y cola local.

## Ideas

- Modo solo consulta con cache de productos.
- Cola local de ventas pendientes.
- Reconciliacion al volver conexion.
- Bloqueo de productos con stock incierto.
- Avisos claros de riesgo operativo.

## Riesgos

- Duplicacion de ventas.
- Stock negativo.
- Caja inconsistente.
- Ventas no sincronizadas.

## Recomendacion

Para V1, mantener offline como no operativo: mostrar `Servidor no disponible` y bloquear cobro.
