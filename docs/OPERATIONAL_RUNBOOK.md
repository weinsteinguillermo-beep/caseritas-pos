# Operational Runbook

Mision 009: guia operativa ante incidentes.

Regla general: si no se conoce el estado real de una operacion, no repetirla con un operationId nuevo.

## Servidor caido

Sintomas:

- Mensaje `Servidor no disponible`.
- Busqueda no devuelve productos.
- Caja/venta no responde.

Accion inmediata:

1. No cobrar.
2. No abrir ni cerrar caja nuevamente.
3. Revisar conexion local.
4. Revisar n8n Cloud.
5. Revisar si hay ejecuciones disponibles.

Recuperacion:

1. Esperar vuelta del servicio.
2. Consultar estado de caja.
3. Revisar operaciones pendientes.
4. Continuar solo si backend responde.

Tiempo objetivo: 5 a 15 min.

## Airtable lento

Sintomas:

- n8n demora.
- Operaciones quedan cargando.
- Timeout del navegador.

Accion inmediata:

1. Esperar respuesta.
2. No presionar varias veces.
3. Si hay timeout, marcar como operacion desconocida.

Recuperacion:

1. Buscar registro por `operationId`.
2. Si existe, reconciliar estado.
3. Si no existe, reintentar con el mismo `operationId`.

Tiempo objetivo: 10 a 20 min.

## Timeout

Sintomas:

- La app no recibe respuesta.
- n8n/Airtable puede haber procesado la operacion.

Accion inmediata:

1. No repetir con una nueva operacion.
2. Anotar hora y pantalla.
3. Conservar carrito/caja segun corresponda.

Recuperacion:

1. Buscar por `operationId`.
2. Si esta confirmado, actualizar estado local.
3. Si esta pendiente, esperar o resolver manualmente.
4. Si no existe, reintentar con el mismo `operationId`.

Tiempo objetivo: 5 a 15 min.

## Stock inconsistente

Sintomas:

- Stock en Airtable no coincide con venta.
- Producto aparece disponible pero backend rechaza.
- Stock negativo.

Accion inmediata:

1. Detener ventas del producto afectado.
2. Revisar `MOVIMIENTOS_STOCK`.
3. Revisar ventas recientes.

Recuperacion:

1. Identificar ultimo stock correcto.
2. Revisar movimientos por operationId.
3. Crear ajuste manual documentado si corresponde.
4. Rehabilitar producto.

Tiempo objetivo: 15 a 45 min.

## Venta duplicada

Sintomas:

- Dos ventas por una sola operacion.
- Dos descuentos de stock.
- Dos movimientos de caja.

Accion inmediata:

1. No borrar registros.
2. Identificar operationId de ambas ventas.
3. Confirmar si realmente son duplicadas.

Recuperacion:

1. Anular la venta duplicada con motivo.
2. Verificar movimiento inverso de stock.
3. Verificar movimiento inverso de caja.
4. Revisar cierre de caja.

Tiempo objetivo: 10 a 30 min.

## Caja no cierra

Sintomas:

- `POST /caja/cerrar` falla.
- Diferencia no calculada.
- Caja queda abierta.

Accion inmediata:

1. No abrir otra caja.
2. Revisar si hay operaciones pendientes.
3. Revisar movimientos de caja.

Recuperacion:

1. Consultar `SESIONES_CAJA`.
2. Revisar `MOVIMIENTOS_CAJA`.
3. Resolver rollback/anulaciones pendientes.
4. Reintentar cierre con mismo operationId si hubo timeout.
5. Si falla por datos, cerrar manualmente con observacion en Airtable solo con responsable tecnico.

Tiempo objetivo: 15 a 45 min.

## Rollback pendiente

Sintomas:

- Venta queda `RollbackPendiente`, `ERROR`, `ANULACION_PENDIENTE` o `ERROR_ANULACION`.
- Stock/caja pueden estar parcialmente compensados.

Accion inmediata:

1. No considerar la operacion como exitosa.
2. Anotar operationId.
3. Revisar n8n execution.

Recuperacion:

1. Revisar venta.
2. Revisar detalle.
3. Revisar movimientos stock.
4. Revisar movimientos caja.
5. Completar compensacion manual si corresponde.
6. Marcar estado final.

Tiempo objetivo: 20 a 60 min.

## Operacion desconocida

Sintomas:

- La app informa pendiente/desconocida.
- No se sabe si n8n recibio la solicitud.

Accion inmediata:

1. No repetir con operationId nuevo.
2. Buscar por operationId.
3. Revisar n8n.

Recuperacion:

1. Si existe y esta confirmada, reconciliar local.
2. Si existe y esta pendiente, resolver.
3. Si no existe, reintentar con mismo operationId.

Tiempo objetivo: 5 a 20 min.

## Impresora falla

Sintomas:

- No imprime comprobante.
- Navegador no muestra dialogo.
- Papel agotado.

Accion inmediata:

1. No repetir venta.
2. Confirmar venta en historial.
3. Registrar comprobante manual si aplica.

Recuperacion:

1. Revisar impresora.
2. Revisar papel.
3. Reimprimir desde historial preliminar.
4. Si no se puede imprimir, entregar comprobante manual.

Tiempo objetivo: 5 a 15 min.

## Corte de Internet

Sintomas:

- App abre pero no consulta productos/caja.
- n8n no responde.

Accion inmediata:

1. No vender en CASERITAS OS.
2. Activar registro manual.
3. Usar hotspot si esta autorizado.

Recuperacion:

1. Restaurar internet.
2. Consultar caja.
3. Revisar operaciones pendientes.
4. Cargar manualmente operaciones realizadas fuera del sistema solo cuando exista proceso definido.

Tiempo objetivo: 5 a 30 min.

## Contactos de escalamiento

| Situacion | Responsable |
|---|---|
| Error tecnico | Responsable tecnico |
| Diferencia de caja | Encargado |
| Anulacion | Encargado |
| Vuelta atras | Responsable de negocio |
| Airtable/n8n | Responsable tecnico |

## Registro manual minimo

Si se vuelve atras, registrar:

- hora;
- producto;
- cantidad;
- importe;
- forma de pago;
- cajero;
- motivo;
- observaciones.

No cargar operaciones manuales al sistema sin conciliacion.

