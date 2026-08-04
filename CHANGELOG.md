# Changelog

## 2026-08-04 - Cash status workflow

### Added

- `n8n-workflows/workflow_caja_estado.json` ready for n8n Cloud Import from URL.
- `POST /caja/estado` workflow with payload validation, `SESIONES_CAJA` lookup, duplicate-session guard, CORS and JSON responses.

### Status

- `/caja/estado`: LISTO PARA IMPORTAR.
- Not certified in production because n8n execution availability remains the active infrastructure blocker.

## 2026-08-04 - Producto lookup workflow

### Added

- `n8n-workflows/workflow_producto.json` ready for n8n Cloud Import from URL.
- `GET /producto?code=...` workflow with validation, Airtable lookup, normalization, CORS and JSON responses.

### Status

- `/producto`: LISTO PARA IMPORTAR.
- Not certified in production because n8n execution availability remains the active infrastructure blocker.

## 2026-08-04 - POS demo mode

### Added

- Autonomous POS demo mode with local simulated data.
- Demo button in the POS terminal header.
- Simulated sale sequence: product search, cart additions, quantity change, cash payment, ticket display, dashboard status update, 5-second wait and restart.

### Certified

- Modo Demo: CERTIFICADO MANUALMENTE.
- Evidence: Guillermo confirmed the complete sequence works.
- Production isolation verified: no backend calls, no n8n calls, no Airtable writes, no API imports, no automatic execution on POS load.

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
