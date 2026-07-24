# Acceptance Tests V1

Mision 002: pruebas manuales para validar un dia operativo.

Estas pruebas son objetivo V1. Algunas fallaran hoy porque las capacidades estan diseñadas pero no implementadas.

## A. Apertura De Caja

### Precondiciones

- Empresa activa.
- Usuario con rol cajero o encargado.
- No existe caja abierta para el mismo punto de venta.

### Datos De Prueba

- `empresa_id`: empresa demo.
- `usuario_id`: cajero demo.
- saldo inicial: UYU 2.000.

### Pasos

1. Entrar a Caja.
2. Seleccionar usuario/cajero.
3. Ingresar saldo inicial.
4. Confirmar apertura.

### Resultado Esperado

- Caja queda `abierta`.
- POS muestra indicador de caja abierta.
- Boton Cobrar queda habilitable si hay carrito valido.

### Registros Que Deberian Quedar Creados

- `CAJA` con estado `abierta`.
- Opcional `MOVIMIENTOS_CAJA` tipo `Apertura`.

### Registros Que No Deberian Modificarse

- `VENTAS`.
- `PRODUCTOS`.
- `MOVIMIENTOS_STOCK`.

## B. Venta En Efectivo

### Precondiciones

- Caja abierta.
- Usuario activo.
- Producto con stock suficiente.

### Datos De Prueba

- Producto: papas.
- Cantidad: 1.
- Forma de pago: efectivo.
- Efectivo recibido: mayor o igual al total.

### Pasos

1. Buscar producto.
2. Agregar al carrito.
3. Seleccionar efectivo.
4. Ingresar efectivo recibido.
5. Presionar Cobrar.

### Resultado Esperado

- Venta confirmada.
- Vuelto calculado.
- Carrito queda limpio.

### Registros Que Deberian Quedar Creados

- `VENTAS`.
- `DETALLE_VENTA`.
- `MOVIMIENTOS_STOCK` con cantidad negativa.
- `MOVIMIENTOS_CAJA` ingreso efectivo.

### Registros Que No Deberian Modificarse

- `CLIENTES`, salvo que se haya seleccionado cliente.
- `COMPRAS`.

## C. Venta Con Tarjeta

### Precondiciones

- Caja abierta.
- Producto con stock suficiente.

### Datos De Prueba

- Forma de pago: tarjeta.
- No se ingresa efectivo recibido.

### Pasos

1. Agregar producto al carrito.
2. Seleccionar tarjeta.
3. Presionar Cobrar.

### Resultado Esperado

- Venta confirmada.
- No se calcula vuelto.
- Movimiento de caja identifica tarjeta.

### Registros Que Deberian Quedar Creados

- `VENTAS`.
- `DETALLE_VENTA`.
- `MOVIMIENTOS_STOCK`.
- `MOVIMIENTOS_CAJA` con forma de pago tarjeta.

### Registros Que No Deberian Modificarse

- Saldo de efectivo contado, salvo que la politica incluya tarjeta en caja esperada.

## D. Stock Insuficiente

### Precondiciones

- Caja abierta.
- Producto existe con stock menor a cantidad solicitada.

### Datos De Prueba

- Stock actual: 1.
- Cantidad solicitada: 2.

### Pasos

1. Agregar producto.
2. Aumentar cantidad a 2.
3. Cobrar.

### Resultado Esperado

- La venta se rechaza con mensaje amigable.
- No se descuenta stock.

### Registros Que Deberian Quedar Creados

- Ninguno, salvo registro de auditoria futuro.

### Registros Que No Deberian Modificarse

- `VENTAS`.
- `DETALLE_VENTA`.
- `MOVIMIENTOS_STOCK`.
- `MOVIMIENTOS_CAJA`.
- `PRODUCTOS.stock_actual`.

## E. Producto Inexistente

### Precondiciones

- Caja abierta.

### Datos De Prueba

- Codigo inexistente: `9999999999999`.

### Pasos

1. Escanear codigo inexistente.
2. Intentar agregar/cobrar.

### Resultado Esperado

- Producto no encontrado.
- No se crea venta.

### Registros Que Deberian Quedar Creados

- Ninguno.

### Registros Que No Deberian Modificarse

- Todas las tablas operativas.

## F. Doble Clic En Cobrar

### Precondiciones

- Caja abierta.
- Carrito valido.
- Frontend genera `operationId`.

### Datos De Prueba

- Una venta simple.

### Pasos

1. Presionar Cobrar dos veces rapidamente.
2. Esperar respuesta.

### Resultado Esperado

- Solo existe una venta confirmada.
- Segunda respuesta devuelve venta existente o queda bloqueada en UI.

### Registros Que Deberian Quedar Creados

- Una `VENTAS`.
- Un conjunto de `DETALLE_VENTA`.
- Un conjunto de `MOVIMIENTOS_STOCK`.
- Un movimiento de caja.

### Registros Que No Deberian Modificarse

- No debe duplicarse stock ni caja.

## G. Perdida De Conexion

### Precondiciones

- Caja abierta.
- Carrito valido.

### Datos De Prueba

- Simular n8n no disponible.

### Pasos

1. Cortar conexion o desactivar endpoint.
2. Presionar Cobrar.

### Resultado Esperado

- Mensaje `Servidor no disponible`.
- Venta no aparece como confirmada.
- Carrito no se pierde automaticamente.

### Registros Que Deberian Quedar Creados

- Ninguno si la request no llego.
- Si llego parcialmente, venta debe quedar `RollbackPendiente`.

### Registros Que No Deberian Modificarse

- Stock y caja no deben cambiar sin venta confirmada.

## H. Anulacion De Venta

### Precondiciones

- Venta confirmada.
- Usuario con permiso de anulacion.
- Caja abierta o politica definida para anulacion con caja cerrada.

### Datos De Prueba

- Motivo: error de cobro.

### Pasos

1. Abrir historial del dia.
2. Seleccionar venta.
3. Presionar Anular.
4. Ingresar motivo.
5. Confirmar.

### Resultado Esperado

- Venta queda `anulada`.
- Stock vuelve mediante movimiento inverso.
- Caja registra movimiento inverso.

### Registros Que Deberian Quedar Creados

- `MOVIMIENTOS_STOCK` tipo anulacion/devolucion.
- `MOVIMIENTOS_CAJA` tipo anulacion.
- Auditoria futura.

### Registros Que No Deberian Modificarse

- La venta original no se borra.
- Detalle original no se borra.

## I. Ingreso Manual De Caja

### Precondiciones

- Caja abierta.
- Usuario autorizado.

### Datos De Prueba

- Importe: UYU 500.
- Concepto: aporte de cambio.

### Pasos

1. Ir a Caja.
2. Crear movimiento ingreso.
3. Ingresar concepto e importe.
4. Confirmar.

### Resultado Esperado

- Movimiento confirmado.
- Caja esperada aumenta.

### Registros Que Deberian Quedar Creados

- `MOVIMIENTOS_CAJA` tipo ingreso manual.

### Registros Que No Deberian Modificarse

- `VENTAS`.
- `MOVIMIENTOS_STOCK`.

## J. Egreso Manual De Caja

### Precondiciones

- Caja abierta.
- Usuario autorizado.

### Datos De Prueba

- Importe: UYU 300.
- Concepto: compra menor.

### Pasos

1. Ir a Caja.
2. Crear movimiento egreso.
3. Ingresar concepto e importe.
4. Confirmar.

### Resultado Esperado

- Movimiento confirmado.
- Caja esperada disminuye.

### Registros Que Deberian Quedar Creados

- `MOVIMIENTOS_CAJA` tipo egreso manual.

### Registros Que No Deberian Modificarse

- `VENTAS`.
- `PRODUCTOS`.

## K. Cierre De Caja

### Precondiciones

- Caja abierta.
- No hay operaciones `RollbackPendiente`.

### Datos De Prueba

- Efectivo contado: monto real.

### Pasos

1. Ir a Caja.
2. Revisar resumen de movimientos.
3. Ingresar efectivo contado.
4. Confirmar cierre.

### Resultado Esperado

- Caja queda `cerrada`.
- POS bloquea ventas.
- Resumen final visible.

### Registros Que Deberian Quedar Creados

- Actualizacion de `CAJA` con cierre.
- Opcional movimiento tipo cierre.

### Registros Que No Deberian Modificarse

- Ventas confirmadas.
- Stock.

## L. Diferencia Entre Caja Esperada Y Caja Contada

### Precondiciones

- Caja abierta con movimientos.

### Datos De Prueba

- Caja esperada: UYU 5.000.
- Caja contada: UYU 4.900.

### Pasos

1. Iniciar cierre.
2. Ingresar efectivo contado menor al esperado.
3. Confirmar con observacion.

### Resultado Esperado

- Caja cierra con diferencia `-100`.
- Se registra observacion obligatoria.
- Encargado puede revisar luego.

### Registros Que Deberian Quedar Creados

- Actualizacion de `CAJA` con `saldo_real`, `saldo_esperado`, `diferencia`.
- Auditoria futura.

### Registros Que No Deberian Modificarse

- Movimientos originales de venta.
- Stock.
