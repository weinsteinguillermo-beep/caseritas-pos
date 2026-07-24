# Architecture

CASERITAS OS is a web-based operational platform for small shops in Uruguay.

The current version is a static frontend connected to n8n webhooks. n8n acts as the backend/API layer and is the only integration point with Airtable. Airtable stores operational data. Automations and dashboards are expected to consume the same source of truth.

## Current Flow

```txt
Frontend
  |
  v
API layer in n8n
  |
  v
Airtable
  |
  v
Automations
  |
  v
Dashboard
```

## Frontend

The frontend is a static single-page application served from GitHub Pages or any static host.

Main responsibilities:

- render POS and operational views;
- manage cart state in the browser;
- call n8n endpoints through `js/api.js`;
- show friendly errors when n8n is unavailable;
- avoid direct Airtable access;
- reduce n8n execution usage with debounce, minimum search length, and duplicate-query protection.

Current frontend files:

- `index.html`: app shell.
- `styles.css`: visual design.
- `js/config.js`: n8n base URL and local fallback flag.
- `js/api.js`: only frontend file allowed to use `fetch()`.
- `js/pos.js`: POS business logic and cart state.
- `js/ui.js`: DOM rendering and events.
- `js/router.js`: SPA navigation.
- `views/`: module views.

## API Layer

n8n is the API layer. It owns:

- request validation;
- Airtable field mapping;
- write orchestration;
- response normalization for the frontend;
- CORS headers;
- future automation triggers.

The frontend must never know Airtable table IDs, field names, credentials, or schema details.

Current n8n base URL:

```txt
https://gweinstein26.app.n8n.cloud/webhook
```

## Airtable

Airtable is the operational database for the first stage.

It stores:

- production/products;
- sales;
- clients;
- cash movements;
- future stock movements, purchases and suppliers.

As the product grows, Airtable should stay normalized enough to avoid duplicating data between modules.

## Automations

Automations should be implemented in n8n, not in the browser.

Examples:

- register cash movement after sale;
- update stock after sale or production;
- send low-stock alerts;
- generate end-of-day summaries;
- synchronize reporting tables;
- notify owners about pending tasks.

## Dashboard

The dashboard should consume aggregated operational data, preferably from Airtable views, n8n-prepared summary tables, or a BI layer.

The frontend dashboard should not perform heavy calculations against raw transactional data if those calculations can be precomputed.

## Future Direction

Recommended evolution:

1. Keep GitHub Pages frontend for lightweight deployment.
2. Keep n8n as backend while operational complexity is moderate.
3. Normalize Airtable tables for sales detail, stock movements, purchases, and suppliers.
4. Add reporting-ready tables or views for dashboard performance.
5. Consider a dedicated backend only when n8n/Airtable limits affect reliability, cost, or scale.

## Architectural Principles

- Frontend is presentation and interaction.
- n8n is API, orchestration, validation and automation.
- Airtable is source of truth.
- Dashboard consumes prepared data.
- No direct Airtable access from the browser.
- No automatic local fallback in production.
- Every module must be designed for traceability: ID, status, responsible person, dates and next action where relevant.
