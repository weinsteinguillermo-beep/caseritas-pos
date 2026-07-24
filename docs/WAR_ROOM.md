# War Room

Centro de mando del proyecto CASERITAS OS.

## Objetivo Actual

Convertir CASERITAS OS en un sistema POS completo para pequenos comercios de Uruguay, capaz de abrir caja, vender durante todo el dia, controlar stock, registrar caja, consultar historial, anular ventas y cerrar jornada con trazabilidad.

## Estado Del Proyecto

Estado general: PRE-PRODUCCION.

CASERITAS OS ya tiene:

- frontend SPA estatico;
- POS funcional con carrito;
- busqueda de productos preparada contra n8n;
- capa API desacoplada;
- estado global operativo local;
- pantallas preparatorias para apertura, movimientos, historial y cierre;
- workflow de venta endurecido con idempotencia, recalculo server-side y rollback compensatorio preparatorio;
- caja real preparada con apertura, estado, movimientos y cierre contra backend;
- historial server-side y anulacion controlada preparados con movimientos inversos;
- paquete de certificacion pre-produccion para instalacion piloto;
- workflows n8n exportables;
- documentacion de arquitectura, venta, datos, pruebas y backlog.

Todavia falta validar la operacion real completa con n8n/Airtable cuando haya ejecuciones disponibles.

## Porcentaje Por Modulo

| Modulo | Avance | Estado |
|---|---:|---|
| POS | 80% | Funcional, cobro protegido y bloqueado sin caja backend confirmada, falta comprobante final y pruebas n8n |
| Productos | 55% | Busqueda real preparada, falta gestion completa |
| Ventas | 75% | Motor blindado e historial/anulacion preparados, falta prueba end-to-end en n8n/Airtable |
| Caja | 65% | Frontend conectado a API y workflows preparados, falta prueba end-to-end en n8n/Airtable |
| Historial | 65% | Vista conectada a backend, detalle y anulacion preparados, falta prueba end-to-end |
| Clientes | 20% | Endpoint/workflow preparado, UI pendiente |
| Produccion | 20% | Tabla actual usada como productos, falta modulo operativo |
| Compras | 5% | Modelo documentado |
| Inventario | 25% | Ledger diseñado, falta implementacion real |
| Reportes | 15% | Documentado, vista placeholder |
| Dashboard | 10% | Ideas y modelo pendientes de implementacion |
| Usuarios/Roles | 10% | Modelo documentado, sin UI/backend |
| Auditoria | 5% | Necesidad identificada |
| Offline | 5% | Solo fallback dev, no operativo |

## Bloqueos

### N8N

- Ejecutar pruebas reales de `POST /venta`.
- Ejecutar pruebas reales de apertura/estado/movimiento/cierre de caja.
- Ejecutar pruebas reales de historial y anulaciones.
- Validar rollback/restauracion de stock con errores reales.

### Airtable

- Confirmar/crear tablas `DETALLE_VENTA`, `MOVIMIENTOS_STOCK`, `CAJAS`, `SESIONES_CAJA`, `MOVIMIENTOS_CAJA`.
- Definir campos exactos y tipos.
- Confirmar si `PRODUCCION` sigue como tabla operativa o migra a `PRODUCTOS`.

### Producto

- Definir flujo exacto de anulacion.
- Definir comprobante minimo.
- Definir si cliente es obligatorio u opcional.

## Ultima Mision

MISION 009: Certificacion Pre-Produccion.

Resultado:

- Plan piloto creado.
- Checklist Go Live creada.
- Guia de instalacion creada.
- Runbook operativo creado.
- Estado del proyecto cambiado a PRE-PRODUCCION.

## Proxima Mision

Recomendada: PILOTO 001 - Primera Instalacion Controlada.

Objetivo:

1. Ejecutar `docs/GO_LIVE_CHECKLIST.md`.
2. Instalar segun `docs/INSTALLATION_GUIDE.md`.
3. Operar piloto segun `docs/PILOT_PLAN.md`.
4. Usar `docs/OPERATIONAL_RUNBOOK.md` ante incidentes.
5. Validar primera venta real y cierre de caja.

## Checklist Hacia La Primera Venta Real

### Datos

- [ ] Confirmar tabla productos actual.
- [ ] Confirmar campos reales de productos.
- [ ] Crear `DETALLE_VENTA`.
- [ ] Crear `MOVIMIENTOS_STOCK`.
- [ ] Crear `CAJAS`.
- [ ] Crear `SESIONES_CAJA`.
- [ ] Crear `MOVIMIENTOS_CAJA`.
- [ ] Confirmar campos de `VENTAS`.
- [ ] Confirmar campos de `CAJA`.

### n8n

- [ ] Importar workflows actualizados.
- [ ] Conectar credencial Airtable.
- [ ] Probar `GET /productos?text=papas`.
- [ ] Probar `GET /producto?code=...`.
- [ ] Probar `POST /venta` con un producto.
- [ ] Probar `POST /caja/abrir`.
- [ ] Probar `POST /caja/estado`.
- [ ] Probar `POST /caja/movimiento`.
- [ ] Probar `POST /caja/cerrar`.
- [ ] Verificar respuesta `{ ok, ventaId, operationId, total }`.
- [ ] Verificar que los precios se recalculan desde Airtable.
- [ ] Probar error de stock insuficiente.
- [ ] Probar doble envio con mismo `OperationId`.
- [ ] Probar timeout/reintento manteniendo el mismo `OperationId`.
- [ ] Probar rollback con falla forzada despues de actualizar stock.

### Frontend

- [ ] Abrir caja local.
- [ ] Seleccionar cajero.
- [ ] Buscar producto real.
- [ ] Agregar al carrito.
- [ ] Elegir forma de pago.
- [ ] Confirmar venta.
- [ ] Ver historial del dia.
- [ ] Revisar movimiento de caja.

### Operacion

- [ ] Definir usuario responsable de la prueba.
- [ ] Definir producto y stock de prueba.
- [ ] Definir monto de caja inicial.
- [ ] Documentar resultado.
- [ ] No vender mas de una unidad hasta validar stock.

## Criterio De Exito Para Primera Venta Real

Una venta se considera real y correcta si:

- existe una fila confirmada en `VENTAS`;
- existe al menos una fila en `DETALLE_VENTA`;
- existe movimiento de stock negativo;
- stock del producto baja correctamente;
- existe movimiento de caja;
- frontend muestra confirmacion;
- no se crea duplicado al repetir `OperationId`.
