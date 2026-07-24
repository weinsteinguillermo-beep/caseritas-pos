# Test Matrix

Mision 007: Laboratorio de certificacion.

Objetivo: ordenar todas las pruebas necesarias para certificar CASERITAS OS antes de operar en un comercio real.

Estados posibles:

- Pendiente
- Aprobada
- Fallida
- Bloqueada por n8n
- Bloqueada por Airtable
- No aplica todavia

Prioridades:

- Critica: bloquea venta real o cierre de jornada.
- Alta: afecta trazabilidad, dinero, stock o recuperacion.
- Media: afecta UX operativa o consistencia.
- Baja: mejora de control o mantenimiento.

## Resumen

| Modulo | Total | Criticas | Altas | Medias | Bajas |
|---|---:|---:|---:|---:|---:|
| Ventas | 18 | 10 | 6 | 2 | 0 |
| Caja | 20 | 11 | 7 | 2 | 0 |
| Productos | 10 | 4 | 4 | 2 | 0 |
| Clientes | 5 | 0 | 2 | 3 | 0 |
| Historial | 8 | 2 | 4 | 2 | 0 |
| Offline | 8 | 4 | 3 | 1 | 0 |
| Recuperacion | 14 | 8 | 5 | 1 | 0 |
| API | 12 | 6 | 5 | 1 | 0 |
| Workflows n8n | 14 | 9 | 4 | 1 | 0 |
| Persistencia local | 8 | 4 | 3 | 1 | 0 |
| Router/UI operativa | 6 | 1 | 2 | 3 | 0 |
| Seguridad operativa | 7 | 2 | 4 | 1 | 0 |
| Historial y anulacion server-side | 20 | 15 | 5 | 0 | 0 |
| Total | 150 | 76 | 54 | 20 | 0 |

## Ventas

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| VEN-001 | Venta en efectivo con caja abierta confirmada | Critica | Caja abierta backend, producto con stock | Venta confirmada, detalle, stock y caja registrados |
| VEN-002 | Venta con tarjeta | Critica | Caja abierta backend | Venta confirmada sin vuelto |
| VEN-003 | Venta con transferencia | Alta | Caja abierta backend | Venta confirmada con metodo correcto |
| VEN-004 | Venta sin caja abierta | Critica | Caja cerrada | POS bloquea cobro |
| VEN-005 | Venta con caja local no confirmada | Critica | localStorage con caja abierta pendiente | POS bloquea cobro |
| VEN-006 | Stock insuficiente | Critica | Producto con stock menor a cantidad | Venta rechazada sin tocar stock/caja |
| VEN-007 | Producto inexistente | Critica | Producto no existe en Airtable | Venta rechazada |
| VEN-008 | Total alterado desde frontend | Critica | Payload manipulado | n8n recalcula y rechaza |
| VEN-009 | Precio viejo en frontend | Critica | Precio cambió en Airtable | n8n recalcula o rechaza diferencia |
| VEN-010 | Doble clic en cobrar | Critica | Carrito valido | Solo una venta por operationId |
| VEN-011 | Reintento con mismo operationId | Critica | Primer intento incierto | n8n devuelve venta existente o estado no duplicable |
| VEN-012 | Timeout luego de confirmar venta | Alta | n8n lento | Cliente no genera operationId nuevo |
| VEN-013 | Error antes de crear VENTAS | Alta | Falla forzada | No quedan registros |
| VEN-014 | Error luego de crear VENTAS | Alta | Falla forzada | Venta queda Error/RollbackPendiente |
| VEN-015 | Error luego de descontar stock | Critica | Falla forzada | Stock restaurado o RollbackPendiente claro |
| VEN-016 | Error luego de crear movimiento caja | Critica | Falla forzada | Caja anulada y venta marcada |
| VEN-017 | Carrito se limpia solo con exito | Alta | Error backend | Carrito permanece |
| VEN-018 | Venta con efectivo insuficiente | Media | Metodo cash | Frontend y backend rechazan |

## Caja

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| CAJ-001 | Abrir caja real | Critica | No hay caja abierta | SESIONES_CAJA abierta |
| CAJ-002 | Apertura idempotente | Critica | Mismo operationId | Devuelve misma sesion |
| CAJ-003 | Segunda apertura misma caja/usuario | Critica | Caja ya abierta | Rechazo amigable |
| CAJ-004 | Apertura sin usuario | Critica | usuarioId vacio | Rechazo |
| CAJ-005 | Apertura con fondo negativo | Alta | fondoInicial negativo | Rechazo |
| CAJ-006 | Consultar caja abierta | Critica | SESIONES_CAJA abierta | abierta true |
| CAJ-007 | Consultar sin caja abierta | Alta | Sin sesion abierta | abierta false |
| CAJ-008 | Reconciliar caja al cargar app | Critica | localStorage y backend difieren | Gana estado servidor |
| CAJ-009 | Movimiento ingreso manual | Critica | Caja abierta | MOVIMIENTOS_CAJA INGRESO |
| CAJ-010 | Movimiento egreso manual | Critica | Caja abierta | MOVIMIENTOS_CAJA EGRESO |
| CAJ-011 | Movimiento sin caja abierta | Critica | Caja cerrada | Rechazo |
| CAJ-012 | Movimiento importe cero | Alta | importe 0 | Rechazo |
| CAJ-013 | Movimiento doble envio | Alta | Mismo operationId | Un solo movimiento |
| CAJ-014 | Cierre sin diferencia | Critica | Caja abierta con movimientos | SESIONES_CAJA cerrada |
| CAJ-015 | Cierre con diferencia y observacion | Critica | Diferencia entre esperado y contado | Cierra con diferencia |
| CAJ-016 | Cierre caja ya cerrada | Critica | Caja cerrada | Rechazo/idempotencia si corresponde |
| CAJ-017 | Cierre caja inexistente | Alta | cajaSesionId invalido | Rechazo |
| CAJ-018 | Cierre caja de otro usuario | Alta | usuarioId distinto | Rechazo |
| CAJ-019 | Venta registra caja en MOVIMIENTOS_CAJA | Critica | Venta confirmada | Movimiento origen VENTA |
| CAJ-020 | Cierre calcula total desde backend | Critica | Movimientos reales | Total esperado no depende de localStorage |

## Productos

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| PRO-001 | Buscar por texto | Critica | n8n activo | Devuelve productos normalizados |
| PRO-002 | Buscar por codigo de barras | Critica | Codigo real | Devuelve producto unico |
| PRO-003 | Busqueda vacia | Alta | Texto vacio | No llama n8n |
| PRO-004 | Busqueda con un caracter | Alta | Texto menor a 2 | No llama n8n |
| PRO-005 | Debounce busqueda | Alta | Escritura rapida | Una llamada luego de 500 ms |
| PRO-006 | Consulta repetida identica | Alta | Mismo texto | No repite innecesariamente |
| PRO-007 | Producto sin stock | Critica | Stock Actual 0 | No aparece en busqueda |
| PRO-008 | Campo Codigo de Barras objeto/texto | Media | Airtable devuelve objeto | Barcode normalizado |
| PRO-009 | Precio usa Importe | Critica | Importe informado | price correcto |
| PRO-010 | Precio fallback Precio x Kg | Media | Importe vacio | Usa fallback |

## Clientes

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| CLI-001 | Buscar cliente por texto | Alta | Endpoint activo | Lista normalizada |
| CLI-002 | Cliente inexistente | Media | Sin coincidencias | Lista vacia |
| CLI-003 | n8n no responde | Alta | Endpoint caido | Mensaje amigable |
| CLI-004 | Venta consumidor final | Media | Sin cliente | Venta permitida |
| CLI-005 | Cliente escrito libremente | Media | Nombre manual | No rompe payload |

## Historial

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| HIS-001 | Venta confirmada aparece localmente | Alta | Venta exitosa | Historial muestra venta |
| HIS-002 | Venta fallida no aparece confirmada | Critica | Error backend | No se registra como exito |
| HIS-003 | Doble respuesta no duplica historial | Alta | Mismo operationId | Una fila |
| HIS-004 | Buscar venta local | Media | Varias ventas | Filtro funciona |
| HIS-005 | Reimprimir venta | Media | Venta local | Imprime pantalla actual |
| HIS-006 | Anular deshabilitado | Alta | Venta visible | No permite anulacion falsa |
| HIS-007 | Historial no server-side | Alta | Otro dispositivo vende | Riesgo identificado |
| HIS-008 | Recarga conserva ventas locales | Critica | localStorage intacto | Ventas locales persisten |

## Offline

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| OFF-001 | Abrir caja sin servidor | Critica | n8n caido | Operacion queda pendiente/desconocida |
| OFF-002 | Movimiento sin servidor | Critica | n8n caido | No se confirma localmente |
| OFF-003 | Cierre sin servidor | Critica | n8n caido | Cierre queda pendiente/desconocido |
| OFF-004 | Venta sin servidor | Critica | n8n caido | No se confirma, carrito no se limpia |
| OFF-005 | Busqueda producto sin servidor | Alta | n8n caido | Servidor no disponible |
| OFF-006 | Estado servidor vuelve online | Alta | n8n recuperado | Estado se actualiza |
| OFF-007 | USE_LOCAL_FALLBACK false | Alta | Produccion | No usa datos locales automaticamente |
| OFF-008 | USE_LOCAL_FALLBACK true | Media | Desarrollo | Solo productos locales de desarrollo |

## Recuperacion

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| REC-001 | Recarga durante caja abierta | Critica | Caja backend abierta | Se reconcilia con servidor |
| REC-002 | Recarga durante apertura pendiente | Critica | Timeout apertura | Consulta estado sin abrir otra |
| REC-003 | Recarga durante cobro pendiente | Critica | Venta enviada sin respuesta | Mantiene operationId |
| REC-004 | Reintento venta pendiente | Critica | operationId pendiente | No duplica venta |
| REC-005 | Cierre pendiente por timeout | Critica | n8n sin respuesta | No permite cierre repetido ciego |
| REC-006 | Movimiento pendiente por timeout | Alta | n8n sin respuesta | No se repite sin verificar |
| REC-007 | localStorage corrupto | Alta | JSON invalido | App vuelve a estado default |
| REC-008 | localStorage viejo sin campos nuevos | Alta | Estado pre Caja Real | App no rompe |
| REC-009 | Backend dice caja cerrada, local abierta | Critica | Divergencia | Gana backend |
| REC-010 | Backend dice caja abierta, local cerrada | Critica | Divergencia | Se restaura caja abierta |
| REC-011 | RollbackPendiente venta | Critica | Falla parcial | No se muestra exito operativo |
| REC-012 | Stock restaurado por rollback | Alta | Falla tras stock | Stock vuelve o queda pendiente |
| REC-013 | Movimiento caja anulado por rollback | Alta | Falla tras caja | Movimiento queda ANULADO |
| REC-014 | Navegador cerrado | Media | Sesion local perdida parcial | Backend permite recuperar estado caja |

## API

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| API-001 | API_BASE unica fuente | Alta | Revisar codigo | URLs desde config |
| API-002 | fetch solo en js/api.js | Alta | Revisar repo | No hay fetch fuera de api |
| API-003 | POST /venta ok false | Critica | n8n responde ok false | Frontend trata como error |
| API-004 | POST /caja/abrir ok false | Critica | n8n responde ok false | Frontend trata como error |
| API-005 | POST /caja/movimiento ok false | Critica | n8n responde ok false | Frontend trata como error |
| API-006 | POST /caja/cerrar ok false | Critica | n8n responde ok false | Frontend trata como error |
| API-007 | GET productos formato esperado | Critica | n8n activo | `{ productos: [] }` compatible |
| API-008 | GET producto formato esperado | Alta | n8n activo | `{ producto }` compatible |
| API-009 | GET clientes formato esperado | Media | n8n activo | `{ clientes: [] }` compatible |
| API-010 | Error TypeError | Critica | Red caida | Servidor no disponible |
| API-011 | Error HTTP con message | Alta | n8n error | Mensaje amigable |
| API-012 | CORS GitHub Pages | Critica | App publicada | Requests permitidas |

## Workflows n8n

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| N8N-001 | Importar productos.json | Alta | n8n disponible | Workflow importa |
| N8N-002 | Importar producto.json | Alta | n8n disponible | Workflow importa |
| N8N-003 | Importar clientes.json | Media | n8n disponible | Workflow importa |
| N8N-004 | Importar venta.json | Critica | n8n disponible | Workflow importa |
| N8N-005 | Importar caja-abrir.json | Critica | n8n disponible | Workflow importa |
| N8N-006 | Importar caja-estado.json | Critica | n8n disponible | Workflow importa |
| N8N-007 | Importar caja-movimiento.json | Critica | n8n disponible | Workflow importa |
| N8N-008 | Importar caja-cerrar.json | Critica | n8n disponible | Workflow importa |
| N8N-009 | Credencial Airtable faltante | Critica | Sin credencial | Error claro, no exito falso |
| N8N-010 | Campo Airtable renombrado | Critica | Campo incorrecto | Workflow falla controlado |
| N8N-011 | Tabla faltante | Critica | Tabla no existe | Workflow falla controlado |
| N8N-012 | CORS en respuestas | Alta | GitHub Pages | Headers presentes |
| N8N-013 | Execution limit | Alta | n8n sin ejecuciones | Frontend muestra servidor no disponible |
| N8N-014 | Airtable rate limit | Alta | Muchas llamadas | Error recuperable |

## Persistencia local

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| LOC-001 | Estado guarda caja confirmada | Critica | Abrir caja | localStorage conserva sesion |
| LOC-002 | Estado no confirma operaciones fallidas | Critica | Error backend | No marca exito |
| LOC-003 | OperationId venta pendiente persiste | Critica | Timeout venta | Mismo operationId |
| LOC-004 | OperationId caja pendiente persiste | Critica | Timeout caja | Mismo operationId |
| LOC-005 | Limpiar venta no borra caja | Alta | Caja abierta | Caja persiste |
| LOC-006 | Cierre confirmado actualiza caja | Alta | Cierre ok | Estado cerrada |
| LOC-007 | Movimiento duplicado local | Alta | Mismo operationId | No duplica |
| LOC-008 | Estado default tras JSON invalido | Media | localStorage corrupto | App inicia |

## Router/UI operativa

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| UI-001 | Ruta POS carga | Critica | App abierta | POS visible |
| UI-002 | Ruta apertura carga | Alta | App abierta | Formulario visible |
| UI-003 | Ruta movimientos carga | Alta | App abierta | Formulario visible |
| UI-004 | Ruta cierre carga | Media | App abierta | Formulario visible |
| UI-005 | Ruta caja carga | Media | App abierta | Estado visible |
| UI-006 | Ruta invalida | Media | Hash invalido | App recupera al default |

## Seguridad operativa

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| SEG-001 | Cierre caja otro usuario | Critica | usuarioId distinto | Backend rechaza |
| SEG-002 | Movimiento sin usuario | Critica | usuarioId vacio | Backend rechaza |
| SEG-003 | Venta sin usuario | Alta | caja sin usuario | Backend o frontend bloquea |
| SEG-004 | Endpoint publico sin credencial | Alta | Llamada externa | Riesgo identificado |
| SEG-005 | Payload manipulado | Alta | DevTools | Backend recalcula y valida |
| SEG-006 | OperationId predecible | Alta | Ataque/repeticion | Idempotencia evita duplicado, auth pendiente |
| SEG-007 | Datos sensibles en repo | Media | Revisar repo | Sin credenciales |

## Historial y anulacion server-side

| ID | Prueba | Prioridad | Precondicion | Resultado esperado |
|---|---|---|---|---|
| HSA-001 | Historial por empresa | Critica | Ventas de empresa demo | Solo devuelve ventas de la empresa |
| HSA-002 | Historial por cajaSesionId | Critica | Ventas en varias cajas | Devuelve solo la sesion solicitada |
| HSA-003 | Historial por usuario | Alta | Ventas de varios usuarios | Filtra por usuario |
| HSA-004 | Historial por rango de fecha | Alta | Ventas en varias fechas | Respeta fechaDesde/fechaHasta |
| HSA-005 | Historial por estado | Alta | Confirmadas y anuladas | Filtra por estado |
| HSA-006 | Busqueda por ventaId | Alta | ventaId conocido | Devuelve venta |
| HSA-007 | Busqueda por operationId | Critica | operationId conocido | Devuelve venta sin duplicar |
| HSA-008 | Historial con detalle | Critica | Venta con detalle | Devuelve detalle de productos |
| HSA-009 | Venta anulada identificada | Critica | Venta ANULADA | Aparece como anulada, no como confirmada |
| HSA-010 | Conciliacion local/server | Critica | Venta local y server mismo operationId | Se muestra una sola fila |
| HSA-011 | Detalle individual | Alta | ventaId valido | Devuelve cabecera, detalle, stock y caja |
| HSA-012 | Detalle venta de otra empresa | Critica | empresaId incorrecto | Rechazo |
| HSA-013 | Anular venta confirmada | Critica | Venta CONFIRMADA | Venta queda ANULADA |
| HSA-014 | Anular venta ya anulada | Critica | Venta ANULADA | Rechazo/idempotencia sin movimientos nuevos |
| HSA-015 | Anular venta de otra empresa | Critica | empresaId incorrecto | Rechazo |
| HSA-016 | Anular sin motivo | Critica | motivo vacio | Rechazo |
| HSA-017 | Anulacion doble envio | Critica | Mismo operationId | No duplica stock ni caja |
| HSA-018 | Anulacion timeout | Critica | n8n no responde | Queda pendiente/desconocida |
| HSA-019 | Movimiento inverso stock | Critica | Venta con stock | Crea COMPENSATORIO y restaura stock |
| HSA-020 | Movimiento inverso caja | Critica | Venta con caja | Crea EGRESO/COMPENSATORIO |
