# Modules

CASERITAS OS should evolve as a modular operations platform.

## POS

Priority: 1.

Responsibilities:

- search products;
- add/remove items from cart;
- calculate subtotal, discount and total;
- validate payment;
- register sale;
- clear sale state;
- show friendly operational messages.

Boundaries:

- does not know Airtable schema;
- does not write stock directly;
- delegates persistence to `js/api.js` and n8n.

## Productos

Priority: 2.

Responsibilities:

- product listing;
- product detail;
- barcode management;
- price/weight/stock visibility;
- future creation and editing.

Boundaries:

- product availability comes from PRODUCCION/stock;
- frontend consumes normalized product fields only.

## Ventas

Priority: 3.

Responsibilities:

- sale header;
- sale detail;
- payment method;
- discounts;
- customer association;
- sale status.

Future need:

- move from `ItemsJSON` to `DETALLE_VENTA`.

## Caja

Priority: 4.

Responsibilities:

- cash movements;
- sale income;
- manual income/expense;
- opening and closing;
- daily totals;
- discrepancy tracking.

Boundaries:

- every POS sale should create a linked cash movement.

## Clientes

Priority: 5.

Responsibilities:

- customer search;
- customer master data;
- contact details;
- purchase history;
- customer notes and follow-up.

Boundaries:

- customers are optional for quick POS flow but required for account/history features.

## Produccion

Priority: 6.

Responsibilities:

- produced product data;
- available stock;
- production status;
- cost/price fields;
- future batch tracking.

Boundaries:

- production increases stock through stock movements.
- POS reads available sale products but should not manage production state.

## Compras

Priority: 7.

Responsibilities:

- supplier purchase records;
- purchase totals;
- payment status;
- received goods;
- documents and invoices.

Boundaries:

- purchases should create stock movements where relevant.

## Inventario

Priority: 8.

Responsibilities:

- current stock;
- stock movements;
- adjustments;
- low-stock alerts;
- stock valuation.

Boundaries:

- inventory should be movement-driven, not manually overwritten without trace.

## Reportes

Priority: 9.

Responsibilities:

- sales reports;
- product reports;
- customer reports;
- cash reports;
- stock reports;
- export-ready summaries.

Boundaries:

- should rely on normalized detail tables or prepared dashboard summaries.

## Dashboard

Priority: 10.

Responsibilities:

- daily overview;
- sales KPIs;
- cash position;
- top products;
- low stock;
- operational alerts.

Boundaries:

- should avoid heavy raw-data processing in the browser.
- should consume prepared API responses.

## Shared Modules

### API Client

File: `js/api.js`.

Responsibilities:

- all `fetch()` calls;
- request URLs;
- response normalization;
- friendly network errors;
- optional local fallback for development only.

### Config

File: `js/config.js`.

Responsibilities:

- n8n base URL;
- controlled local fallback flag.

### Router

File: `js/router.js`.

Responsibilities:

- view navigation;
- lazy-loading view scripts.

Should remain independent from business logic.

### UI

File: `js/ui.js`.

Responsibilities:

- DOM access;
- rendering;
- event binding;
- messages;
- modal behavior.

Should not call APIs directly.
