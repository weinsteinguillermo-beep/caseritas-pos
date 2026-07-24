# Test Scenarios

Mision 007: escenarios completos para certificacion manual y end-to-end.

Cada escenario debe ejecutarse en ambiente controlado, con productos de prueba y registros revisados en Airtable despues de cada corrida.

## Caso 001 - Jornada feliz completa

Prioridad: Critica

Objetivo: validar apertura, venta, movimiento manual y cierre.

Precondiciones:

- n8n con ejecuciones disponibles.
- Workflows activos.
- Tablas Airtable creadas.
- Producto con stock suficiente.

Pasos:

1. Abrir la aplicacion.
2. Ir a Apertura.
3. Ingresar cajero, caja y fondo inicial.
4. Confirmar apertura.
5. Ir al POS.
6. Buscar producto real.
7. Agregar una unidad.
8. Seleccionar efectivo.
9. Cobrar.
10. Ir a Movimientos.
11. Registrar ingreso manual.
12. Registrar egreso manual.
13. Ir a Cierre.
14. Ingresar total contado.
15. Cerrar caja.

Resultado esperado:

- `SESIONES_CAJA` queda `CERRADA`.
- Existe una venta confirmada.
- Existe detalle de venta.
- Existe movimiento de stock negativo.
- Existe movimiento de caja por venta.
- Existen movimientos manuales.
- Total esperado y diferencia se calculan desde backend.

## Caso 002 - Servidor cae luego de descontar stock

Prioridad: Critica

Objetivo: validar rollback de venta despues de modificar stock.

Precondiciones:

- Producto con stock suficiente.
- Caja abierta confirmada.
- Workflow de venta preparado para falla forzada despues de `Actualizar Stock Produccion`.

Pasos:

1. Ejecutar venta.
2. Forzar error luego de actualizar stock.
3. Esperar respuesta de n8n.
4. Revisar Airtable.

Resultado esperado:

- Frontend no muestra venta confirmada.
- Venta queda `RollbackPendiente` o estado equivalente.
- Stock se restaura o queda claramente pendiente de restauracion.
- No queda movimiento de caja confirmado sin venta confirmada.

## Caso 003 - Timeout del navegador durante venta

Prioridad: Critica

Objetivo: evitar venta duplicada cuando el navegador no recibe respuesta.

Precondiciones:

- Caja abierta confirmada.
- Producto con stock suficiente.
- Simular timeout o demora mayor al tiempo esperado.

Pasos:

1. Preparar venta.
2. Presionar Cobrar.
3. Interrumpir respuesta o simular timeout.
4. Verificar que la UI informa estado incierto.
5. Reintentar sin limpiar estado.

Resultado esperado:

- Se conserva el mismo `operationId`.
- No se crea segunda venta.
- Si la primera fue confirmada, n8n devuelve la venta existente.

## Caso 004 - Recarga de pagina durante cobro

Prioridad: Critica

Objetivo: validar recuperacion de operacion pendiente.

Precondiciones:

- Caja abierta confirmada.
- Venta en curso.

Pasos:

1. Presionar Cobrar.
2. Recargar navegador antes de recibir respuesta.
3. Volver al POS.
4. Consultar estado de caja.
5. Reintentar venta solo si corresponde.

Resultado esperado:

- La caja se reconcilia con backend.
- La operacion pendiente conserva `operationId` si quedo guardada.
- No se asume exito sin respuesta.

## Caso 005 - Abrir caja y perder conexion

Prioridad: Critica

Objetivo: evitar doble apertura ante estado desconocido.

Precondiciones:

- No hay caja abierta.
- n8n responde lento o se corta conexion.

Pasos:

1. Enviar apertura de caja.
2. Cortar conexion antes de respuesta.
3. Recargar aplicacion.
4. Restaurar conexion.
5. Consultar estado de caja.

Resultado esperado:

- La apertura queda pendiente/desconocida.
- La app no crea automaticamente otra caja.
- Al volver conexion, `POST /caja/estado` confirma abierta o cerrada.

## Caso 006 - Segunda apertura misma caja

Prioridad: Critica

Objetivo: impedir dos cajas abiertas para mismo usuario/caja.

Precondiciones:

- Caja ya abierta en `SESIONES_CAJA`.

Pasos:

1. Intentar abrir nuevamente misma caja.
2. Repetir con nuevo `operationId`.

Resultado esperado:

- Backend rechaza con mensaje amigable.
- No se crea una segunda `SESIONES_CAJA`.

## Caso 007 - Apertura idempotente

Prioridad: Critica

Objetivo: confirmar que repetir operationId no duplica caja.

Precondiciones:

- Primera apertura enviada.

Pasos:

1. Repetir `POST /caja/abrir` con mismo `operationId`.
2. Revisar Airtable.

Resultado esperado:

- Devuelve el mismo `cajaSesionId`.
- Solo existe una sesion.

## Caso 008 - Movimiento manual ingreso

Prioridad: Alta

Objetivo: registrar ingreso manual con trazabilidad.

Precondiciones:

- Caja abierta confirmada.

Pasos:

1. Ir a Movimientos.
2. Seleccionar Ingreso.
3. Ingresar motivo e importe.
4. Confirmar.

Resultado esperado:

- Se crea `MOVIMIENTOS_CAJA` con `tipo = INGRESO`.
- Tiene `operation_id`, `usuario_id`, `caja_sesion_id`.

## Caso 009 - Movimiento manual egreso

Prioridad: Alta

Objetivo: registrar egreso manual.

Precondiciones:

- Caja abierta confirmada.

Pasos:

1. Ir a Movimientos.
2. Seleccionar Egreso.
3. Ingresar motivo e importe.
4. Confirmar.

Resultado esperado:

- Se crea `MOVIMIENTOS_CAJA` con `tipo = EGRESO`.
- El cierre descuenta ese importe.

## Caso 010 - Movimiento doble envio

Prioridad: Alta

Objetivo: evitar duplicacion de ingresos/egresos.

Precondiciones:

- Caja abierta confirmada.

Pasos:

1. Enviar movimiento.
2. Repetir con mismo `operationId`.

Resultado esperado:

- Solo existe un movimiento.
- n8n devuelve el movimiento existente o exito idempotente.

## Caso 011 - Cierre caja sin diferencia

Prioridad: Critica

Objetivo: cerrar caja con totales exactos.

Precondiciones:

- Caja abierta con movimientos.

Pasos:

1. Consultar total esperado.
2. Ingresar el mismo monto como contado.
3. Confirmar cierre.

Resultado esperado:

- Caja queda `CERRADA`.
- `diferencia = 0`.
- POS bloquea ventas.

## Caso 012 - Cierre caja con diferencia

Prioridad: Critica

Objetivo: registrar diferencia de caja.

Precondiciones:

- Caja abierta con movimientos.

Pasos:

1. Ingresar total contado distinto al esperado.
2. Agregar observacion.
3. Confirmar cierre.

Resultado esperado:

- Caja queda cerrada.
- Diferencia calculada por backend.
- Observacion persistida.

## Caso 013 - Cierre de caja ya cerrada

Prioridad: Critica

Objetivo: impedir doble cierre.

Precondiciones:

- Caja cerrada.

Pasos:

1. Reenviar cierre con nuevo operationId.

Resultado esperado:

- Backend rechaza.
- No altera totales.

## Caso 014 - Cierre idempotente

Prioridad: Alta

Objetivo: repetir cierre con mismo operationId.

Precondiciones:

- Cierre previo exitoso.

Pasos:

1. Reenviar `POST /caja/cerrar` con mismo `operationId`.

Resultado esperado:

- Devuelve mismo cierre.
- No recalcula ni duplica.

## Caso 015 - Venta sin caja backend confirmada

Prioridad: Critica

Objetivo: bloquear venta si localStorage dice abierta pero servidor no confirma.

Precondiciones:

- localStorage con caja abierta.
- `POST /caja/estado` devuelve abierta false.

Pasos:

1. Abrir POS.
2. Agregar producto.
3. Intentar cobrar.

Resultado esperado:

- POS bloquea cobro.
- Muestra mensaje de caja no confirmada.

## Caso 016 - Producto sin stock durante venta

Prioridad: Critica

Objetivo: validar stock al momento de cobrar.

Precondiciones:

- Producto aparece en frontend.
- Stock cambia a cero antes de cobrar.

Pasos:

1. Agregar producto.
2. Modificar stock en Airtable a cero.
3. Cobrar.

Resultado esperado:

- Backend rechaza.
- No hay venta confirmada.
- Carrito no se limpia.

## Caso 017 - Total manipulado en DevTools

Prioridad: Critica

Objetivo: confirmar que frontend no es fuente de verdad.

Precondiciones:

- Caja abierta.
- Producto con precio real.

Pasos:

1. Interceptar payload.
2. Cambiar total a menor valor.
3. Enviar venta.

Resultado esperado:

- n8n rechaza por total inconsistente.
- No modifica stock/caja.

## Caso 018 - Producto inexistente por codigo

Prioridad: Alta

Objetivo: manejar busqueda sin coincidencias.

Precondiciones:

- Codigo no existe.

Pasos:

1. Escanear codigo inexistente.
2. Intentar agregar.

Resultado esperado:

- Producto no encontrado.
- No se crea producto temporal en produccion.

## Caso 019 - n8n sin ejecuciones

Prioridad: Critica

Objetivo: validar comportamiento si n8n bloquea ejecuciones.

Precondiciones:

- n8n sin ejecuciones disponibles.

Pasos:

1. Buscar producto.
2. Abrir caja.
3. Cobrar.

Resultado esperado:

- Se muestra `Servidor no disponible` o mensaje equivalente.
- Ninguna operacion sensible se marca como confirmada.

## Caso 020 - Airtable lento

Prioridad: Alta

Objetivo: tolerar latencia sin duplicar operaciones.

Precondiciones:

- Simular demora en Airtable.

Pasos:

1. Abrir caja o cobrar.
2. Esperar con UI bloqueada.
3. Intentar doble clic.

Resultado esperado:

- Boton queda bloqueado.
- Solo se envia una operacion.

## Caso 021 - Airtable devuelve error de campo

Prioridad: Critica

Objetivo: detectar campos mal configurados.

Precondiciones:

- Renombrar temporalmente un campo en base de prueba.

Pasos:

1. Ejecutar workflow afectado.
2. Observar respuesta.

Resultado esperado:

- Workflow no devuelve falso exito.
- Frontend muestra error amigable.

## Caso 022 - CORS desde GitHub Pages

Prioridad: Critica

Objetivo: validar acceso desde URL publica.

Precondiciones:

- App publicada en GitHub Pages.
- Workflows activos.

Pasos:

1. Abrir app publicada.
2. Buscar producto.
3. Abrir caja.

Resultado esperado:

- No hay bloqueo CORS.
- Respuestas JSON llegan al frontend.

## Caso 023 - Historial local despues de venta

Prioridad: Alta

Objetivo: verificar que una venta exitosa queda visible localmente.

Precondiciones:

- Venta confirmada.

Pasos:

1. Ir a Historial.
2. Buscar por cliente/producto.

Resultado esperado:

- Venta visible una sola vez.

## Caso 024 - Venta fallida no aparece como confirmada

Prioridad: Critica

Objetivo: evitar falsa contabilidad local.

Precondiciones:

- Backend rechaza venta.

Pasos:

1. Ejecutar venta invalida.
2. Ir a Historial.

Resultado esperado:

- No aparece como venta confirmada.

## Caso 025 - Reconciliacion backend cerrado/local abierto

Prioridad: Critica

Objetivo: priorizar servidor.

Precondiciones:

- localStorage caja abierta.
- Backend no tiene caja abierta.

Pasos:

1. Cargar app.
2. Esperar consulta `/caja/estado`.

Resultado esperado:

- Estado local pasa a cerrado o no confirmado.
- POS bloquea venta.

## Caso 026 - Reconciliacion backend abierto/local cerrado

Prioridad: Critica

Objetivo: recuperar caja real.

Precondiciones:

- Backend tiene caja abierta.
- localStorage no la tiene o esta cerrado.

Pasos:

1. Cargar app con usuario/caja conocidos.
2. Consultar caja.

Resultado esperado:

- App recupera `cajaSesionId`.
- POS permite venta.

## Caso 027 - localStorage corrupto

Prioridad: Alta

Objetivo: evitar pantalla rota.

Precondiciones:

- localStorage con JSON invalido.

Pasos:

1. Cargar app.

Resultado esperado:

- App inicia con estado default.
- No crashea.

## Caso 028 - Router ruta inexistente

Prioridad: Media

Objetivo: validar recuperacion de navegacion.

Precondiciones:

- URL con hash invalido.

Pasos:

1. Abrir `#ruta-inexistente`.

Resultado esperado:

- App muestra ruta default.

## Caso 029 - Cliente opcional

Prioridad: Media

Objetivo: validar venta consumidor final.

Precondiciones:

- Caja abierta.

Pasos:

1. Dejar cliente vacio.
2. Cobrar venta.

Resultado esperado:

- Venta se registra como consumidor final o cliente nulo aceptado.

## Caso 030 - Anulacion no disponible

Prioridad: Alta

Objetivo: evitar anulaciones falsas.

Precondiciones:

- Venta visible en historial.

Pasos:

1. Intentar usar boton Anular.

Resultado esperado:

- Accion sigue deshabilitada hasta implementar anulacion real.

## Caso 031 - Venta tarjeta en cierre de caja

Prioridad: Alta

Objetivo: validar tratamiento de metodos de pago.

Precondiciones:

- Caja abierta.

Pasos:

1. Hacer venta con tarjeta.
2. Cerrar caja.

Resultado esperado:

- Movimiento queda trazado.
- Politica de total esperado debe quedar verificada en backend.

## Caso 032 - Movimiento caja sobre sesion cerrada

Prioridad: Critica

Objetivo: impedir modificar caja cerrada.

Precondiciones:

- Caja cerrada.

Pasos:

1. Enviar `POST /caja/movimiento` con `cajaSesionId` cerrado.

Resultado esperado:

- Backend rechaza.
- No crea movimiento.

## Caso 033 - Venta luego de cierre

Prioridad: Critica

Objetivo: bloquear ventas fuera de jornada.

Precondiciones:

- Caja cerrada.

Pasos:

1. Ir al POS.
2. Agregar producto.
3. Intentar cobrar.

Resultado esperado:

- POS bloquea.
- No llama `POST /venta`.

## Caso 034 - Respuesta duplicada de n8n

Prioridad: Alta

Objetivo: evitar duplicar estado local.

Precondiciones:

- Misma respuesta procesada dos veces.

Pasos:

1. Simular dos respuestas con mismo operationId.

Resultado esperado:

- Historial local queda con una venta.
- Movimiento local no se duplica.

## Caso 035 - Comprobacion de credenciales ausentes

Prioridad: Critica

Objetivo: detectar workflow importado sin credencial Airtable.

Precondiciones:

- Workflow sin credencial.

Pasos:

1. Ejecutar endpoint.

Resultado esperado:

- Error claro.
- No hay registros parciales confirmados.

## Caso 036 - Publicacion con fallback desactivado

Prioridad: Alta

Objetivo: evitar datos simulados en produccion.

Precondiciones:

- `USE_LOCAL_FALLBACK = false`.

Pasos:

1. Publicar app.
2. Desactivar n8n.
3. Buscar producto.

Resultado esperado:

- No aparecen productos locales.
- Muestra error de servidor.

## Caso 037 - Escaneo rapido repetido

Prioridad: Media

Objetivo: validar ergonomia de POS.

Precondiciones:

- Producto real con codigo.

Pasos:

1. Escanear mismo codigo dos veces.

Resultado esperado:

- Producto se agrega con cantidad 2.
- No genera busquedas innecesarias excesivas.

## Caso 038 - Caja abierta en otro navegador

Prioridad: Alta

Objetivo: validar consistencia multi-navegador basica.

Precondiciones:

- Caja abierta desde navegador A.

Pasos:

1. Abrir navegador B con mismo usuario/caja.
2. Consultar estado.

Resultado esperado:

- Recupera sesion abierta.
- No abre otra caja.

## Caso 039 - Cierre desde otro navegador

Prioridad: Alta

Objetivo: validar reconciliacion despues de cierre externo.

Precondiciones:

- Caja abierta en dos navegadores.

Pasos:

1. Cerrar caja desde navegador A.
2. Intentar vender desde navegador B luego de reconciliar.

Resultado esperado:

- Navegador B bloquea venta.

## Caso 040 - Revision post-jornada

Prioridad: Alta

Objetivo: verificar consistencia contable final.

Precondiciones:

- Jornada con ventas, ingreso, egreso y cierre.

Pasos:

1. Revisar Airtable.
2. Sumar movimientos.
3. Comparar con cierre.

Resultado esperado:

- `total_esperado = fondo_inicial + ingresos - egresos`.
- Diferencia coincide con contado.

## Caso 041 - Historial server-side del dia

Prioridad: Critica

Objetivo: validar que el historial no depende de localStorage.

Precondiciones:

- Ventas confirmadas en Airtable.
- localStorage vacio o limpiado.

Pasos:

1. Abrir Historial del Dia.
2. Consultar servidor.
3. Filtrar por busqueda.

Resultado esperado:

- Las ventas aparecen desde backend.
- No hay duplicados.
- Las ventas anuladas se identifican por estado.

## Caso 042 - Detalle individual de venta

Prioridad: Alta

Objetivo: validar trazabilidad completa.

Precondiciones:

- Venta confirmada con detalle, stock y caja.

Pasos:

1. Abrir Historial.
2. Presionar Detalle.

Resultado esperado:

- Se muestra cabecera.
- Se recupera detalle.
- Se recuperan movimientos de stock y caja.

## Caso 043 - Anulacion completa de venta confirmada

Prioridad: Critica

Objetivo: certificar movimientos inversos.

Precondiciones:

- Caja abierta confirmada.
- Venta `CONFIRMADA`.

Pasos:

1. Abrir Historial.
2. Ver detalle.
3. Presionar Anular.
4. Ingresar motivo.
5. Confirmar.

Resultado esperado:

- Venta queda `ANULADA`.
- Stock se restaura.
- Se crea movimiento de stock `COMPENSATORIO`.
- Se crea movimiento de caja `COMPENSATORIO`.
- La venta original no se borra.

## Caso 044 - Anulacion doble envio

Prioridad: Critica

Objetivo: evitar doble restitucion.

Precondiciones:

- Venta confirmada.

Pasos:

1. Enviar anulacion.
2. Repetir con mismo `operationId`.

Resultado esperado:

- No duplica movimiento de stock.
- No duplica movimiento de caja.
- Devuelve estado existente.

## Caso 045 - Falla durante anulacion despues de marcar pendiente

Prioridad: Critica

Objetivo: evitar inconsistencias ocultas.

Precondiciones:

- Workflow modificado para fallar luego de `ANULACION_PENDIENTE`.

Pasos:

1. Enviar anulacion.
2. Forzar error.
3. Revisar venta.

Resultado esperado:

- Venta queda `ANULACION_PENDIENTE` o `ERROR_ANULACION`.
- No responde como exito.
- Reintento no duplica movimientos.
