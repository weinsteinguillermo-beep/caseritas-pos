# Caseritas POS v1.0 Certificacion

## Tablero de release

| Hito | Estado | Evidencia | Bloqueo | Proximo paso |
|------|--------|-----------|---------|--------------|
| Auditoria y documentacion | CERTIFICADO | Commit `8f36c23` | Ninguno | Importar `/productos` |
| GitHub como fuente de verdad | CERTIFICADO | `main` actualizado; URL raw HTTP 200 | Ninguno | Mantener workflows IaC |
| Workflow `/productos` publicado | LISTO PARA IMPORTAR | `workflow_productos.json` publicado en GitHub | Importacion n8n | Importar desde URL |
| `/productos` en produccion | PENDIENTE | Sin evidencia de JSON real desde n8n | Importar y activar | Certificar endpoint |
| `/producto` | PENDIENTE | Sin evidencia | `/productos` pendiente | Preparar despues |
| `/caja/estado` | PENDIENTE | 404 publico | Workflow pendiente | Preparar despues |
| `/caja/abrir` | PENDIENTE | Sin certificacion | Estado de caja | Preparar despues |
| `/venta` | PENDIENTE | Body vacio | Endpoints previos | Preparar despues |
| `/caja/cerrar` | PENDIENTE | Sin certificacion | Venta pendiente | Preparar despues |
| Prueba integral | PENDIENTE | Sin evidencia | Endpoints | Ejecutar circuito |
| Primera venta real | PENDIENTE | Sin evidencia | Prueba integral | Vender |
| Release v1.0 | PENDIENTE | Sin evidencia | Primera venta | Crear release |

## Estados validos

- PENDIENTE
- EN PREPARACION
- LISTO PARA IMPORTAR
- IMPORTADO
- EN PRUEBA
- CERTIFICADO
- BLOQUEADO

## Evidencia actual del hito `/productos`

- URL raw: `https://raw.githubusercontent.com/weinsteinguillermo-beep/caseritas-pos/main/n8n-workflows/workflow_productos.json`
- HTTP raw: `200`
- JSON raw: valido
- Rama publicada: `Webhook GET /productos -> Validacion -> Airtable -> Normalizacion -> Respond to Webhook`
- Estado n8n: pendiente de importar y activar
## Clasificacion de elementos auditados Caseritas POS v1.0 Certificacion

| Elemento | Estado | Evidencia | Bloqueo | Proximo paso |
|----------|--------|-----------|---------|--------------|
| Frontend GitHub Pages | PENDIENTE | URL objetivo definida | Falta prueba integral publicada | Abrir POS publicado luego de certificar endpoints |
| API base | CERTIFICADO | `js/config.js` usa `https://gweinstein26.app.n8n.cloud/webhook` | Ninguno | Mantener sin cambios |
| Fallback local | CERTIFICADO | `USE_LOCAL_FALLBACK = false` | Ninguno | Mantener desactivado |
| Fetch aislado | CERTIFICADO | `fetch()` solo encontrado en `js/api.js` | Ninguno | Mantener regla |
| `/productos` workflow IaC | LISTO PARA IMPORTAR | `n8n-workflows/workflow_productos.json`; JSON valido; una rama GET `/productos` | Falta importar/activar en n8n Cloud | Guillermo debe importar y activar |
| `/productos` produccion | BLOQUEADO | HTTP 200, Content-Length 0, body vacio | Workflow activo n8n no coincide o no responde desde Respond | Reemplazar workflow activo por IaC |
| `/producto` local | EN DESARROLLO | `n8n-workflows/producto.json` existe | Tiene cambios locales no commiteados; no certificado | Auditar en ETAPA 2 |
| `/producto` produccion | BLOQUEADO | HTTP 200, body vacio | Workflow activo no responde JSON util | No avanzar hasta certificar `/productos` |
| `/caja/estado` local | PENDIENTE | `n8n-workflows/caja-estado.json` existe | No certificado como IaC v1.0 | Auditar en ETAPA 3 |
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
