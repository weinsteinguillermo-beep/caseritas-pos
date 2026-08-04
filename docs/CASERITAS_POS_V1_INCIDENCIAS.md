# Caseritas POS v1.0 Incidencias

| Fecha | Hito | Sintoma | Evidencia | Causa | Solucion | Commit | Estado |
|---|---|---|---|---|---|---|---|
| 2026-07-28 | `/productos` | Ejecucion falla antes de completar | n8n Cloud muestra `Execution limit reached. Consider upgrading your plan.` | BLOQUEADO POR INFRAESTRUCTURA: limite de ejecuciones del plan n8n | Validar/restablecer ejecuciones disponibles; luego reintentar Production URL | Pendiente | ABIERTO |
| 2026-07-28 | `/producto` | Production URL responde HTTP 200 con cuerpo vacio | Prueba previa sin JSON util | Workflow activo no certificado | Pendiente ETAPA 2, no avanzar hasta certificar `/productos` | Pendiente | ABIERTO |
| 2026-07-28 | `/caja/estado` | Production URL responde HTTP 404 | Prueba publica previa | Workflow no activo o ruta no publicada | Pendiente ETAPA 3 | Pendiente | ABIERTO |
| 2026-07-28 | `/venta` | Production URL responde HTTP 200 con cuerpo vacio ante payload invalido | Prueba previa no destructiva; `workflow_venta.json` listo para importar | Workflow activo no certificado; n8n sin ejecuciones disponibles | Importar workflow IaC cuando n8n tenga ejecuciones y confirmar Table IDs transaccionales | Este hito | ABIERTO |
| 2026-07-28 | Repositorio | Cambios no relacionados sin commitear | `producto.json`, `styles.css`, `views/pos.js` aparecen modificados | Ajustes previos fuera del hito actual | Mantener fuera de commits de release hasta decidir alcance | Pendiente | OBSERVADO |
