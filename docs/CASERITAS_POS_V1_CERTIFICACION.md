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
| `/caja/abrir` | PENDIENTE | Sin certificacion | Estado de caja | Preparar despues |
| `/venta` | PENDIENTE | Body vacio | Endpoints previos | Preparar despues |
| `/caja/cerrar` | PENDIENTE | Sin certificacion | Venta pendiente | Preparar despues |
| Prueba integral | PENDIENTE | Sin evidencia | Endpoints | Ejecutar circuito |
| Primera venta real | PENDIENTE | Sin evidencia | Prueba integral | Vender |
| Modo Demo | CERTIFICADO | Guillermo confirmo que la secuencia completa funciona | Ninguno | Publicar en GitHub Pages |
| Release v1.0 | PENDIENTE | Sin evidencia | Primera venta | Crear release |


## Evidencia actual del hito Modo Demo

- Estado: CERTIFICADO MANUALMENTE.
- Evidencia: Guillermo confirmo que la secuencia completa funciona.
- Alcance validado: inicia desde "Ver demostracion", simula busqueda, muestra productos locales, agrega productos, modifica cantidades, selecciona efectivo, cobra, muestra ticket, espera 5 segundos, reinicia y puede detenerse desde el boton.
- Aislamiento: datos locales simulados; sin n8n, sin Airtable, sin contratos API y sin ejecucion automatica al abrir el POS.
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
| `/venta` local | PENDIENTE | `n8n-workflows/venta.json` existe con venta, detalle, stock, caja y rollback | No certificado con Airtable real | Auditar en ETAPA 5 |
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
