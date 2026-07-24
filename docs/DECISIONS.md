# Decisions

This file records important technical decisions for CASERITAS OS.

## 2026-07-24: Use n8n As API Layer

Decision: n8n is the API/backend layer between the static frontend and Airtable.

Why:

- protects Airtable credentials;
- centralizes validation and mapping;
- supports automations without frontend changes;
- works well with GitHub Pages deployment;
- is faster to evolve than a custom backend at the current stage.

Consequences:

- frontend must not call Airtable directly;
- n8n execution limits must be respected;
- workflows become part of the application architecture.

## 2026-07-24: Keep Frontend Static

Decision: CASERITAS OS remains a static frontend for now.

Why:

- simple deployment through GitHub Pages;
- no build step;
- easy to operate on low-cost infrastructure;
- good fit while n8n handles backend logic.

Consequences:

- browser code must stay lightweight;
- complex reporting should be precomputed outside the browser;
- module boundaries must stay clear as features grow.

## 2026-07-24: API Client Is The Only Fetch Layer

Decision: `js/api.js` is the only frontend file allowed to call `fetch()`.

Why:

- avoids duplicated endpoint logic;
- keeps error handling consistent;
- makes it easier to change backend URLs later;
- prevents views from knowing backend details.

Consequences:

- new modules should add API functions in `js/api.js`;
- views should consume those functions through module logic or context.

## 2026-07-24: No Automatic Local Fallback

Decision: local fallback exists only behind `USE_LOCAL_FALLBACK = true`.

Why:

- production should never hide backend failures with fake data;
- cashiers need clear operational state;
- real sales must not be recorded against simulated products.

Consequences:

- if n8n is unavailable, frontend shows `Servidor no disponible`;
- local data can be used only for controlled development.

## 2026-07-24: Product Search Protects n8n Executions

Decision: product search requires at least 2 characters, uses 500 ms debounce and avoids repeated identical queries.

Why:

- n8n has monthly execution limits;
- product search happens frequently during sales;
- every keystroke should not trigger a paid/limited backend execution.

Consequences:

- empty catalog load is disabled in POS;
- users must type at least 2 characters before product search.

## 2026-07-24: n8n Normalizes Airtable Product Fields

Decision: n8n maps Airtable PRODUCCION fields to frontend product shape.

Airtable fields:

```txt
Name
Codigo de Barras
Importe
Precio x Kg
Peso
Stock Actual
```

Frontend fields:

```txt
id
name
barcode
price
weight
stock
```

Why:

- frontend should not depend on Airtable field names;
- Airtable schema can evolve without changing POS UI;
- API contract stays stable.

## Future Decision Needed: Sale Detail Normalization

Open question: when to move from `ItemsJSON` in VENTAS to a dedicated `DETALLE_VENTA` table.

Recommendation:

- keep `ItemsJSON` for v1.0 if speed matters;
- create `DETALLE_VENTA` before serious reporting, inventory automation or AI insights.

Reason:

- JSON is convenient but weak for reporting and traceability;
- detail rows make stock, dashboard and analytics much cleaner.

## 2026-07-24: Sale Engine Uses OperationId And Saga Compensation

Decision: `POST /venta` uses `OperationId` for idempotency and writes sale records as a saga.

Why:

- Airtable does not provide multi-table ACID transactions through n8n;
- duplicate sales are a real risk when the cashier retries or the network times out;
- stock, cash and sale detail must stay traceable.

Consequences:

- VENTAS, DETALLE_VENTA, MOVIMIENTOS_STOCK and CAJA should all store `OperationId`;
- failed partial operations must be marked as `RollbackPendiente`;
- manual/admin recovery remains necessary until a fully tested compensation workflow is live.
