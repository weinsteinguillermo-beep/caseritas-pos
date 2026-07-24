# Gap Analysis V1

Mision 002: estado de capacidades para operar un dia completo.

## Clasificacion

```txt
IMPLEMENTADA
PARCIAL
DISEÑADA
NO INICIADA
BLOQUEADA POR N8N
BLOQUEADA POR AIRTABLE
```

## Resumen

| Capacidad | Estado | Evidencia | Brecha Principal |
|---|---|---|---|
| Productos | PARCIAL | `GET /productos`, workflow productos, POS busca con debounce | Falta gestion completa CRUD y tabla canónica `PRODUCTOS` |
| POS | PARCIAL | Vista POS funcional, carrito, cobro | Falta caja abierta, usuario, comprobante e historial |
| Carrito | IMPLEMENTADA | `js/pos.js` maneja items, cantidades y totales | Falta persistencia/recuperacion si se recarga pantalla |
| Ventas | PARCIAL | `POST /venta` diseñado/JSON preparado | Falta prueba real end-to-end en n8n/Airtable |
| OperationId | PARCIAL | Backend de venta lo contempla | Frontend todavia no genera `operationId` |
| Stock | PARCIAL | Busqueda filtra stock y venta preparada para movimientos | Falta tabla real `MOVIMIENTOS_STOCK` y pruebas de concurrencia |
| Caja | DISEÑADA | Documentada y vista placeholder | Falta separar `CAJA` y `MOVIMIENTOS_CAJA` en implementación real |
| Apertura de caja | NO INICIADA | No hay endpoint ni UI funcional | Requiere modelo `CAJA` y usuario |
| Cierre de caja | NO INICIADA | No hay endpoint ni UI funcional | Requiere movimientos, conteo y diferencia |
| Clientes | PARCIAL | Workflow `clientes.json`, vista placeholder | Falta UI funcional y seleccion de cliente en venta |
| Formas de pago | PARCIAL | Radio buttons en POS | Falta tabla `FORMAS_PAGO` y endpoint configurable |
| Historial | NO INICIADA | Reportes placeholder | Falta `GET /ventas?date=...` y vista historial |
| Anulaciones | DISEÑADA | SALE_FLOW define reversos | Falta endpoint `POST /ventas/:id/anular` |
| Usuarios | NO INICIADA | No existe seleccion real de usuario | Requiere `USUARIOS`, `ROLES`, permisos |
| Auditoría | DISEÑADA | DATA_MODEL recomienda `AUDIT_LOG` | Falta tabla y reglas de auditoria |
| Dashboard | NO INICIADA | Vista reportes placeholder | Falta endpoints agregados y resumen diario |
| Impresión | NO INICIADA | No hay comprobante imprimible | Requiere recibo HTML/PDF o integracion impresora |
| Modo sin conexión | NO INICIADA | Fallback local solo dev | Requiere cola offline, idempotencia fuerte y reconciliacion |

## Bloqueos Por N8N

- Probar `POST /venta` con ejecución real.
- Implementar endpoints futuros de caja, historial y anulacion.
- Confirmar comportamiento de errores y rollback.
- Crear resumen diario sin consumir demasiadas ejecuciones.

## Bloqueos Por Airtable

- Crear/confirmar tablas `DETALLE_VENTA`, `MOVIMIENTOS_STOCK`, `MOVIMIENTOS_CAJA`, `FORMAS_PAGO`, `USUARIOS`, `ROLES`.
- Confirmar tipos de campo compatibles con links, formulas y numeros.
- Definir si se mantiene `PRODUCCION` o se migra hacia `PRODUCTOS`.

## Brechas P0 Para Operar

1. Caja abierta/cerrada.
2. Usuario/cajero activo.
3. Venta real probada.
4. Stock descontado y ledger.
5. Movimiento de caja por venta.
6. Historial del dia.
7. Anulacion controlada.
8. Cierre de caja.
9. Manejo claro de error n8n/Airtable.

## Deuda Tecnica Detectada

- `CAJA` actual representa movimientos, no sesion de caja.
- Frontend no genera `operationId`.
- Alta rapida de producto no esta alineada con datos reales.
- No hay capa de estado global para caja/usuario.
- No hay auditoria de acciones sensibles.
