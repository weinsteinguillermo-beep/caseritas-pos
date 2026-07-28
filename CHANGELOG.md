# Changelog

## 2026-07-28 - Etapa 0 v1.0

### Added

- Documentacion de roadmap operativo Caseritas POS v1.0.
- Matriz de certificacion v1.0.
- Guia operativa v1.0.
- Registro inicial de incidencias v1.0.

### Audited

- Configuracion API productiva.
- Uso unico de `fetch()` en `js/api.js`.
- Workflows n8n disponibles en `n8n-workflows/`.
- Estado publico no destructivo de endpoints obligatorios.

### Known blockers

- Workflows activos en n8n Cloud no devuelven JSON util para `/productos`, `/producto` y `/venta`.
- `/caja/estado` devuelve HTTP 404 en produccion.
- Falta importar y activar workflows IaC desde n8n Cloud.
