# Changelog

## 2026-07-28 - n8n infrastructure block

### Changed

- Marked `/productos` production certification as blocked by n8n infrastructure.
- Registered `Execution limit reached. Consider upgrading your plan.` as the active release blocker.
## 2026-07-28 - Release management v1.0

### Added

- `VISION.md` with the product vision and v1.0 release rule.
- Release milestone board for Caseritas POS v1.0 certification.

### Updated

- `/productos` release status marked as `LISTO PARA IMPORTAR` with raw GitHub URL evidence.

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
