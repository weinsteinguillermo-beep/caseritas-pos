# V1 Backlog

Mision 002: backlog priorizado para operar un dia completo.

Prioridades:

```txt
P0 = imprescindible para operar
P1 = necesario para estabilidad
P2 = mejora importante
P3 = futuro
```

## Backlog

| ID | Descripcion | Prioridad | Dependencias | Riesgo | Criterio de aceptacion | Estimacion |
|---|---|---|---|---|---|---|
| V1-001 | Crear estado operativo global con `empresa_id`, `usuario_id`, `caja_id`, estado servidor | P0 | Ninguna | Alto si se duplica estado por vista | POS y Caja leen el mismo estado | M |
| V1-002 | Generar `operationId` en frontend antes de cobrar | P0 | V1-001 | Duplicacion de ventas por reintento | Dos clicks no crean dos ventas | S |
| V1-003 | Bloquear cobrar si no hay caja abierta | P0 | V1-001 | Ventas sin caja | Boton Cobrar no opera sin `caja_id` abierta | S |
| V1-004 | Diseñar/crear endpoint `POST /caja/apertura` | P0 | Tabla CAJA | No poder iniciar jornada | Caja queda abierta con saldo inicial y usuario | M |
| V1-005 | Implementar UI funcional de apertura de caja | P0 | V1-004 | Cajero no puede operar | Usuario abre caja desde vista Caja | M |
| V1-006 | Crear tabla/flujo `MOVIMIENTOS_CAJA` | P0 | DATA_MODEL | Caja no auditable | Venta e ingresos/egresos crean ledger financiero | M |
| V1-007 | Probar `POST /venta` end-to-end en n8n/Airtable | P0 | n8n disponible, tablas detalle/stock | Venta no confiable | Venta crea venta, detalle, stock y caja | L |
| V1-008 | Crear tablas reales `DETALLE_VENTA` y `MOVIMIENTOS_STOCK` | P0 | Airtable | Stock/reportes incompletos | Tablas existen con campos documentados | M |
| V1-009 | Implementar historial de ventas del dia | P0 | Endpoint ventas | No se puede anular ni revisar | Lista ventas por fecha/caja | M |
| V1-010 | Implementar anulacion controlada | P0 | Historial, stock/caja ledger | Perdidas por errores de venta | Anular crea movimientos inversos | L |
| V1-011 | Implementar cierre de caja | P0 | Caja abierta, movimientos caja | No se puede cerrar jornada | Caja cierra con esperado, contado y diferencia | L |
| V1-012 | Mostrar resumen final de jornada | P0 | Cierre de caja | Encargado sin control final | Totales por forma de pago y diferencia visibles | M |
| V1-013 | Mejorar manejo de `Servidor no disponible` en operaciones sensibles | P0 | Estado servidor | Operacion incierta | Sistema bloquea cobrar/abrir/cerrar si backend cae | S |
| V1-014 | Crear endpoint `GET /ventas?date=&cajaId=` | P1 | VENTAS/DETALLE | Historial lento o incompleto | Devuelve ventas del dia normalizadas | M |
| V1-015 | Crear endpoint `POST /caja/movimiento` | P1 | MOVIMIENTOS_CAJA | Ingresos/egresos manuales sin control | Movimiento requiere concepto, usuario e importe | M |
| V1-016 | UI ingresos manuales de caja | P1 | V1-015 | Caja no refleja operaciones reales | Ingreso manual aparece en resumen | S |
| V1-017 | UI egresos manuales de caja | P1 | V1-015 | Gastos chicos fuera del sistema | Egreso manual aparece en resumen | S |
| V1-018 | Crear `FORMAS_PAGO` y endpoint `GET /formas-pago` | P1 | DATA_MODEL | Formas hardcodeadas | POS carga formas activas por empresa | M |
| V1-019 | Comprobante post-venta imprimible por navegador | P1 | Venta exitosa | Cajero sin respaldo para cliente | Al confirmar venta se puede ver/imprimir comprobante | M |
| V1-020 | Reemplazar texto "Datos locales" del header por estado real | P1 | Estado servidor | Confusion operativa | Header muestra servidor/caja/usuario | XS |
| V1-021 | Seleccion de usuario/cajero | P1 | USUARIOS/ROLES | Operaciones sin responsable | Venta/caja registran `usuario_id` | M |
| V1-022 | Auditoria basica de acciones sensibles | P1 | USUARIOS | Sin trazabilidad de anulaciones/caja | Apertura, cierre, anulacion quedan auditadas | M |
| V1-023 | Deshabilitar o redirigir alta rapida de producto | P1 | Producto real | Producto temporal puede confundir | Alta rapida no promete guardar localmente | S |
| V1-024 | Dashboard diario basico | P2 | Historial/caja | Baja visibilidad | Muestra ventas, caja y stock critico | M |
| V1-025 | Clientes en POS | P2 | Clientes endpoint/UI | Sin historial por cliente | Venta puede asociar cliente opcional | M |
| V1-026 | Reporte productos mas vendidos | P2 | DETALLE_VENTA | Reportes limitados | Lista ranking por periodo | M |
| V1-027 | Alertas de stock bajo | P2 | MOVIMIENTOS_STOCK/PRODUCTOS | Quiebres de stock | Productos bajo minimo visibles | M |
| V1-028 | Modo offline con cola segura | P3 | OperationId, almacenamiento local, reconciliacion | Duplicados/inconsistencias | Ventas offline se reconcilian sin duplicar | XL |
| V1-029 | Integracion impresora termica | P3 | Comprobante definido | Hardware variable | Ticket imprime en dispositivo validado | L |
| V1-030 | Migracion SQL futura | P3 | DATA_MODEL estable | Airtable limita escala | Modelo SQL equivalente probado | XL |

## Orden Recomendado P0

1. `V1-008`
2. `V1-007`
3. `V1-001`
4. `V1-002`
5. `V1-004`
6. `V1-005`
7. `V1-003`
8. `V1-006`
9. `V1-009`
10. `V1-010`
11. `V1-011`
12. `V1-012`
13. `V1-013`
