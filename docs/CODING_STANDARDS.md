# Coding Standards

These standards keep CASERITAS OS maintainable as it grows.

## General

- Keep code simple and explicit.
- Prefer small functions with clear responsibilities.
- Avoid duplicating business rules across files.
- Do not mix UI rendering, business logic and API calls in the same layer.
- Document important decisions in `docs/DECISIONS.md`.

## Frontend Boundaries

- `fetch()` is allowed only in `js/api.js`.
- Views may call methods from the context, not raw endpoints.
- UI code should not know Airtable field names.
- Router must remain independent from module logic.
- Design visual changes require explicit request.

## API

- Build all URLs from `API_BASE`.
- Normalize n8n responses in `js/api.js`.
- Show `Servidor no disponible` when n8n does not respond.
- Do not automatically fallback to local data in production.
- Avoid repeated identical API calls.
- Use debounce for search input.

## Data

- Use stable IDs.
- Separate master data from transactional data.
- Prefer detail tables for transactional lines.
- Keep historical snapshots where prices or names may change after a transaction.
- Do not duplicate fields unless the duplication is intentional and documented.

## n8n Workflows

- Workflows must validate inputs.
- Workflows must map Airtable fields to frontend contracts.
- Workflows must include CORS headers when called from GitHub Pages.
- Do not store credentials in JSON exports.
- Base ID and Table IDs may be stored in workflow JSON when explicitly intended for import-ready workflows.

## Error Handling

- Prefer friendly user-facing messages.
- Technical errors can be logged later, but should not leak implementation details to the cashier.
- Empty search input should not call n8n.
- Server unavailability should not silently switch to development data.

## Naming

- Use English for code identifiers where the current codebase already does.
- Use business terminology from the domain in documentation.
- Keep Airtable field names exact in workflow documentation.

## Documentation

Update docs when changing:

- endpoints;
- Airtable schema;
- workflow behavior;
- module responsibilities;
- architectural decisions;
- deployment process.

## Git

- Do not commit or push without explicit authorization.
- Keep unrelated changes separate.
- Before committing, verify syntax and check `git status`.
