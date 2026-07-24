# Operating Day

Mision 002: preparacion operativa para un dia completo de comercio.

Este documento describe el flujo objetivo para que un comercio pueda abrir, vender durante todo el dia y cerrar usando CASERITAS OS.

## Principios Operativos

- Toda operacion sensible debe registrar `empresa_id` y `usuario_id`.
- No se puede vender sin caja abierta.
- No se borran ventas confirmadas.
- Las anulaciones generan movimientos inversos de caja y stock.
- No se confia en precios, stock ni totales enviados por frontend.
- `OperationId` protege contra ventas duplicadas.
- `CAJA` representa la sesion de caja.
- `MOVIMIENTOS_CAJA` representa el ledger financiero.
- `MOVIMIENTOS_STOCK` representa el ledger de inventario.
- Airtable es infraestructura temporal; el modelo debe poder migrar a SQL.

## Flujo Completo Del Dia

### 1. Inicio De Jornada

| Campo | Detalle |
|---|---|
| Actor responsable | Encargado o cajero |
| Pantalla utilizada | Inicio/POS o futura pantalla de jornada |
| Accion realizada | Ingresar al sistema y seleccionar empresa/sucursal si aplica |
| Endpoint involucrado | Futuro `GET /session`, `GET /config`, `GET /usuarios/me` |
| Tabla afectada | Ninguna o `USUARIOS` para ultimo acceso |
| Estado esperado | Usuario identificado y empresa activa |
| Posibles errores | Sin conexion, usuario sin permisos, empresa suspendida |
| Recuperacion | Reintentar conexion; contactar admin; operar manualmente solo si politica lo permite |

### 2. Apertura De Caja

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero o encargado |
| Pantalla utilizada | Caja |
| Accion realizada | Abrir caja con saldo inicial contado |
| Endpoint involucrado | Futuro `POST /caja/apertura` |
| Tabla afectada | `CAJA`, opcional `MOVIMIENTOS_CAJA` |
| Estado esperado | Caja en `abierta` vinculada a `empresa_id` y `usuario_id` |
| Posibles errores | Ya existe caja abierta, saldo inicial invalido, n8n sin ejecuciones |
| Recuperacion | Usar caja abierta existente o cerrar/anular apertura incorrecta con auditoria |

Registro esperado:

- `CAJA.estado = abierta`
- `CAJA.saldo_inicial = monto contado`
- `CAJA.usuario_apertura_id = usuario_id`

### 3. Seleccion De Usuario/Cajero

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero |
| Pantalla utilizada | Inicio, POS o selector persistente |
| Accion realizada | Confirmar usuario activo para la jornada |
| Endpoint involucrado | Futuro `GET /usuarios`, `POST /session/select-user` |
| Tabla afectada | `USUARIOS`, opcional `AUDIT_LOG` futuro |
| Estado esperado | `usuario_id` disponible para ventas, caja y anulaciones |
| Posibles errores | Usuario inactivo, rol sin permiso de caja |
| Recuperacion | Encargado cambia usuario o actualiza permisos |

### 4. Busqueda Y Escaneo De Productos

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero |
| Pantalla utilizada | POS |
| Accion realizada | Buscar por texto o escanear codigo |
| Endpoint involucrado | `GET /productos?text=...`, `GET /producto?code=...` |
| Tabla afectada | `PRODUCTOS`/actual `PRODUCCION` solo lectura |
| Estado esperado | Productos disponibles con stock mayor a cero |
| Posibles errores | Producto inexistente, sin stock, servidor no disponible |
| Recuperacion | Reintentar, buscar otro producto, cargar producto por proceso autorizado futuro |

### 5. Carrito

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero |
| Pantalla utilizada | POS |
| Accion realizada | Agregar, quitar o cambiar cantidades |
| Endpoint involucrado | Ninguno hasta cobrar |
| Tabla afectada | Ninguna |
| Estado esperado | Carrito local consistente |
| Posibles errores | Cantidad invalida, producto duplicado |
| Recuperacion | UI corrige cantidades; limpiar venta si es necesario |

### 6. Seleccion De Forma De Pago

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero |
| Pantalla utilizada | POS |
| Accion realizada | Elegir efectivo, tarjeta o transferencia |
| Endpoint involucrado | Futuro `GET /formas-pago` |
| Tabla afectada | `FORMAS_PAGO` solo lectura |
| Estado esperado | Forma de pago valida para empresa |
| Posibles errores | Forma deshabilitada, efectivo menor al total |
| Recuperacion | Elegir otra forma o corregir monto recibido |

### 7. Venta

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero |
| Pantalla utilizada | POS |
| Accion realizada | Presionar cobrar y confirmar |
| Endpoint involucrado | `POST /venta` |
| Tabla afectada | `VENTAS`, `DETALLE_VENTA`, `MOVIMIENTOS_STOCK`, `PRODUCTOS`/`PRODUCCION`, `MOVIMIENTOS_CAJA` |
| Estado esperado | Venta confirmada, stock descontado, caja actualizada |
| Posibles errores | Doble clic, stock insuficiente, total inconsistente, rollback pendiente |
| Recuperacion | `OperationId` evita duplicado; si rollback pendiente, revisar en n8n/admin |

### 8. Descuento De Stock

| Campo | Detalle |
|---|---|
| Actor responsable | n8n/backend |
| Pantalla utilizada | No aplica |
| Accion realizada | Crear movimiento de stock y actualizar stock actual |
| Endpoint involucrado | Interno dentro de `POST /venta` |
| Tabla afectada | `MOVIMIENTOS_STOCK`, `PRODUCTOS`/`PRODUCCION` |
| Estado esperado | Movimiento `Venta` confirmado y stock reducido |
| Posibles errores | Stock cambiante por ventas simultaneas, Airtable rate limit |
| Recuperacion | Rollback compensatorio o estado `RollbackPendiente` |

### 9. Registro De Movimientos De Caja

| Campo | Detalle |
|---|---|
| Actor responsable | n8n/backend |
| Pantalla utilizada | Caja para consulta |
| Accion realizada | Crear ingreso por venta |
| Endpoint involucrado | Interno dentro de `POST /venta` |
| Tabla afectada | `MOVIMIENTOS_CAJA` o actual `CAJA` temporal |
| Estado esperado | Movimiento `Ingreso` confirmado |
| Posibles errores | Caja cerrada, caja inexistente, falla de escritura |
| Recuperacion | No confirmar venta hasta registrar caja; si falla tarde, rollback |

### 10. Consulta De Ventas Del Dia

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero o encargado |
| Pantalla utilizada | Historial del dia / Reportes |
| Accion realizada | Ver ventas confirmadas y anuladas del dia |
| Endpoint involucrado | Futuro `GET /ventas?date=YYYY-MM-DD` |
| Tabla afectada | `VENTAS`, `DETALLE_VENTA` solo lectura |
| Estado esperado | Listado filtrado por `empresa_id`, fecha y caja |
| Posibles errores | Consulta lenta, datos incompletos por rollback pendiente |
| Recuperacion | Mostrar aviso de operaciones pendientes y permitir refrescar |

### 11. Anulacion Controlada De Una Venta

| Campo | Detalle |
|---|---|
| Actor responsable | Encargado o usuario autorizado |
| Pantalla utilizada | Historial del dia / detalle de venta |
| Accion realizada | Anular venta con motivo obligatorio |
| Endpoint involucrado | Futuro `POST /ventas/:id/anular` |
| Tabla afectada | `VENTAS`, `MOVIMIENTOS_STOCK`, `MOVIMIENTOS_CAJA` |
| Estado esperado | Venta `anulada`, stock revertido, caja con movimiento inverso |
| Posibles errores | Venta ya anulada, caja cerrada, stock no reversible |
| Recuperacion | Registrar movimiento de ajuste autorizado y auditar |

### 12. Ingresos Y Egresos Manuales De Caja

| Campo | Detalle |
|---|---|
| Actor responsable | Encargado o cajero autorizado |
| Pantalla utilizada | Caja |
| Accion realizada | Registrar ingreso/egreso con concepto |
| Endpoint involucrado | Futuro `POST /caja/movimiento` |
| Tabla afectada | `MOVIMIENTOS_CAJA` |
| Estado esperado | Movimiento confirmado y vinculado a caja abierta |
| Posibles errores | Caja cerrada, importe invalido, falta motivo |
| Recuperacion | Corregir datos; si fue confirmado, crear movimiento inverso |

### 13. Cierre De Caja

| Campo | Detalle |
|---|---|
| Actor responsable | Cajero y/o encargado |
| Pantalla utilizada | Caja |
| Accion realizada | Contar efectivo y cerrar caja |
| Endpoint involucrado | Futuro `POST /caja/cierre` |
| Tabla afectada | `CAJA`, `MOVIMIENTOS_CAJA` solo lectura |
| Estado esperado | Caja `cerrada`, diferencia calculada |
| Posibles errores | Ventas pendientes, operaciones rollback, diferencia no justificada |
| Recuperacion | Resolver pendientes antes de cerrar o cerrar con observacion autorizada |

### 14. Resumen Final De Jornada

| Campo | Detalle |
|---|---|
| Actor responsable | Encargado |
| Pantalla utilizada | Dashboard/Reportes |
| Accion realizada | Revisar totales, ventas, medios de pago, diferencias y stock critico |
| Endpoint involucrado | Futuro `GET /dashboard/resumen?date=YYYY-MM-DD` |
| Tabla afectada | Lectura de `VENTAS`, `DETALLE_VENTA`, `MOVIMIENTOS_CAJA`, `MOVIMIENTOS_STOCK` |
| Estado esperado | Resumen confiable del dia |
| Posibles errores | Datos lentos, operaciones pendientes |
| Recuperacion | Mostrar estado de calidad de datos y ultimas operaciones problemáticas |

### 15. Manejo De Errores De Conexion

| Campo | Detalle |
|---|---|
| Actor responsable | Sistema y cajero |
| Pantalla utilizada | Todas |
| Accion realizada | Mostrar estado de servidor y bloquear operaciones sensibles si corresponde |
| Endpoint involucrado | Futuro `GET /health` |
| Tabla afectada | Ninguna |
| Estado esperado | Mensaje claro: `Servidor no disponible` |
| Posibles errores | n8n sin ejecuciones, red local caída, Airtable caído |
| Recuperacion | Reintentar; evitar venta offline hasta diseñar cola segura |

## Estados Minimos Para Operar

```txt
CAJA: abierta, cerrada, error
VENTAS: pendiente, confirmada, anulada, rollback_pendiente
MOVIMIENTOS_CAJA: confirmado, anulado, rollback
MOVIMIENTOS_STOCK: confirmado, anulado, rollback
```

## Reglas De Recuperacion

- Si falla antes de confirmar venta: no mostrar venta como exitosa.
- Si falla despues de tocar stock/caja: marcar `RollbackPendiente`.
- Si se anula venta confirmada: crear movimientos inversos, no borrar.
- Si n8n no responde: bloquear cobrar y mostrar `Servidor no disponible`.
- Si caja no esta abierta: bloquear cobrar.
