# HARDENING REPORT V1

Proyecto: CASERITAS OS  
Mision: 006 - Hardening V1  
Alcance: auditoria completa del repositorio para instalacion en comercio real  
Estado: no se implementan correcciones en esta mision

## Resumen ejecutivo

CASERITAS OS ya tiene una base funcional importante: POS, carrito, busqueda contra API, pantallas operativas, estado global, documentacion de arquitectura y workflows preparatorios para n8n/Airtable.

El sistema todavia no debe considerarse listo para operar un comercio real porque la venta, caja, historial y anulaciones dependen de piezas backend que no estan completamente verificadas de extremo a extremo. La mayor debilidad actual es que varias operaciones criticas se registran localmente en el navegador y no como fuente de verdad transaccional.

Puntaje general estimado: 56/100.

## Hallazgos criticos

| ID | Area | Hallazgo | Riesgo | Recomendacion |
| --- | --- | --- | --- | --- |
| CR-001 | Motor de ventas | El flujo POST /venta no esta validado end-to-end contra Airtable real con venta, detalle, stock y caja. | Una venta podria quedar parcial, duplicada o sin descontar stock. | Validar el workflow completo con datos reales antes de habilitar cobros. |
| CR-002 | Workflows | El rollback compensatorio de venta esta disenado, pero no probado como transaccion real. | Si falla una escritura intermedia, pueden quedar registros inconsistentes. | Probar fallas forzadas por etapa y registrar rollback efectivo o pendiente operativo. |
| CR-003 | Airtable | Las tablas transaccionales definitivas no estan confirmadas como existentes y alineadas: VENTAS, DETALLE_VENTA, MOVIMIENTOS_STOCK, CAJA, MOVIMIENTOS_CAJA. | El workflow de venta puede fallar aunque productos funcione. | Crear/verificar tablas, campos obligatorios, tipos, enlaces y vistas antes de operar. |
| CR-004 | Caja | Apertura, movimientos y cierre de caja se manejan localmente en el navegador. | Un cierre podria no coincidir con ventas reales o perderse ante otro equipo/navegador. | Mover caja a backend antes de operar un dia completo. |
| CR-005 | Anulaciones | La anulacion de venta esta deshabilitada y no existe flujo transaccional real. | Un error de cobro no puede revertirse correctamente. | Implementar anulacion con movimientos inversos de caja y stock. |

## Hallazgos altos

| ID | Area | Hallazgo | Riesgo | Recomendacion |
| --- | --- | --- | --- | --- |
| AL-001 | OperationId | El operationId se genera al cobrar y puede cambiar en un reintento si el resultado del servidor fue incierto. | Una venta podria duplicarse si el primer intento llego al backend pero la respuesta no volvio. | Mantener el mismo operationId hasta confirmar exito, anulacion o descarte manual. |
| AL-002 | Persistencia local | localStorage guarda caja, ventas y movimientos como estado operativo. | Puede quedar viejo, corrupto o inconsistente entre jornadas. | Versionar el esquema local y usarlo solo como cache/estado de UI, no como fuente contable. |
| AL-003 | Historial | Historial del Dia usa ventas locales persistidas, sin filtro fuerte por caja, fecha o servidor. | Puede mostrar ventas de otra jornada o no mostrar ventas reales hechas desde otro dispositivo. | Consultar historial desde backend por empresa_id, caja_id y fecha. |
| AL-004 | Usuarios | El cajero se registra como texto local sin autenticacion ni usuario_id confiable. | No hay trazabilidad real de operaciones sensibles. | Definir seleccion/autenticacion de usuario antes de caja real. |
| AL-005 | Doble cobro | El boton de cobrar se deshabilita durante la operacion, pero no hay bloqueo transaccional robusto en el cliente. | Un doble clic o evento duplicado podria intentar dos cobros. | Agregar bandera in-flight, operationId estable y bloqueo visual hasta resultado final. |
| AL-006 | Recarga | Si se recarga la pagina durante una venta en curso, el carrito se pierde y el estado de la operacion queda incierto. | Perdida de datos de venta o reintentos incorrectos. | Persistir borrador de venta o bloquear recarga durante cobro. |
| AL-007 | Stock | El carrito permite agregar cantidades por encima del stock mostrado. | El usuario llega tarde al error y puede perder tiempo en caja. | Mantener validacion backend obligatoria y agregar advertencia preventiva en UI. |
| AL-008 | Productos | La busqueda cachea consultas identicas y podria conservar stock viejo tras una venta. | El POS puede mostrar stock disponible que ya cambio. | Invalidar cache de productos luego de ventas o movimientos de stock. |
| AL-009 | Formas de pago | La caja local no esta totalmente separada por efectivo, tarjeta y otros medios con cierre server-side. | Diferencias de caja y conciliacion incompleta. | Registrar movimientos de caja por forma de pago desde backend. |
| AL-010 | Alta rapida | La UI todavia sugiere agregar productos temporalmente, pero la API no permite alta rapida. | Confusion operativa en mostrador. | Ocultar o redefinir el flujo hasta implementar productos reales. |

## Hallazgos medios

| ID | Area | Hallazgo | Riesgo | Recomendacion |
| --- | --- | --- | --- | --- |
| ME-001 | Router | Si una vista falla al renderizar o inicializar, no hay pantalla de recuperacion. | La aplicacion puede quedar en blanco. | Agregar boundary de error por vista. |
| ME-002 | Rutas | Una ruta inexistente cae al POS, pero la URL queda con hash invalido. | Confusion de navegacion y estado activo incorrecto. | Normalizar el hash al redirigir. |
| ME-003 | Estado servidor | El estado del servidor se infiere por operaciones, no por healthcheck. | Puede mostrarse online sin verificacion reciente. | Agregar endpoint de salud o verificacion liviana controlada. |
| ME-004 | Reimpresion | Reimprimir ejecuta impresion de la pantalla completa. | No genera comprobante profesional ni reproducible. | Crear comprobante dedicado por venta. |
| ME-005 | Movimientos caja | Ingresos y egresos manuales son locales y no registran usuario_id/operationId/caja_id real. | Auditoria debil y duplicaciones posibles. | Crear endpoint de movimientos con idempotencia. |
| ME-006 | Cierre caja | El cierre se calcula desde estado local, no desde ventas y movimientos confirmados por backend. | Cierre esperado incorrecto. | Calcular total esperado en backend. |
| ME-007 | API | Existen funciones preparadas para caja/historial que aun no son usadas por las pantallas. | Diferencia entre arquitectura planificada y operacion real. | Conectar pantallas cuando n8n este disponible. |
| ME-008 | Duplicacion API | Hay wrappers en espanol e ingles para algunas funciones. | Puede aumentar mantenimiento si crecen sin control. | Mantener compatibilidad temporal y consolidar nombres por estandar. |
| ME-009 | Validacion localStorage | No hay migraciones ni limpieza por version de estado. | Un estado antiguo puede romper pantallas nuevas. | Agregar version, migracion y boton de recuperacion operativa. |
| ME-010 | Documentacion | Hay mucha documentacion util, pero falta un indice operativo unico desde README. | Dificulta onboarding de nuevos desarrolladores. | Agregar indice de documentos y flujo recomendado de lectura. |
| ME-011 | Workflows | Los workflows dependen de nombres/campos especificos de Airtable. | Cambios de Airtable rompen produccion silenciosamente. | Documentar contrato de campos y crear pruebas de smoke. |
| ME-012 | Rendimiento | La busqueda de productos esta protegida con debounce/minimo de caracteres, pero los historiales futuros podrian consumir muchas ejecuciones n8n. | Agotamiento de ejecuciones mensuales. | Paginacion, filtros server-side y cache controlado. |

## Hallazgos bajos

| ID | Area | Hallazgo | Riesgo | Recomendacion |
| --- | --- | --- | --- | --- |
| BA-001 | Textos | Persisten textos que hablan de datos locales/catalogo local aunque el objetivo es n8n. | Confusion para usuarios y pruebas. | Ajustar copy en una tarea futura sin cambiar layout. |
| BA-002 | Vistas futuras | Clientes, productos, produccion, reportes y configuracion son aun pantallas placeholder o parciales. | Expectativa mayor que funcionalidad real. | Marcar estado de modulo o limitar acceso operativo. |
| BA-003 | Codigo muerto | Hay utilidades o metodos que no parecen utilizados actualmente. | Ruido de mantenimiento. | Revisar con busqueda estatica antes de limpiar. |
| BA-004 | Encoding | Algunos textos pueden mostrar caracteres mal codificados segun archivo/navegador. | Mala percepcion visual. | Normalizar archivos a UTF-8 en una tarea controlada. |
| BA-005 | Tests | No hay suite automatizada de sintaxis, rutas, API mocks o flujos POS. | Regresiones faciles al crecer el sistema. | Agregar pruebas livianas sin dependencias externas complejas. |

## Revision por area

### Estado global

El estado global cubre empresa, usuario, caja, servidor, modo offline, operationId, ventas del dia y movimientos de caja. Es una buena base para coordinar pantallas, pero actualmente mezcla estado de interfaz con datos operativos que deberian vivir en backend.

Riesgos principales:

- localStorage puede quedar viejo, corrupto o de otra jornada.
- No hay versionado de esquema.
- No hay validacion fuerte de caja abierta contra backend.
- No hay reconciliacion si el servidor confirma algo que el navegador no registro.

### Router

El router permite navegar entre pantallas y carga vistas dinamicamente. Es simple y suficiente para la etapa actual.

Riesgos principales:

- No hay manejo visible de errores de renderizado.
- No hay guardas globales para caja abierta/cerrada.
- Rutas invalidas no normalizan la URL.

### POS

El POS conserva el carrito y prepara la venta para `createSale()`. Tiene debounce y minimo de caracteres para proteger ejecuciones n8n.

Riesgos principales:

- El carrito se pierde al recargar.
- El operationId no queda protegido ante estado incierto.
- El frontend envia precios/totales que el backend no debe confiar.
- El alta rapida aparece como posibilidad visual aunque no esta operativa.
- No se previene totalmente superar stock desde la experiencia.

### Caja

Apertura, movimientos y cierre existen como flujo visual y estado local. Esto sirve para preparar al equipo y validar UX operativa, pero no para contabilidad real.

Riesgos principales:

- No hay caja_id confirmada por backend.
- No hay apertura/cierre atomicos.
- No hay usuario_id confiable.
- No hay conciliacion real por forma de pago.

### Motor de ventas

El diseno apunta correctamente a idempotencia, detalle de venta, movimientos de stock y caja. La pieza critica es verificar que n8n ejecute todo como una unidad compensable.

Riesgos principales:

- Airtable no ofrece transacciones reales.
- El rollback compensatorio debe estar probado por etapa.
- Los errores parciales deben dejar un estado operativo claro.

### Historial

El historial local permite revisar ventas de la sesion, buscar, reimprimir y ver anulacion deshabilitada.

Riesgos principales:

- No es historial real del servidor.
- No filtra con garantia por dia/caja/empresa.
- Reimprimir no genera comprobante especifico.
- Anular no esta implementado.

### Persistencia local

localStorage ayuda a no perder contexto de caja durante recargas, pero no debe actuar como registro contable.

Riesgos principales:

- Datos de una jornada pueden aparecer en otra.
- No hay limpieza segura ni migraciones.
- Diferentes navegadores/dispositivos no comparten estado.

### API

La separacion `config.js` y `api.js` esta alineada con la arquitectura. El frontend no accede directo a Airtable y el uso de fetch esta concentrado.

Riesgos principales:

- Algunos endpoints estan preparados pero no conectados a pantallas.
- Falta healthcheck.
- Falta contrato formal de error por endpoint.

### Workflows

Los workflows son importables y separan n8n de frontend. Productos esta alineado con la tabla PRODUCCION real.

Riesgos principales:

- Venta requiere prueba real completa.
- Tablas transaccionales deben existir y coincidir.
- Rollback no puede quedar solo como intencion documental.
- CORS y respuestas deben verificarse en modo produccion, no solo test.

### Documentacion

La documentacion del proyecto es amplia y adecuada para orientar crecimiento.

Riesgos principales:

- Falta una guia unica de lectura para nuevos colaboradores.
- Algunas decisiones deben actualizarse cuando venta/caja pasen de local a backend.

## Estados imposibles o peligrosos detectados

- Caja abierta en localStorage sin usuario valido.
- Caja marcada abierta localmente aunque el backend no tenga apertura.
- Venta confirmada en backend pero no agregada al historial local por perdida de respuesta.
- Venta fallida en frontend pero parcialmente escrita en Airtable.
- Movimiento de caja local sin caja_id real.
- Historial del dia mostrando registros de otra jornada local.
- Producto mostrado con stock viejo despues de una venta.

## Botones o acciones incompletas

- Anular venta: visible pero deshabilitado.
- Reimprimir: imprime pantalla general, no comprobante.
- Agregar producto temporal: experiencia sugerida, pero alta rapida real no disponible.
- Pantallas futuras de modulos: placeholders o funcionalidad parcial.

## Posibles perdidas de datos

- Recargar durante una venta en curso.
- Cerrar navegador antes de recibir respuesta de venta.
- Limpiar localStorage sin respaldo de caja local.
- Operar desde dos dispositivos con estados locales distintos.
- Error parcial en n8n sin rollback efectivo.

## Race conditions principales

- Doble clic o doble envio de cobrar.
- Reintento de venta con operationId nuevo despues de timeout.
- Dos cajas/dispositivos vendiendo el mismo producto con stock bajo.
- Dos movimientos manuales enviados rapidamente sin idempotencia.
- Cierre de caja mientras una venta esta pendiente.

## Que bloquea una primera venta real

1. Confirmar que n8n tenga ejecuciones disponibles.
2. Importar y probar POST /venta en modo produccion.
3. Verificar tablas y campos transaccionales en Airtable.
4. Probar stock suficiente, stock insuficiente, producto inexistente y total inconsistente.
5. Probar idempotencia con el mismo operationId.
6. Probar rollback por falla en cada etapa.
7. Confirmar que el frontend recibe `{ ok, ventaId, operationId, total }`.

## Que impide operar un dia completo

1. Apertura de caja sin backend.
2. Cierre de caja sin backend.
3. Movimientos manuales locales.
4. Historial no server-side.
5. Anulaciones no implementadas.
6. Usuario/cajero sin autenticacion ni permisos.
7. Falta de comprobante de venta.
8. Falta de conciliacion real por forma de pago.

## Recomendaciones prioritarias

1. Endurecer POST /venta antes de tocar nuevas pantallas.
2. Implementar caja real: apertura, movimiento, cierre y resumen.
3. Hacer que OperationId sobreviva a timeouts hasta resolucion.
4. Crear historial real por empresa, caja y fecha.
5. Implementar anulacion con movimientos inversos.
6. Reducir el rol contable de localStorage a cache y recuperacion de UI.
7. Agregar pruebas manuales y smoke tests para workflows.

