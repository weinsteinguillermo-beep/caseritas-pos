# Roadmap

This roadmap organizes CASERITAS OS into practical product versions.

## v1.0 POS

Goal: reliable sales operation with real product data.

Scope:

- product search through n8n;
- barcode lookup;
- cart management;
- payment method;
- discounts;
- sale registration;
- cash movement registration;
- friendly server errors;
- controlled n8n consumption.

Exit criteria:

- sale can be completed end to end;
- stock-aware product search works;
- n8n workflows import cleanly;
- no simulated products in production mode;
- frontend never calls Airtable directly.

## v1.1 Clientes

Goal: manage customer information and connect customers to sales.

Scope:

- customer search;
- customer profile;
- customer creation/editing through n8n;
- optional customer selection in POS;
- purchase history by customer;
- contact fields and notes.

Exit criteria:

- sales can reference a customer;
- customer data has stable IDs;
- duplicate detection by phone/email exists.

## v1.2 Produccion

Goal: manage produced goods and prepare stock for sale.

Scope:

- production item catalog;
- cost and price fields;
- batch or preparation date;
- stock available;
- production status;
- low-stock indicators.

Exit criteria:

- produced products can be listed and searched;
- stock movement is created when production increases stock;
- production data supports POS availability.

## v1.3 Caja

Goal: provide daily financial control.

Scope:

- cash opening;
- cash closing;
- sale income;
- manual income/expense;
- payment method totals;
- discrepancy tracking;
- responsible person and timestamp.

Exit criteria:

- every sale creates a cash movement;
- daily cash summary can be reviewed;
- manual adjustments are traceable.

## v1.4 Dashboard

Goal: provide business visibility.

Scope:

- sales summary;
- top products;
- low stock;
- cash totals;
- customer activity;
- production status;
- daily/weekly/monthly filters.

Exit criteria:

- dashboard loads quickly;
- metrics match transactional tables;
- calculations are documented.

## v2.0 Inteligencia Artificial

Goal: add AI assistance to operational decisions.

Scope:

- sales and stock insights;
- reorder suggestions;
- demand forecasting;
- anomaly detection in cash or stock;
- assistant for operational questions;
- automatic report summaries.

Exit criteria:

- AI uses trusted operational data;
- recommendations are explainable;
- sensitive data handling is documented;
- humans remain responsible for final operational decisions.

## Cross-Version Priorities

Always preserve:

- clean module boundaries;
- n8n execution efficiency;
- traceability;
- no direct Airtable access from frontend;
- maintainable documentation;
- stable IDs across records.
