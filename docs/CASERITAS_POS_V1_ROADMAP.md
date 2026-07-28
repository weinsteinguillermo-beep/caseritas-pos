# Caseritas POS v1.0 Roadmap

## Objetivo de la version

Poner Caseritas POS en operacion real para ejecutar una primera venta completa desde GitHub Pages, registrando apertura de caja, busqueda de productos, carrito, cobro, venta, detalle, movimiento de caja, movimientos de stock, descuento de stock y cierre de caja.

URL publica objetivo:

https://weinsteinguillermo-beep.github.io/caseritas-pos/#pos

## Arquitectura

| Capa | Responsabilidad | Estado |
|---|---|---|
| Frontend HTML/CSS/JS | Operacion diaria del cajero | REQUIERE CERTIFICACION |
| js/api.js | Capa API unica con fetch y normalizacion | FUNCIONA |
| n8n Cloud | API, validacion, transformacion y operaciones Airtable | BLOQUEA PRODUCCION |
| Airtable | Base de datos y panel administrativo | REQUIERE CERTIFICACION |
| GitHub | Fuente de verdad de codigo y workflows | FUNCIONA |

## Alcance v1.0

- Abrir caja.
- Consultar estado de caja.
- Buscar producto por texto.
- Buscar o escanear producto por codigo de barras.
- Agregar, cambiar cantidad y eliminar productos del carrito.
- Seleccionar forma de pago.
- Registrar venta con OperationId.
- Crear venta, detalle, movimiento de caja y movimientos de stock.
- Descontar stock.
- Limpiar POS luego de venta confirmada.
- Mantener caja abierta para siguiente venta.
- Cerrar caja.

## Exclusiones v1.0

- Nuevos modulos funcionales.
- Redisenos visuales.
- Nuevas librerias o frameworks.
- Modo offline completo.
- Dashboard avanzado.
- Inteligencia artificial.
- Impresion fiscal definitiva.

## Modulos

| Modulo | Estado | Nota |
|---|---|---|
| POS | REQUIERE CERTIFICACION | Flujo implementado; depende de endpoints publicos. |
| Productos | LISTO PARA IMPORTAR | `workflow_productos.json` creado como IaC. |
| Producto por codigo | REQUIERE CERTIFICACION | Workflow local existe; respuesta publica actual vacia. |
| Caja estado | BLOQUEA PRODUCCION | Endpoint publico actual devuelve 404. |
| Caja apertura | BLOQUEA PRODUCCION | Endpoint publico actual devuelve 404. |
| Venta | BLOQUEA PRODUCCION | Endpoint publico actual devuelve 200 con cuerpo vacio. |
| Cierre caja | REQUIERE CERTIFICACION | Workflow local existe; no certificado en produccion. |
| Historial/anulacion | MEJORA FUTURA | No bloquea primera venta si no se usa para circuito inicial. |

## Endpoints obligatorios

| Orden | Endpoint | Metodo | Estado actual |
|---|---|---|---|
| 1 | `/productos` | GET | LISTO PARA IMPORTAR |
| 2 | `/producto` | GET | REQUIERE CERTIFICACION |
| 3 | `/caja/estado` | POST | BLOQUEA PRODUCCION |
| 4 | `/caja/abrir` | POST | BLOQUEA PRODUCCION |
| 5 | `/venta` | POST | BLOQUEA PRODUCCION |
| 6 | `/caja/cerrar` | POST | REQUIERE CERTIFICACION |

## Estado actual

El frontend apunta a `https://gweinstein26.app.n8n.cloud/webhook` y `USE_LOCAL_FALLBACK` esta en `false`.

Evidencia publica no destructiva al 2026-07-28:

- `GET /productos?text=papas`: HTTP 200, JSON content-type, cuerpo vacio, sin CORS visible.
- `GET /producto?code=TEST`: HTTP 200, JSON content-type, cuerpo vacio, sin CORS visible.
- `POST /caja/estado`: HTTP 404.
- `POST /venta` con payload invalido sin escritura: HTTP 200, cuerpo vacio.

## Bloqueos

1. Los workflows activos en n8n Cloud no coinciden con los JSON importables del repositorio o no llegan al nodo Respond to Webhook.
2. `/caja/estado` y `/caja/abrir` no existen publicamente en produccion o no estan activados.
3. No hay evidencia todavia de CORS visible en respuestas publicas.
4. No hay evidencia todavia de escrituras reales correctas en Airtable para venta/caja/stock.

## Orden de trabajo

1. Importar y activar `n8n-workflows/workflow_productos.json`.
2. Certificar `/productos` con JSON real y CORS visible.
3. Preparar/importar/certificar `/producto`.
4. Preparar/importar/certificar `/caja/estado`.
5. Preparar/importar/certificar `/caja/abrir`.
6. Preparar/importar/certificar `/venta`.
7. Certificar `/caja/cerrar` si se mantiene dentro del circuito v1.0.
8. Ejecutar prueba integral desde GitHub Pages.
9. Registrar primera venta real.

## Criterio de finalizacion

Caseritas POS v1.0 se considera certificado solo cuando una venta real desde GitHub Pages crea en Airtable todos los registros criticos y deja el POS listo para una nueva venta, con caja abierta y stock descontado.
