# Data Model

Mission 001: definitive data model for CASERITAS OS.

This model is designed for the next 10 years, for multiple small businesses, and for future migration from Airtable to PostgreSQL, MySQL or SQL Server without changing business logic.

## Principles

- Every operational table belongs to an `empresa_id`.
- Use UUIDs as technical primary keys.
- Use correlatives for human-facing documents such as sales, purchases and cash sessions.
- Separate master data from transactional data.
- Never depend on Airtable record IDs as business IDs.
- Prefer append-only ledgers for stock and cash movements.
- Use soft delete for master data.
- Use audit fields in all important tables.
- Keep historical snapshots in transaction detail rows.

## Standard Fields

Recommended on almost every table:

| Field | Type | Required | Default | Notes |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | Primary key |
| empresa_id | UUID | Yes | none | FK to EMPRESAS |
| estado | VARCHAR(30) | Yes | activo | Operational state |
| creado_en | TIMESTAMP | Yes | current timestamp | Audit |
| creado_por | UUID | No | null | FK to USUARIOS |
| actualizado_en | TIMESTAMP | Yes | current timestamp | Audit |
| actualizado_por | UUID | No | null | FK to USUARIOS |
| eliminado_en | TIMESTAMP | No | null | Soft delete |

For Airtable, UUID fields can be stored as text until migration to SQL.

## Textual Relationship Diagram

```txt
EMPRESAS
|
+-- CONFIG
+-- USUARIOS
|   |
|   +-- ROLES
|
+-- PRODUCTOS
|   |
|   +-- CATEGORIAS
|   +-- IMPUESTOS
|   +-- PROMOCIONES
|
+-- CLIENTES
+-- PROVEEDORES
|
+-- VENTAS
|   |
|   +-- DETALLE_VENTA
|   +-- MOVIMIENTOS_CAJA
|   +-- MOVIMIENTOS_STOCK
|
+-- CAJA
|   |
|   +-- MOVIMIENTOS_CAJA
|
+-- COMPRAS
|   |
|   +-- DETALLE_COMPRA
|   +-- MOVIMIENTOS_STOCK
|
+-- FORMAS_PAGO
+-- MOVIMIENTOS_STOCK
```

Requested simplified view:

```txt
EMPRESAS
|
+-- PRODUCTOS
+-- CLIENTES
+-- VENTAS
|      |
|      +-- DETALLE_VENTA
|
+-- CAJA
|      |
|      +-- MOVIMIENTOS_CAJA
|
+-- STOCK
       |
       +-- MOVIMIENTOS_STOCK
```

## Table: CONFIG

### Objective

Store configurable business rules per company.

### Description

Configuration is company-scoped and should avoid hardcoding business behavior in frontend or n8n workflows.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| clave | VARCHAR(100) | Yes | none | unique per empresa |
| valor | JSON/TEXT | Yes | none |  |
| tipo | VARCHAR(30) | Yes | string |  |
| descripcion | TEXT | No | null |  |
| activo | BOOLEAN | Yes | true |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`

### Relationships

- Many CONFIG rows per EMPRESA.

### Recommended Indexes

- unique `(empresa_id, clave)`
- `(empresa_id, activo)`

### Validations

- `clave` must not be empty.
- `tipo` in `string`, `number`, `boolean`, `json`, `date`.

### Observations

Good candidates: currency, default tax, ticket footer, low-stock threshold, default payment methods.

## Table: EMPRESAS

### Objective

Represent each business using CASERITAS OS.

### Description

This is the tenant root. Every operational record must belong to an empresa.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| nombre | VARCHAR(160) | Yes | none |  |
| razon_social | VARCHAR(200) | No | null |  |
| rut | VARCHAR(20) | No | null | unique optional |
| telefono | VARCHAR(40) | No | null |  |
| email | VARCHAR(160) | No | null |  |
| direccion | VARCHAR(255) | No | null |  |
| moneda | CHAR(3) | Yes | UYU |  |
| zona_horaria | VARCHAR(80) | Yes | America/Montevideo |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- none

### Relationships

- One EMPRESA has many users, products, clients, sales, purchases, cash sessions and movements.

### Recommended Indexes

- unique `rut` where not null
- `(estado)`

### Validations

- `moneda` should follow ISO currency code.
- `estado` in `activo`, `suspendido`, `cerrado`.

### Observations

For 100 businesses, this table becomes the partitioning root.

## Table: USUARIOS

### Objective

Store users who operate the system.

### Description

Users may belong to one or more companies in the future. For v1, use one empresa per user unless multi-company access is required.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| rol_id | UUID | Yes | none | FK |
| nombre | VARCHAR(160) | Yes | none |  |
| email | VARCHAR(160) | Yes | none | unique per empresa |
| telefono | VARCHAR(40) | No | null |  |
| password_hash | VARCHAR(255) | No | null | future auth |
| activo | BOOLEAN | Yes | true |  |
| ultimo_acceso_en | TIMESTAMP | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `rol_id -> ROLES.id`

### Relationships

- Many USUARIOS belong to one EMPRESA.
- One USUARIO has one ROL.
- USUARIOS can be referenced as creator, cashier or responsible person.

### Recommended Indexes

- unique `(empresa_id, email)`
- `(empresa_id, rol_id)`
- `(empresa_id, activo)`

### Validations

- email format.
- active users must have a role.

### Observations

If authentication is delegated later, store external identity ID.

## Table: ROLES

### Objective

Define permissions and operational roles.

### Description

Roles should support clear access control for cashiers, managers and administrators.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| nombre | VARCHAR(80) | Yes | none |  |
| descripcion | TEXT | No | null |  |
| permisos | JSON/TEXT | Yes | {} |  |
| activo | BOOLEAN | Yes | true |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`

### Relationships

- One ROL has many USUARIOS.

### Recommended Indexes

- unique `(empresa_id, nombre)`

### Validations

- role name must be unique per company.
- permissions must be valid JSON when using SQL.

### Observations

Default roles: admin, encargado, cajero, produccion.

## Table: CLIENTES

### Objective

Store customer master data.

### Description

Customers are optional for quick sales but essential for loyalty, history, account sales and follow-up.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| nombre | VARCHAR(180) | Yes | none |  |
| documento | VARCHAR(40) | No | null |  |
| telefono | VARCHAR(40) | No | null |  |
| email | VARCHAR(160) | No | null |  |
| direccion | VARCHAR(255) | No | null |  |
| notas | TEXT | No | null |  |
| estado | VARCHAR(30) | Yes | activo |  |
| fecha_alta | DATE | Yes | current date |  |
| ultima_compra_en | TIMESTAMP | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`

### Relationships

- One CLIENTE can have many VENTAS.

### Recommended Indexes

- `(empresa_id, nombre)`
- `(empresa_id, telefono)`
- `(empresa_id, documento)`
- `(empresa_id, estado)`

### Validations

- at least one contact field recommended: phone, email or address.
- `estado` in `activo`, `inactivo`, `bloqueado`.

### Observations

Use soft delete. Never hard-delete clients with sales.

## Table: PROVEEDORES

### Objective

Store supplier master data.

### Description

Suppliers are used by purchases and future cost analysis.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| nombre | VARCHAR(180) | Yes | none |  |
| rut | VARCHAR(20) | No | null |  |
| contacto | VARCHAR(160) | No | null |  |
| telefono | VARCHAR(40) | No | null |  |
| email | VARCHAR(160) | No | null |  |
| direccion | VARCHAR(255) | No | null |  |
| categoria | VARCHAR(80) | No | null |  |
| notas | TEXT | No | null |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`

### Relationships

- One PROVEEDOR has many COMPRAS.

### Recommended Indexes

- `(empresa_id, nombre)`
- `(empresa_id, rut)`
- `(empresa_id, estado)`

### Validations

- if `rut` exists, it should be unique per empresa.

### Observations

Use soft delete.

## Table: PRODUCTOS

### Objective

Store sellable and/or stock-controlled products.

### Description

This table replaces the current Airtable PRODUCCION concept as the canonical product table for long-term architecture.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| categoria_id | UUID | No | null | FK |
| impuesto_id | UUID | No | null | FK |
| sku | VARCHAR(80) | No | null | unique optional |
| codigo_barras | VARCHAR(80) | No | null | unique optional |
| nombre | VARCHAR(200) | Yes | none |  |
| descripcion | TEXT | No | null |  |
| precio_venta | DECIMAL(14,2) | Yes | 0 |  |
| precio_x_kg | DECIMAL(14,2) | No | null |  |
| costo_unitario | DECIMAL(14,2) | No | null |  |
| peso | DECIMAL(14,3) | No | null |  |
| unidad_medida | VARCHAR(20) | Yes | unidad |  |
| controla_stock | BOOLEAN | Yes | true |  |
| stock_actual | DECIMAL(14,3) | Yes | 0 |  |
| stock_minimo | DECIMAL(14,3) | Yes | 0 |  |
| activo_para_venta | BOOLEAN | Yes | true |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `categoria_id -> CATEGORIAS.id`
- `impuesto_id -> IMPUESTOS.id`

### Relationships

- One PRODUCTO belongs to one EMPRESA.
- One PRODUCTO can belong to one CATEGORIA.
- One PRODUCTO can have many DETALLE_VENTA, DETALLE_COMPRA and MOVIMIENTOS_STOCK rows.

### Recommended Indexes

- unique `(empresa_id, sku)` where `sku` is not null.
- unique `(empresa_id, codigo_barras)` where `codigo_barras` is not null.
- `(empresa_id, nombre)`
- `(empresa_id, categoria_id)`
- `(empresa_id, activo_para_venta, estado)`
- `(empresa_id, stock_actual)`

### Validations

- `precio_venta >= 0`.
- `stock_actual >= 0` unless negative stock is explicitly enabled in CONFIG.
- barcode must be unique per empresa when present.

### Observations

Use soft delete. Keep historical sale price in DETALLE_VENTA, not only here.

## Table: CATEGORIAS

### Objective

Classify products.

### Description

Categories support search, reporting, stock analysis and dashboard filters.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| categoria_padre_id | UUID | No | null | FK self |
| nombre | VARCHAR(120) | Yes | none |  |
| descripcion | TEXT | No | null |  |
| orden | INTEGER | Yes | 0 |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `categoria_padre_id -> CATEGORIAS.id`

### Relationships

- One CATEGORIA can have many PRODUCTOS.
- Categories can be hierarchical.

### Recommended Indexes

- unique `(empresa_id, nombre)`
- `(empresa_id, categoria_padre_id)`

### Validations

- category cannot be its own parent.

### Observations

Use soft delete.

## Table: VENTAS

### Objective

Store sale headers.

### Description

VENTAS is the business transaction root for POS sales.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| cliente_id | UUID | No | null | FK |
| usuario_id | UUID | No | null | FK |
| caja_id | UUID | No | null | FK |
| numero_venta | BIGINT | Yes | next sequence per empresa | correlativo |
| operation_id | UUID/VARCHAR(80) | Yes | generated UUID | unique |
| fecha | TIMESTAMP | Yes | current timestamp |  |
| metodo_pago_resumen | VARCHAR(80) | No | null |  |
| subtotal | DECIMAL(14,2) | Yes | 0 |  |
| descuento_total | DECIMAL(14,2) | Yes | 0 |  |
| impuesto_total | DECIMAL(14,2) | Yes | 0 |  |
| total | DECIMAL(14,2) | Yes | 0 |  |
| efectivo_recibido | DECIMAL(14,2) | No | null |  |
| vuelto | DECIMAL(14,2) | No | null |  |
| estado | VARCHAR(30) | Yes | pendiente |  |
| origen | VARCHAR(30) | Yes | pos |  |
| notas | TEXT | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| anulado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `cliente_id -> CLIENTES.id`
- `usuario_id -> USUARIOS.id`
- `caja_id -> CAJA.id`

### Relationships

- One VENTA has many DETALLE_VENTA rows.
- One VENTA can have many MOVIMIENTOS_CAJA.
- One VENTA can have many MOVIMIENTOS_STOCK through details.

### Recommended Indexes

- unique `(empresa_id, numero_venta)`
- unique `(empresa_id, operation_id)`
- `(empresa_id, fecha)`
- `(empresa_id, estado)`
- `(empresa_id, cliente_id, fecha)`
- `(empresa_id, caja_id)`

### Validations

- total must equal subtotal - discounts + taxes.
- confirmed sales cannot be edited directly; use reversal/anulacion.
- `estado` in `pendiente`, `confirmada`, `anulada`, `error`, `rollback_pendiente`, `rollback_completo`.

### Observations

Use UUID primary key and correlativo `numero_venta`.

## Table: DETALLE_VENTA

### Objective

Store one row per product sold.

### Description

This table is required for reporting, stock traceability and future AI.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| venta_id | UUID | Yes | none | FK |
| producto_id | UUID | Yes | none | FK |
| linea | INTEGER | Yes | none |  |
| producto_nombre | VARCHAR(200) | Yes | none | snapshot |
| codigo_barras | VARCHAR(80) | No | null | snapshot |
| cantidad | DECIMAL(14,3) | Yes | none |  |
| unidad_medida | VARCHAR(20) | Yes | unidad | snapshot |
| precio_unitario | DECIMAL(14,2) | Yes | none | snapshot |
| descuento_linea | DECIMAL(14,2) | Yes | 0 |  |
| impuesto_linea | DECIMAL(14,2) | Yes | 0 |  |
| total_linea | DECIMAL(14,2) | Yes | none |  |
| stock_antes | DECIMAL(14,3) | No | null |  |
| stock_despues | DECIMAL(14,3) | No | null |  |
| estado | VARCHAR(30) | Yes | confirmado |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `venta_id -> VENTAS.id`
- `producto_id -> PRODUCTOS.id`

### Relationships

- Many DETALLE_VENTA rows belong to one VENTA.
- Each row references one PRODUCTO.
- Each row can generate one MOVIMIENTOS_STOCK row.

### Recommended Indexes

- unique `(venta_id, linea)`
- `(empresa_id, producto_id)`
- `(empresa_id, venta_id)`
- `(empresa_id, creado_en)`

### Validations

- `cantidad > 0`.
- `precio_unitario >= 0`.
- `total_linea = cantidad * precio_unitario - descuento_linea + impuesto_linea`.

### Observations

Never rely only on current PRODUCTOS price for historical sales.

## Table: CAJA

### Objective

Represent a cash session/day/register.

### Description

CAJA is not a movement. It is the container for opening, closing and cash control.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| usuario_apertura_id | UUID | No | null | FK |
| usuario_cierre_id | UUID | No | null | FK |
| numero_caja | BIGINT | Yes | next sequence per empresa | correlativo |
| nombre | VARCHAR(120) | No | Caja principal |  |
| fecha_apertura | TIMESTAMP | Yes | current timestamp |  |
| fecha_cierre | TIMESTAMP | No | null |  |
| saldo_inicial | DECIMAL(14,2) | Yes | 0 |  |
| saldo_esperado | DECIMAL(14,2) | Yes | 0 |  |
| saldo_real | DECIMAL(14,2) | No | null |  |
| diferencia | DECIMAL(14,2) | No | null |  |
| estado | VARCHAR(30) | Yes | abierta |  |
| notas | TEXT | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `usuario_apertura_id -> USUARIOS.id`
- `usuario_cierre_id -> USUARIOS.id`

### Relationships

- One CAJA has many MOVIMIENTOS_CAJA.
- One CAJA has many VENTAS.

### Recommended Indexes

- unique `(empresa_id, numero_caja)`
- `(empresa_id, estado)`
- `(empresa_id, fecha_apertura)`

### Validations

- only one open cash session per register if using physical registers.
- closed cash sessions cannot receive new movements.

### Observations

The current Airtable CAJA behaves closer to MOVIMIENTOS_CAJA. Long-term, split these concepts.

## Table: MOVIMIENTOS_CAJA

### Objective

Store every financial movement.

### Description

This is the cash/payment ledger.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| caja_id | UUID | Yes | none | FK |
| venta_id | UUID | No | null | FK |
| compra_id | UUID | No | null | FK |
| forma_pago_id | UUID | No | null | FK |
| usuario_id | UUID | No | null | FK |
| operation_id | UUID/VARCHAR(80) | No | null |  |
| fecha | TIMESTAMP | Yes | current timestamp |  |
| tipo | VARCHAR(30) | Yes | none |  |
| concepto | VARCHAR(160) | Yes | none |  |
| importe | DECIMAL(14,2) | Yes | none |  |
| moneda | CHAR(3) | Yes | UYU |  |
| referencia | VARCHAR(120) | No | null |  |
| estado | VARCHAR(30) | Yes | confirmado |  |
| notas | TEXT | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `caja_id -> CAJA.id`
- `venta_id -> VENTAS.id`
- `compra_id -> COMPRAS.id`
- `forma_pago_id -> FORMAS_PAGO.id`
- `usuario_id -> USUARIOS.id`

### Relationships

- Many MOVIMIENTOS_CAJA belong to one CAJA.
- A sale can generate one or more cash movements.

### Recommended Indexes

- `(empresa_id, caja_id, fecha)`
- `(empresa_id, venta_id)`
- `(empresa_id, tipo, fecha)`
- `(empresa_id, forma_pago_id, fecha)`
- `(empresa_id, operation_id)`

### Validations

- ingresos should be positive.
- egresos can be stored as negative or positive with type; choose one convention.
- recommended: `importe` signed. Income positive, expense negative.

### Observations

Append-only preferred. Use reversal movements instead of editing confirmed movements.

## Table: MOVIMIENTOS_STOCK

### Objective

Store every stock change.

### Description

This is the inventory ledger and the source for audit.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| producto_id | UUID | Yes | none | FK |
| venta_id | UUID | No | null | FK |
| detalle_venta_id | UUID | No | null | FK |
| compra_id | UUID | No | null | FK |
| detalle_compra_id | UUID | No | null | FK |
| usuario_id | UUID | No | null | FK |
| operation_id | UUID/VARCHAR(80) | No | null |  |
| fecha | TIMESTAMP | Yes | current timestamp |  |
| tipo | VARCHAR(30) | Yes | none |  |
| cantidad | DECIMAL(14,3) | Yes | none | signed |
| stock_antes | DECIMAL(14,3) | Yes | none |  |
| stock_despues | DECIMAL(14,3) | Yes | none |  |
| motivo | VARCHAR(160) | No | null |  |
| estado | VARCHAR(30) | Yes | confirmado |  |
| notas | TEXT | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `producto_id -> PRODUCTOS.id`
- `venta_id -> VENTAS.id`
- `detalle_venta_id -> DETALLE_VENTA.id`
- `compra_id -> COMPRAS.id`
- `detalle_compra_id -> DETALLE_COMPRA.id`
- `usuario_id -> USUARIOS.id`

### Relationships

- Many movements belong to one PRODUCTO.
- Sales and purchases generate movements.

### Recommended Indexes

- `(empresa_id, producto_id, fecha)`
- `(empresa_id, tipo, fecha)`
- `(empresa_id, venta_id)`
- `(empresa_id, compra_id)`
- `(empresa_id, operation_id)`

### Validations

- `stock_despues = stock_antes + cantidad`.
- sale movement quantity is negative.
- purchase/production movement quantity is positive.

### Observations

This table grows very fast. It should be archived by date in large deployments.

## Table: COMPRAS

### Objective

Store purchase headers.

### Description

Purchases represent supplier invoices/orders and may increase stock.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| proveedor_id | UUID | Yes | none | FK |
| usuario_id | UUID | No | null | FK |
| numero_compra | BIGINT | Yes | next sequence per empresa | correlativo |
| fecha | TIMESTAMP | Yes | current timestamp |  |
| fecha_documento | DATE | No | null |  |
| comprobante | VARCHAR(120) | No | null |  |
| subtotal | DECIMAL(14,2) | Yes | 0 |  |
| impuesto_total | DECIMAL(14,2) | Yes | 0 |  |
| total | DECIMAL(14,2) | Yes | 0 |  |
| estado | VARCHAR(30) | Yes | pendiente |  |
| notas | TEXT | No | null |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| anulado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `proveedor_id -> PROVEEDORES.id`
- `usuario_id -> USUARIOS.id`

### Relationships

- One COMPRA has many DETALLE_COMPRA rows.
- One COMPRA can generate MOVIMIENTOS_STOCK and MOVIMIENTOS_CAJA.

### Recommended Indexes

- unique `(empresa_id, numero_compra)`
- `(empresa_id, proveedor_id, fecha)`
- `(empresa_id, estado)`

### Validations

- total must equal subtotal + tax.
- confirmed purchases should not be edited directly.

### Observations

Use correlativo for human reference.

## Table: DETALLE_COMPRA

### Objective

Store one row per purchased product.

### Description

Used for cost tracking and stock increases.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| compra_id | UUID | Yes | none | FK |
| producto_id | UUID | Yes | none | FK |
| linea | INTEGER | Yes | none |  |
| producto_nombre | VARCHAR(200) | Yes | none | snapshot |
| cantidad | DECIMAL(14,3) | Yes | none |  |
| costo_unitario | DECIMAL(14,2) | Yes | none |  |
| impuesto_linea | DECIMAL(14,2) | Yes | 0 |  |
| total_linea | DECIMAL(14,2) | Yes | none |  |
| estado | VARCHAR(30) | Yes | confirmado |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `compra_id -> COMPRAS.id`
- `producto_id -> PRODUCTOS.id`

### Relationships

- Many DETALLE_COMPRA rows belong to one COMPRA.
- Each detail can generate MOVIMIENTOS_STOCK.

### Recommended Indexes

- unique `(compra_id, linea)`
- `(empresa_id, producto_id)`

### Validations

- quantity and cost must be greater than zero.

### Observations

Keep cost snapshot here even if product cost changes later.

## Table: FORMAS_PAGO

### Objective

Define accepted payment methods.

### Description

Payment methods configure POS behavior and cash reporting.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| codigo | VARCHAR(40) | Yes | none | unique per empresa |
| nombre | VARCHAR(80) | Yes | none |  |
| requiere_vuelto | BOOLEAN | Yes | false |  |
| acredita_en_caja | BOOLEAN | Yes | true |  |
| orden | INTEGER | Yes | 0 |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`

### Relationships

- One FORMA_PAGO can be used by VENTAS and MOVIMIENTOS_CAJA.

### Recommended Indexes

- unique `(empresa_id, codigo)`
- `(empresa_id, estado)`

### Validations

- active code must be unique.

### Observations

Default codes: cash, card, transfer.

## Table: PROMOCIONES

### Objective

Store discount and promotion rules.

### Description

Promotions can apply to products, categories, dates or payment methods.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| nombre | VARCHAR(160) | Yes | none |  |
| tipo | VARCHAR(40) | Yes | none |  |
| valor | DECIMAL(14,2) | Yes | none |  |
| producto_id | UUID | No | null | FK |
| categoria_id | UUID | No | null | FK |
| forma_pago_id | UUID | No | null | FK |
| fecha_inicio | TIMESTAMP | Yes | none |  |
| fecha_fin | TIMESTAMP | No | null |  |
| acumulable | BOOLEAN | Yes | false |  |
| condiciones | JSON/TEXT | No | null |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`
- `producto_id -> PRODUCTOS.id`
- `categoria_id -> CATEGORIAS.id`
- `forma_pago_id -> FORMAS_PAGO.id`

### Relationships

- Promotions can target product, category or payment method.

### Recommended Indexes

- `(empresa_id, estado, fecha_inicio, fecha_fin)`
- `(empresa_id, producto_id)`
- `(empresa_id, categoria_id)`

### Validations

- `valor >= 0`.
- `fecha_fin` must be after `fecha_inicio` when present.

### Observations

Promotion application should be calculated server-side for trust.

## Table: IMPUESTOS

### Objective

Store tax rules.

### Description

Taxes must support Uruguay VAT and future changes.

### Fields

| Field | Type | Required | Default | Key |
|---|---:|---:|---|---|
| id | UUID | Yes | generated UUID | PK |
| empresa_id | UUID | Yes | none | FK |
| codigo | VARCHAR(40) | Yes | none | unique per empresa |
| nombre | VARCHAR(100) | Yes | none |  |
| porcentaje | DECIMAL(7,4) | Yes | 0 |  |
| incluido_en_precio | BOOLEAN | Yes | true |  |
| estado | VARCHAR(30) | Yes | activo |  |
| creado_en | TIMESTAMP | Yes | current timestamp |  |
| actualizado_en | TIMESTAMP | Yes | current timestamp |  |
| eliminado_en | TIMESTAMP | No | null |  |

### Primary Key

- `id`

### Foreign Keys

- `empresa_id -> EMPRESAS.id`

### Relationships

- One IMPUESTO can be assigned to many PRODUCTOS.

### Recommended Indexes

- unique `(empresa_id, codigo)`
- `(empresa_id, estado)`

### Validations

- `porcentaje >= 0`.
- active code must be unique per company.

### Observations

Default Uruguay examples can include IVA basico and IVA minimo.

## Growth Analysis

### Tables Expected To Grow Fastest

1. `DETALLE_VENTA`
2. `MOVIMIENTOS_STOCK`
3. `MOVIMIENTOS_CAJA`
4. `VENTAS`
5. `DETALLE_COMPRA`

These tables should be indexed carefully and archived by date when volume grows.

### Tables That Should Be Archived

- `VENTAS`
- `DETALLE_VENTA`
- `MOVIMIENTOS_CAJA`
- `MOVIMIENTOS_STOCK`
- `COMPRAS`
- `DETALLE_COMPRA`

Recommended archive strategy:

- keep current and previous fiscal year hot;
- archive older records to reporting storage or partitioned SQL tables;
- never archive without preserving links and totals.

### Tables That Need Audit

High-priority audit:

- `VENTAS`
- `DETALLE_VENTA`
- `CAJA`
- `MOVIMIENTOS_CAJA`
- `MOVIMIENTOS_STOCK`
- `COMPRAS`
- `DETALLE_COMPRA`
- `PRODUCTOS`
- `USUARIOS`
- `ROLES`
- `CONFIG`

Recommended future table:

```txt
AUDIT_LOG
```

### Tables That Need Soft Delete

Use soft delete:

- `CLIENTES`
- `PROVEEDORES`
- `PRODUCTOS`
- `CATEGORIAS`
- `USUARIOS`
- `ROLES`
- `FORMAS_PAGO`
- `PROMOCIONES`
- `IMPUESTOS`

Do not soft-delete transactional records as the main cancellation mechanism. Use states and reversal movements.

### Tables That Should Use UUID

All tables should use UUID primary keys.

Especially important:

- `EMPRESAS`
- `VENTAS`
- `DETALLE_VENTA`
- `MOVIMIENTOS_CAJA`
- `MOVIMIENTOS_STOCK`
- `COMPRAS`
- `DETALLE_COMPRA`

### Tables That Should Use Correlative Numbers

Use correlatives for human-facing records:

- `VENTAS.numero_venta`
- `COMPRAS.numero_compra`
- `CAJA.numero_caja`

Potential future correlatives:

- receipt number;
- invoice number;
- stock adjustment number.

Correlatives must be scoped by `empresa_id`.

## Multi-Business Scalability

If the system has 100 businesses simultaneously:

- every query must filter by `empresa_id`;
- every index on operational tables should start with `empresa_id`;
- frontend sessions must carry company context;
- n8n workflows must validate company access;
- Airtable may become a bottleneck and SQL migration should be prioritized;
- reporting should use precomputed summaries;
- high-volume ledger tables should be partitioned by company and date in SQL;
- authentication and authorization become mandatory, not optional.

## Architecture Improvements

Recommended next architecture steps:

1. Add `empresa_id` to all future records, even in Airtable as text/link.
2. Introduce `OperationId` for all transactional write workflows.
3. Create `AUDIT_LOG` before adding user permissions.
4. Split current CAJA concept into `CAJA` and `MOVIMIENTOS_CAJA`.
5. Move from Airtable record IDs to explicit UUID business IDs.
6. Keep n8n as orchestration layer, but design APIs as if a SQL backend could replace it.
7. Create reporting summary tables before dashboard v1.4.

## Risks

- Airtable field names can drift from the canonical model.
- High-volume transaction tables can become slow in Airtable.
- Without `empresa_id`, multi-company support becomes expensive to retrofit.
- Without `DETALLE_VENTA`, product reporting and AI insights are weak.
- Without `MOVIMIENTOS_STOCK`, stock becomes a mutable number without audit.
- Without `MOVIMIENTOS_CAJA`, cash control mixes session and movement concepts.

## Recommendations

- Treat this document as the canonical model.
- Keep Airtable as implementation detail, not business model.
- Add UUIDs before production volume grows.
- Use correlatives only for human display, not as primary keys.
- Prefer append-only movements for stock and cash.
- Add audit logging before adding role-based permissions.
- Validate all financial totals server-side.
