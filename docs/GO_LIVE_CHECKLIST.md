# Go Live Checklist

Mision 009: checklist completo antes del primer dia piloto.

No declarar el sistema listo si algun punto critico esta pendiente.

## Servidor y frontend

- [ ] URL publica de GitHub Pages confirmada.
- [ ] `js/config.js` apunta a `https://gweinstein26.app.n8n.cloud/webhook`.
- [ ] `USE_LOCAL_FALLBACK = false`.
- [ ] App carga desde navegador del comercio.
- [ ] App carga en modo incognito.
- [ ] No hay errores visibles en consola al abrir.
- [ ] Router carga POS, Apertura, Caja, Movimientos, Historial y Cierre.
- [ ] No hay credenciales en el repositorio.

## n8n

- [ ] Cuenta n8n activa.
- [ ] Ejecuciones mensuales disponibles.
- [ ] Workflows importados.
- [ ] Workflows activados.
- [ ] Credencial Airtable configurada en todos los nodos.
- [ ] CORS verificado en respuestas.
- [ ] `GET /productos` probado.
- [ ] `GET /producto` probado.
- [ ] `GET /clientes` probado.
- [ ] `POST /caja/abrir` probado.
- [ ] `POST /caja/estado` probado.
- [ ] `POST /caja/movimiento` probado.
- [ ] `POST /venta` probado.
- [ ] `POST /ventas/historial` probado.
- [ ] `POST /venta/detalle` probado.
- [ ] `POST /venta/anular` probado.
- [ ] `POST /caja/cerrar` probado.
- [ ] Fallas devuelven `{ ok: false }` o error visible.

## Airtable

- [ ] Base ID confirmada.
- [ ] Tabla PRODUCCION existe.
- [ ] Tabla CLIENTES existe.
- [ ] Tabla VENTAS existe.
- [ ] Tabla DETALLE_VENTA existe.
- [ ] Tabla MOVIMIENTOS_STOCK existe.
- [ ] Tabla CAJAS existe.
- [ ] Tabla SESIONES_CAJA existe.
- [ ] Tabla MOVIMIENTOS_CAJA existe.
- [ ] Campos reales de PRODUCCION confirmados.
- [ ] Campos de VENTAS confirmados.
- [ ] Campos de DETALLE_VENTA confirmados.
- [ ] Campos de MOVIMIENTOS_STOCK confirmados.
- [ ] Campos de SESIONES_CAJA confirmados.
- [ ] Campos de MOVIMIENTOS_CAJA confirmados.
- [ ] Vistas de control creadas para errores.
- [ ] Vistas de control creadas para rollback/anulacion pendiente.

## Backups

- [ ] Exportacion manual de Airtable antes del piloto.
- [ ] Copia de workflows n8n guardada.
- [ ] Copia del repositorio disponible.
- [ ] Procedimiento de vuelta atras definido.
- [ ] Registro manual paralelo preparado.
- [ ] Responsable de backups definido.

## Productos

- [ ] Productos piloto cargados.
- [ ] Codigos de barras revisados.
- [ ] Precios revisados.
- [ ] Stock inicial revisado.
- [ ] Productos sin stock no aparecen en busqueda.
- [ ] Producto de prueba definido.
- [ ] Stock de prueba suficiente.

## Usuarios

- [ ] Cajero piloto definido.
- [ ] Encargado definido.
- [ ] Responsable tecnico definido.
- [ ] usuario_id acordado para pruebas.
- [ ] Politica de anulacion definida.
- [ ] Politica ante diferencia de caja definida.

## Caja

- [ ] Caja principal definida.
- [ ] caja_id definido.
- [ ] Fondo inicial definido.
- [ ] Apertura probada.
- [ ] Movimiento ingreso probado.
- [ ] Movimiento egreso probado.
- [ ] Cierre probado.
- [ ] Cierre con diferencia probado.
- [ ] POS bloquea ventas sin caja abierta confirmada.

## Ventas

- [ ] Venta efectivo probada.
- [ ] Venta tarjeta probada.
- [ ] Venta transferencia probada.
- [ ] Stock insuficiente probado.
- [ ] Producto inexistente probado.
- [ ] Doble clic probado.
- [ ] Timeout probado o simulado.
- [ ] Idempotencia por `operationId` verificada.

## Historial y anulacion

- [ ] Historial server-side devuelve ventas.
- [ ] Filtro por fecha probado.
- [ ] Filtro por caja probado.
- [ ] Detalle de venta probado.
- [ ] Anulacion con motivo probada.
- [ ] Anulacion doble envio probada.
- [ ] Venta anulada no puede anularse otra vez.
- [ ] Movimientos inversos verificados.

## Impresora

- [ ] Impresora fisica definida.
- [ ] Navegador puede imprimir.
- [ ] Reimpresion preliminar probada.
- [ ] Plan manual si impresora falla.
- [ ] Papel disponible.
- [ ] Cajero sabe operar impresion del navegador.

## Internet

- [ ] Conexion principal estable.
- [ ] Red Wi-Fi probada.
- [ ] Plan de hotspot definido.
- [ ] Procedimiento ante corte de internet definido.
- [ ] No se habilita venta offline.

## Recovery

- [ ] Runbook impreso o accesible.
- [ ] Responsable tecnico disponible durante piloto.
- [ ] Procedimiento para `Servidor no disponible`.
- [ ] Procedimiento para `RollbackPendiente`.
- [ ] Procedimiento para `ANULACION_PENDIENTE`.
- [ ] Procedimiento para venta duplicada.
- [ ] Procedimiento para stock inconsistente.
- [ ] Procedimiento para caja no cierra.
- [ ] Procedimiento para operacion desconocida.

## Go / No-Go

Go si:

- [ ] Todos los puntos criticos estan completos.
- [ ] Primera venta real controlada fue exitosa.
- [ ] Caja abre y cierra contra backend.
- [ ] Historial server-side funciona.
- [ ] Hay plan de vuelta atras.

No-Go si:

- [ ] n8n no tiene ejecuciones.
- [ ] Airtable no tiene tablas/campos completos.
- [ ] Venta no crea detalle/stock/caja.
- [ ] No se puede cerrar caja.
- [ ] No hay responsable tecnico disponible.

