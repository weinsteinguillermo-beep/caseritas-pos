# Recovery Scenarios

Mision 007: escenarios de recuperacion.

Objetivo: definir como debe comportarse CASERITAS OS cuando una operacion queda incompleta, duplicada o con estado desconocido.

Principio central: ante duda, no confirmar localmente operaciones sensibles. El backend es la fuente de verdad.

## Estados de recuperacion

| Estado | Significado | Accion esperada |
|---|---|---|
| Confirmado | Backend respondio exito | Actualizar estado local |
| Rechazado | Backend respondio error de negocio | Mostrar mensaje, no persistir exito |
| Pendiente | Operacion enviada, sin resolucion final | Mantener operationId, bloquear repeticion ciega |
| Desconocido | No se sabe si backend recibio la operacion | Consultar estado antes de reintentar |
| RollbackPendiente | Hubo falla parcial | No operar como exito, revisar backend |
| RollbackCompleto | Compensacion aplicada | Permitir continuidad con trazabilidad |

## REC-001 - Corte de Internet antes de enviar venta

Impacto: alto.

Sistema debe:

- mostrar `Servidor no disponible`;
- conservar carrito;
- no crear venta local confirmada;
- no limpiar operationId si la operacion ya habia comenzado.

Recuperacion:

1. Restaurar conexion.
2. Consultar caja.
3. Reintentar con el mismo operationId si la venta quedo pendiente.

## REC-002 - Corte de Internet despues de enviar venta

Impacto: critico.

Sistema debe:

- marcar operacion como pendiente/desconocida;
- conservar operationId;
- evitar un nuevo operationId automatico;
- no duplicar venta al reintentar.

Recuperacion:

1. Revisar `VENTAS` por `OperationId`.
2. Si esta `Confirmada`, recuperar respuesta y limpiar carrito.
3. Si esta `RollbackPendiente`, resolver manualmente.
4. Si no existe, reintentar con el mismo operationId.

## REC-003 - Navegador cerrado durante cobro

Impacto: critico.

Sistema debe:

- persistir operationId pendiente en localStorage;
- no asumir exito;
- consultar estado al volver.

Recuperacion:

1. Abrir app.
2. Reconciliar caja.
3. Buscar venta por operationId cuando exista endpoint de consulta.
4. Hasta tener endpoint, revisar Airtable/n8n manualmente.

## REC-004 - Timeout del navegador

Impacto: critico.

Sistema debe:

- bloquear doble envio;
- mantener estado pendiente;
- mostrar mensaje de operacion incierta.

Recuperacion:

1. No tocar el carrito.
2. Reintentar solo con el mismo operationId.
3. Validar idempotencia en n8n.

## REC-005 - Airtable lento

Impacto: alto.

Sistema debe:

- mantener botones bloqueados durante operacion;
- no disparar requests duplicadas;
- mostrar estado de carga.

Recuperacion:

1. Esperar respuesta.
2. Si hay timeout, tratar como desconocido.
3. Consultar backend antes de repetir.

## REC-006 - n8n reiniciado durante ejecucion

Impacto: critico.

Sistema debe:

- mostrar error de servidor;
- no confirmar venta/caja local;
- conservar operationId.

Recuperacion:

1. Revisar ejecucion n8n.
2. Revisar Airtable por registros parciales.
3. Si existe venta pendiente, ejecutar compensacion o marcar manualmente.

## REC-007 - Respuesta duplicada

Impacto: alto.

Sistema debe:

- deduplicar por operationId;
- no duplicar historial local;
- no duplicar movimientos locales.

Recuperacion:

1. Mantener una sola venta/movimiento visible.
2. Verificar backend con operationId.

## REC-008 - Doble clic en cobrar

Impacto: critico.

Sistema debe:

- bloquear boton;
- usar bandera in-flight;
- enviar una sola request efectiva;
- n8n debe responder idempotente si recibe dos.

Recuperacion:

1. Verificar una sola `VENTAS`.
2. Verificar un solo descuento de stock.
3. Verificar un solo movimiento de caja.

## REC-009 - Doble clic en abrir caja

Impacto: critico.

Sistema debe:

- bloquear boton de apertura;
- reutilizar operationId pendiente;
- impedir dos sesiones abiertas.

Recuperacion:

1. Consultar `POST /caja/estado`.
2. Si abierta, guardar cajaSesionId.
3. Si no abierta, permitir nuevo intento controlado.

## REC-010 - Doble clic en movimiento de caja

Impacto: alto.

Sistema debe:

- bloquear boton;
- registrar un solo movimiento;
- deduplicar por operationId.

Recuperacion:

1. Revisar `MOVIMIENTOS_CAJA`.
2. Si duplicado, generar ajuste/anulacion manual hasta implementar anulacion formal.

## REC-011 - Doble clic en cierre

Impacto: critico.

Sistema debe:

- bloquear boton;
- cierre idempotente por operationId;
- impedir cerrar caja ya cerrada con nuevo operationId.

Recuperacion:

1. Consultar `SESIONES_CAJA`.
2. Si cerrada, actualizar estado local.
3. Si abierta, reintentar cierre con mismo operationId pendiente.

## REC-012 - Operacion pendiente de apertura

Impacto: critico.

Sistema debe:

- guardar datos de apertura pendiente;
- consultar estado al recargar;
- no abrir otra caja automaticamente.

Recuperacion:

1. Consultar `/caja/estado`.
2. Si abierta, guardar `cajaSesionId`.
3. Si no abierta y n8n no registro nada, permitir reintento.

## REC-013 - Operacion pendiente de movimiento

Impacto: alto.

Sistema debe:

- no confirmar movimiento localmente;
- conservar operationId;
- advertir no repetir.

Recuperacion:

1. Revisar `MOVIMIENTOS_CAJA` por operationId.
2. Si existe, registrar localmente.
3. Si no existe, reintentar con mismo operationId.

## REC-014 - Operacion pendiente de cierre

Impacto: critico.

Sistema debe:

- no marcar caja cerrada sin backend;
- bloquear reintento ciego;
- conservar operationId.

Recuperacion:

1. Consultar `SESIONES_CAJA`.
2. Si cerrada, actualizar local.
3. Si abierta, reintentar con mismo operationId.

## REC-015 - Operacion desconocida

Impacto: critico.

Sistema debe:

- mostrar estado desconocido;
- bloquear acciones que puedan duplicar dinero o stock;
- pedir verificacion de backend.

Recuperacion:

1. Buscar por operationId.
2. Confirmar si existe registro.
3. Resolver segun estado.

## REC-016 - RollbackPendiente en venta

Impacto: critico.

Sistema debe:

- no mostrar venta como confirmada;
- no limpiar evidencia operativa;
- informar revision.

Recuperacion:

1. Revisar `VENTAS`.
2. Revisar `MOVIMIENTOS_STOCK`.
3. Revisar `MOVIMIENTOS_CAJA`.
4. Restaurar/anular segun corresponda.
5. Marcar `RollbackCompleto` cuando termine.

## REC-017 - Stock descontado sin venta confirmada

Impacto: critico.

Sistema debe:

- detectar por estado de venta;
- restaurar stock si el rollback tiene datos;
- dejar auditoria.

Recuperacion:

1. Identificar producto y stockBefore.
2. Restaurar `Stock Actual`.
3. Crear movimiento de stock tipo Rollback cuando exista flujo formal.

## REC-018 - Movimiento de caja sin venta confirmada

Impacto: critico.

Sistema debe:

- marcar movimiento como `ANULADO`;
- no incluirlo en cierre esperado;
- vincular motivo al operationId.

Recuperacion:

1. Buscar movimiento por operationId.
2. Marcar `ANULADO`.
3. Confirmar que cierre excluye anulados.

## REC-019 - Backend dice caja cerrada, local dice abierta

Impacto: critico.

Sistema debe:

- priorizar backend;
- bloquear POS;
- actualizar estado local.

Recuperacion:

1. Consultar `/caja/estado`.
2. Guardar caja como cerrada/no confirmada.
3. Pedir nueva apertura si corresponde.

## REC-020 - Backend dice caja abierta, local dice cerrada

Impacto: critico.

Sistema debe:

- recuperar sesion abierta;
- guardar `cajaSesionId`;
- permitir POS luego de confirmacion.

Recuperacion:

1. Consultar `/caja/estado`.
2. Actualizar local con datos del servidor.

## REC-021 - localStorage corrupto

Impacto: alto.

Sistema debe:

- iniciar con estado default;
- no romper router;
- requerir reconfirmacion de caja.

Recuperacion:

1. Limpiar estado local.
2. Consultar caja si se conocen usuario/caja.
3. Continuar solo con estado backend.

## REC-022 - localStorage viejo sin campos nuevos

Impacto: alto.

Sistema debe:

- cargar defaults faltantes;
- no asumir caja confirmada backend;
- reconciliar.

Recuperacion:

1. Aplicar defaultState.
2. Consultar `/caja/estado`.

## REC-023 - Airtable rate limit

Impacto: alto.

Sistema debe:

- mostrar error amigable;
- no reintentar en bucle;
- conservar operationId si era operacion sensible.

Recuperacion:

1. Esperar ventana de rate limit.
2. Consultar estado por operationId.
3. Reintentar controlado.

## REC-024 - n8n sin ejecuciones disponibles

Impacto: critico.

Sistema debe:

- mostrar servidor no disponible o error amigable;
- bloquear ventas/caja reales;
- no activar fallback local en produccion.

Recuperacion:

1. Esperar disponibilidad de n8n.
2. Ejecutar pruebas de smoke.
3. Retomar operaciones reales.

## REC-025 - CORS falla desde GitHub Pages

Impacto: critico.

Sistema debe:

- mostrar error de conexion;
- no confirmar operacion local.

Recuperacion:

1. Verificar headers en Respond to Webhook.
2. Probar desde URL publica.
3. Reimportar workflow si falta header.

## REC-026 - Credencial Airtable expirada

Impacto: critico.

Sistema debe:

- recibir error de n8n;
- no devolver falso exito;
- no confirmar localmente.

Recuperacion:

1. Renovar credencial.
2. Reejecutar pruebas criticas.
3. Revisar operaciones pendientes.

## REC-027 - Tabla Airtable faltante

Impacto: critico.

Sistema debe:

- fallar de forma visible;
- evitar registros parciales confirmados.

Recuperacion:

1. Crear tabla faltante.
2. Confirmar campos.
3. Reimportar o actualizar workflow.
4. Repetir certificacion.

## REC-028 - Campo Airtable renombrado

Impacto: critico.

Sistema debe:

- no devolver `ok:true`;
- mostrar error amigable.

Recuperacion:

1. Restaurar nombre exacto.
2. Revalidar workflow.

## REC-029 - Usuario/cajero incorrecto

Impacto: alto.

Sistema debe:

- registrar usuario_id en operaciones;
- impedir cierre de caja de otro usuario desde backend.

Recuperacion:

1. Corregir usuario.
2. Si hubo operacion confirmada, registrar ajuste manual/auditoria.

## REC-030 - Cierre con operaciones pendientes

Impacto: critico.

Sistema debe:

- impedir cierre si existen operaciones `RollbackPendiente` o desconocidas cuando ese control este disponible;
- hoy debe tratarse como riesgo operativo manual.

Recuperacion:

1. Revisar n8n y Airtable.
2. Resolver pendientes.
3. Cerrar caja.

## REC-031 - Timeout durante anulacion

Impacto: critico.

Sistema debe:

- conservar `operationId` de anulacion;
- marcar la operacion como pendiente/desconocida;
- no permitir repetir la anulacion sin consultar detalle.

Recuperacion:

1. Consultar `POST /venta/detalle`.
2. Si la venta esta `ANULADA`, limpiar pendiente local.
3. Si esta `ANULACION_PENDIENTE`, revisar n8n/Airtable.
4. Si sigue `CONFIRMADA` y no existe `AnulacionOperationId`, reintentar con el mismo operationId.

## REC-032 - Falla luego de restaurar stock en anulacion

Impacto: critico.

Sistema debe:

- no responder exito;
- dejar venta en `ANULACION_PENDIENTE` o `ERROR_ANULACION`;
- impedir una segunda restauracion automatica.

Recuperacion:

1. Revisar movimientos `COMPENSATORIO` en `MOVIMIENTOS_STOCK`.
2. Revisar `Stock Actual`.
3. Completar o revertir manualmente.
4. Marcar venta como `ANULADA` solo si caja tambien fue compensada.

## REC-033 - Falla luego de movimiento inverso de caja

Impacto: critico.

Sistema debe:

- no ocultar inconsistencia;
- conservar movimiento original y compensatorio;
- dejar venta pendiente si no pudo marcarse anulada.

Recuperacion:

1. Revisar `MOVIMIENTOS_CAJA`.
2. Confirmar que solo existe un movimiento compensatorio.
3. Marcar venta como `ANULADA` si stock y caja estan correctos.

## REC-034 - Historial duplica venta local y server

Impacto: alto.

Sistema debe:

- unir por `operationId`;
- priorizar estado de servidor;
- mantener pendientes locales solo si no existen en backend.

Recuperacion:

1. Refrescar historial.
2. Verificar una sola fila visual.
3. Confirmar estado servidor.

## REC-035 - Venta anulada aparece como confirmada en localStorage

Impacto: alto.

Sistema debe:

- priorizar estado `ANULADA` del servidor;
- no permitir anular nuevamente.

Recuperacion:

1. Consultar historial server-side.
2. Actualizar vista con estado servidor.
3. Revisar localStorage solo como respaldo.
