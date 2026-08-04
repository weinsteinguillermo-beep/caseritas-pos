# Caseritas POS v1.0 Certificacion

## Tablero de release

| Hito | Estado | Evidencia | Bloqueo | Proximo paso |
|------|--------|-----------|---------|--------------|
| Auditoria y documentacion | CERTIFICADO | Commit `8f36c23` | Ninguno | Importar `/productos` |
| GitHub como fuente de verdad | CERTIFICADO | `main` actualizado; URL raw HTTP 200 | Ninguno | Mantener workflows IaC |
| Workflow `/productos` publicado | IMPORTADO | `workflow_productos.json` publicado e importado en n8n Cloud | Ninguno | Validar ejecucion productiva |
| `/productos` en produccion | BLOQUEADO | Workflow importado; ejecuciones fallan con `Execution limit reached. Consider upgrading your plan.` | BLOQUEADO POR INFRAESTRUCTURA: limite del plan n8n | Validar/restablecer ejecuciones disponibles en n8n |
| `/producto` | LISTO PARA IMPORTAR | `workflow_producto.json` preparado para Import from URL | Bloqueado por limite de ejecuciones n8n para certificacion productiva | Importar cuando n8n tenga ejecuciones disponibles |
| `/caja/estado` | LISTO PARA IMPORTAR | `workflow_caja_estado.json` preparado para Import from URL | Bloqueado por limite de ejecuciones n8n para certificacion productiva | Importar cuando n8n tenga ejecuciones disponibles |
| `/caja/abrir` | LISTO PARA IMPORTAR | `workflow_caja_abrir.json` preparado para Import from URL | Bloqueado por limite de ejecuciones n8n para certificacion productiva; Table ID `SESIONES_CAJA` pendiente | Importar cuando n8n tenga ejecuciones disponibles |
| `/venta` | LISTO PARA IMPORTAR | `workflow_venta.json` preparado para Import from URL | Bloqueado por limite de ejecuciones n8n para certificacion productiva; Table IDs transaccionales pendientes | Importar cuando n8n tenga ejecuciones disponibles |
| `/caja/cerrar` | LISTO PARA IMPORTAR | `workflow_caja_cerrar.json` preparado para Import from URL | Bloqueado por limite de ejecuciones n8n para certificacion productiva; Table IDs `SESIONES_CAJA` y `MOVIMIENTOS_CAJA` pendientes | Importar cuando n8n tenga ejecuciones disponibles |
| Prueba integral | PENDIENTE | Sin evidencia | Endpoints | Ejecutar circuito |
| Primera venta real | PENDIENTE | Sin evidencia | Prueba integral | Vender |
| Modo Demo | CERTIFICADO | Guillermo confirmo que la secuencia completa funciona | Ninguno | Publicar en GitHub Pages |
| Release v1.0 | PENDIENTE | Sin evidencia | Primera venta | Crear release |


## Evidencia actual del hito Modo Demo

- Estado: CERTIFICADO MANUALMENTE.
- Evidencia: Guillermo confirmo que la secuencia completa funciona.
- Alcance validado: inicia desde "Ver demostracion", simula busqueda, muestra productos locales, agrega productos, modifica cantidades, selecciona efectivo, cobra, muestra ticket, espera 5 segundos, reinicia y puede detenerse desde el boton.
- Aislamiento: datos locales simulados; sin n8n, sin Airtable, sin contratos API y sin ejecucion automatica al abrir el POS.



## Evidencia actual del hito `/caja/cerrar`

- Estado: LISTO PARA IMPORTAR.
- Archivo: `n8n-workflows/workflow_caja_cerrar.json`.
- URL raw objetivo: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_caja_cerrar.json`.
- Contrato: `POST /caja/cerrar` con `operationId`, `empresaId`, `usuarioId`, `cajaSesionId`, `totalContado`, `observaciones`, `fechaHora` y `cajaId` opcional por compatibilidad con el POS actual.
- Tablas Airtable: `SESIONES_CAJA` y `MOVIMIENTOS_CAJA` por nombre, porque los Table IDs reales siguen pendientes en `docs/DATABASE.md`.
- Campos usados en `SESIONES_CAJA`: `empresa_id`, `usuario_id`, `caja_id`, `estado`, `fondo_inicial`, `fecha_cierre`, `total_esperado`, `total_contado`, `diferencia`, `observaciones`, `operation_id_cierre`.
- Campos usados en `MOVIMIENTOS_CAJA`: `caja_sesion_id`, `tipo`, `importe`, `estado`, `operation_id`, `fecha_hora`.
- Reglas: valida payload, valida total contado, idempotencia por `operation_id_cierre`, valida sesion abierta, calcula total esperado desde movimientos activos, calcula diferencia y responde JSON con CORS en todas las ramas.
- Estado productivo: no certificado; pendiente de importar y probar en n8n Cloud cuando existan ejecuciones disponibles.
## Evidencia actual del hito `/venta`

- Estado: LISTO PARA IMPORTAR.
- Archivo: `n8n-workflows/workflow_venta.json`.
- URL raw objetivo: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_venta.json`.
- Contrato: `POST /venta` con `operationId`, `empresaId`, `cajaId`, `cajaSesionId`, `cashier`, `customerId`, `customerName`, `items`, `paymentMethod`, `discountPercent` y `cashReceived`.
- Tablas Airtable con ID confirmado: `VENTAS` (`tbleU4MHRm3Z2iRcY`) y `PRODUCCION` (`tblyBp7gm4Lheqr7s`).
- Tablas Airtable por nombre con Table ID pendiente: `SESIONES_CAJA`, `DETALLE_VENTA`, `MOVIMIENTOS_STOCK`, `MOVIMIENTOS_CAJA`.
- Reglas: valida payload, idempotencia por `OperationId`, caja abierta, productos existentes, stock suficiente, recalculo backend de precios y total, creacion de venta pendiente, detalle, movimientos de stock, descuento de stock, movimiento de caja, confirmacion y compensacion controlada.
- Estado productivo: no certificado; pendiente de importar y probar en n8n Cloud cuando existan ejecuciones disponibles.
## Evidencia actual del hito `/caja/abrir`

- Estado: LISTO PARA IMPORTAR.
- Archivo: `n8n-workflows/workflow_caja_abrir.json`.
- URL raw objetivo: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_caja_abrir.json`.
- Contrato: `POST /caja/abrir` con `operationId`, `empresaId`, `usuarioId`, `cajaId`, `fondoInicial` y `fechaHora` opcional.
- Tabla Airtable: `SESIONES_CAJA` por nombre, porque el Table ID real sigue pendiente en `docs/DATABASE.md`.
- Campos usados: `empresa_id`, `usuario_id`, `caja_id`, `estado`, `fondo_inicial`, `fecha_apertura`, `operation_id_apertura`.
- Reglas: valida payload, valida fondo inicial, evita duplicados por `operation_id_apertura`, bloquea segunda caja abierta para la misma empresa/usuario/caja y responde JSON con CORS en todas las ramas.
- Estado productivo: no certificado; pendiente de importar y probar en n8n Cloud cuando existan ejecuciones disponibles.
## Estados validos

- PENDIENTE
- EN PREPARACION
- LISTO PARA IMPORTAR
- IMPORTADO
- EN PRUEBA
- CERTIFICADO
- BLOQUEADO


## Evidencia actual del hito `/caja/estado`

- Estado: LISTO PARA IMPORTAR.
- Archivo: `n8n-workflows/workflow_caja_estado.json`.
- URL raw objetivo: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_caja_estado.json`.
- Contrato: `POST /caja/estado` con `empresaId`, `usuarioId` y `cajaId`.
- Tabla Airtable: `SESIONES_CAJA` por nombre, porque el Table ID sigue pendiente en `docs/DATABASE.md`.
- Campos usados: `empresa_id`, `usuario_id`, `caja_id`, `estado`, `fondo_inicial`, `fecha_apertura`.
- Reglas: devuelve cerrada si no hay sesion abierta y error `MULTIPLE_OPEN_SESSIONS` si hay mas de una.
- Estado productivo: no certificado; pendiente de importar y probar en n8n Cloud cuando existan ejecuciones disponibles.

## Evidencia actual del hito `/producto`

- Estado: LISTO PARA IMPORTAR.
- Archivo: `n8n-workflows/workflow_producto.json`.
- URL raw objetivo: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_producto.json`.
- Contrato: `GET /producto?code=...` devuelve `{ "ok": true, "producto": {...} }` o `{ "ok": true, "producto": null }`.
- Tabla Airtable: `PRODUCCION` (`tblyBp7gm4Lheqr7s`).
- Campos usados: `Name`, `Codigo de Barras`, `Importe`, `Precio x Kg`, `Peso`, `Stock Actual`.
- Estado productivo: no certificado; pendiente de importar y probar en n8n Cloud cuando existan ejecuciones disponibles.

## Evidencia actual del hito `/productos`

- URL raw: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_productos.json`
- HTTP raw: `200`
- JSON raw: valido
- Rama publicada: `Webhook GET /productos -> Validacion -> Airtable -> Normalizacion -> Respond to Webhook`
- Estado n8n: importado; bloqueado por limite de ejecuciones del plan
## Clasificacion de elementos auditados Caseritas POS v1.0 Certificacion

| Elemento | Estado | Evidencia | Bloqueo | Proximo paso |
|----------|--------|-----------|---------|--------------|
| Frontend GitHub Pages | PENDIENTE | URL objetivo definida | Falta prueba integral publicada | Abrir POS publicado luego de certificar endpoints |
| API base | CERTIFICADO | `js/config.js` usa `https://gweinstein26.app.n8n.cloud/webhook` | Ninguno | Mantener sin cambios |
| Fallback local | CERTIFICADO | `USE_LOCAL_FALLBACK = false` | Ninguno | Mantener desactivado |
| Fetch aislado | CERTIFICADO | `fetch()` solo encontrado en `js/api.js` | Ninguno | Mantener regla |
| `/productos` workflow IaC | LISTO PARA IMPORTAR | `n8n-workflows/workflow_productos.json`; JSON valido; una rama GET `/productos` | Falta importar/activar en n8n Cloud | Guillermo debe importar y activar |
| `/productos` produccion | BLOQUEADO | HTTP 200, Content-Length 0, body vacio | Workflow activo n8n no coincide o no responde desde Respond | Reemplazar workflow activo por IaC |
| `/producto` workflow IaC | LISTO PARA IMPORTAR | `n8n-workflows/workflow_producto.json`; JSON valido; una rama GET `/producto` | Falta importar/activar y probar en n8n Cloud | Importar desde URL raw |
| `/producto` produccion | BLOQUEADO | HTTP 200, body vacio | Workflow activo no responde JSON util | No avanzar hasta certificar `/productos` |
| `/caja/estado` workflow IaC | LISTO PARA IMPORTAR | `n8n-workflows/workflow_caja_estado.json`; JSON valido; una rama POST `/caja/estado` | Falta importar/activar y probar en n8n Cloud | Importar desde URL raw |
| `/caja/estado` produccion | BLOQUEADO | HTTP 404 | Endpoint no activo/publicado | No avanzar hasta certificar `/producto` |
| `/caja/abrir` local | PENDIENTE | `n8n-workflows/caja-abrir.json` existe | No certificado como IaC v1.0 | Auditar en ETAPA 4 |
| `/caja/abrir` produccion | BLOQUEADO | Pruebas previas dieron HTTP 404 | Endpoint no activo/publicado | No avanzar hasta certificar `/caja/estado` |
| `/venta` workflow IaC | LISTO PARA IMPORTAR | `n8n-workflows/workflow_venta.json`; JSON valido; POST `/venta` con idempotencia, caja, stock, detalle, caja y compensacion | Falta importar/activar y probar en n8n Cloud | Importar desde URL raw |
| `/venta` produccion | BLOQUEADO | HTTP 200, body vacio ante payload invalido sin escritura | Workflow activo no responde JSON util | No avanzar hasta certificar caja |
| `/caja/cerrar` local | PENDIENTE | `n8n-workflows/caja-cerrar.json` existe | No certificado | Auditar en ETAPA 6 |
| POS apertura | REQUIERE CERTIFICACION | `views/pos.js` llama `/caja/abrir` y recupera pendiente con `/caja/estado` | Endpoints caja no certificados | Probar luego de importar workflows |
| POS busqueda | REQUIERE CERTIFICACION | `js/api.js` usa `GET /productos?text=` y `GET /producto?code=` | Endpoints no certificados | Certificar productos primero |
| POS cobro | REQUIERE CERTIFICACION | OperationId y bloqueo `saleInFlight` implementados | `/venta` no certificado | Probar luego de caja y productos |
| Carrito | REQUIERE CERTIFICACION | Agregar, quitar y modificar cantidad implementado | Falta prueba real con stock | Validar en prueba integral |
| Stock | BLOQUEADO | Workflow venta actualiza `Stock Actual` y crea `MOVIMIENTOS_STOCK` | No certificado con Airtable real | Certificar `/venta` |
| Caja | BLOQUEADO | Workflows locales para sesiones y movimientos existen | Endpoints caja no activos publicamente | Certificar caja estado/apertura/cierre |
| CORS | BLOQUEADO | Workflows locales incluyen headers | Respuesta publica actual no muestra CORS | Verificar luego de importacion IaC |
| Documentacion v1.0 | EN DESARROLLO | Documentos de ETAPA 0 creados | Pendiente revision Guillermo | Confirmar antes de ETAPA 1 |

## Clasificacion de elementos auditados

| Elemento | Clasificacion | Observacion |
|---|---|---|
| `index.html` | FUNCIONA | Carga app JS/CSS; no auditado visualmente en esta etapa. |
| `js/config.js` | FUNCIONA | API productiva y fallback apagado. |
| `js/api.js` | FUNCIONA | Capa desacoplada; normaliza productos y errores de red. |
| `js/pos.js` | REQUIERE CERTIFICACION | Calcula totales y payload; no valida cantidad contra stock local. |
| `js/state.js` | REQUIERE CERTIFICACION | Idempotencia local y caja pendiente implementadas. |
| `views/pos.js` | REQUIERE CERTIFICACION | Flujo terminal implementado; tiene cambios locales no commiteados. |
| `n8n-workflows/workflow_productos.json` | LISTO PARA IMPORTAR | Creado y commiteado previamente. |
| `n8n-workflows/productos.json` | LISTO PARA IMPORTAR | Sincronizado con workflow importable. |
| `n8n-workflows/producto.json` | REQUIERE CERTIFICACION | Existe pero tiene cambios locales pendientes. |
| `n8n-workflows/caja-estado.json` | REQUIERE CERTIFICACION | Existe, no importado/certificado. |
| `n8n-workflows/caja-abrir.json` | REQUIERE CERTIFICACION | Existe, no importado/certificado. |
| `n8n-workflows/venta.json` | REQUIERE CERTIFICACION | Completo pero no certificado en Airtable real. |
| `lab/` | MEJORA FUTURA | Ideas y laboratorio; no bloquea v1.0. |
| Docs historicos | FUNCIONA | Base documental amplia; requiere foco v1.0. |
