# Caseritas POS v1.0 Incidencias

| Fecha | Modulo | Sintoma | Causa | Solucion | Commit | Estado |
|---|---|---|---|---|---|---|
| 2026-07-28 | n8n `/productos` | Production URL responde HTTP 200 con cuerpo vacio | Workflow activo en n8n no coincide con IaC o no llega a Respond to Webhook | Preparado `workflow_productos.json` para importar y reemplazar workflow activo | 3f9b35a | ABIERTO |
| 2026-07-28 | n8n `/producto` | Production URL responde HTTP 200 con cuerpo vacio | Workflow activo no devuelve JSON util | Pendiente ETAPA 2, no avanzar hasta certificar `/productos` | Pendiente | ABIERTO |
| 2026-07-28 | n8n `/caja/estado` | Production URL responde HTTP 404 | Workflow no activo o ruta no publicada | Pendiente ETAPA 3 | Pendiente | ABIERTO |
| 2026-07-28 | n8n `/venta` | Production URL responde HTTP 200 con cuerpo vacio ante payload invalido | Workflow activo no devuelve JSON util | Pendiente ETAPA 5 | Pendiente | ABIERTO |
| 2026-07-28 | Repositorio | Cambios no relacionados sin commitear | Ajustes previos en `producto.json`, `styles.css`, `views/pos.js` | Mantener fuera de commits de auditoria hasta decidir alcance | Pendiente | OBSERVADO |
