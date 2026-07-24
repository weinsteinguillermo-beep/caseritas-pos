# Frontend Flow V1

Mision 002: propuesta frontend sin rediseño visual.

No se propone cambiar la estetica. La idea es extender la arquitectura actual con estados operativos y pantallas ya existentes.

## Estado Global Requerido

El frontend necesita un estado operativo compartido:

```txt
empresa_id
usuario_id
caja_id
caja_estado
caja_abierta_en
formas_pago
server_status
```

Este estado debe vivir fuera de las vistas individuales para que POS, Caja y Reportes lo compartan.

## Flujo De Apertura De Caja

Pantalla: Caja.

Propuesta:

1. Si no hay caja abierta, mostrar formulario de apertura.
2. Seleccionar usuario/cajero.
3. Ingresar saldo inicial.
4. Confirmar apertura.
5. Guardar `caja_id` y `usuario_id` en estado de app.
6. Volver al POS o dejar acceso claro.

Endpoint futuro:

```txt
POST /caja/apertura
```

## Indicador De Caja Abierta/Cerrada

Ubicacion propuesta:

- header existente, reemplazando/extendiendo el estado actual.

Estados:

```txt
Servidor disponible / no disponible
Caja abierta / caja cerrada
Usuario activo
```

Regla:

- si caja cerrada: indicador visible y POS bloqueado para cobrar.

## Bloqueo De Ventas Sin Caja Abierta

Comportamiento:

- permitir buscar productos y armar carrito si se decide operativamente;
- bloquear boton `Cobrar`;
- mostrar mensaje: `Abrí caja para registrar ventas`;
- CTA hacia vista Caja.

Recomendacion:

- bloquear cobrar, no necesariamente bloquear búsqueda. Esto permite preparar ventas mientras un encargado abre caja, pero evita inconsistencias.

## Selector De Forma De Pago

Estado actual:

- radio buttons hardcodeados: efectivo, tarjeta, transferencia.

Propuesta V1:

- mantener el control visual actual;
- cargar opciones desde `GET /formas-pago`;
- fallback solo visual si n8n no esta disponible no debe permitir cobrar;
- cada opcion debe mapear a `forma_pago_id`.

## Confirmacion De Venta

Antes de enviar `POST /venta`:

- bloquear doble clic;
- generar `operationId`;
- mostrar estado `Registrando venta...`;
- mantener carrito hasta respuesta exitosa.

Despues de exito:

- limpiar carrito;
- mostrar confirmacion;
- ofrecer comprobante;
- actualizar historial del dia y resumen de caja.

Si falla:

- conservar carrito;
- mostrar mensaje amigable;
- si respuesta contiene `RollbackPendiente`, mostrar alerta de revision.

## Comprobante De Venta

V1 sin impresora:

- modal o vista simple post-venta;
- numero de venta;
- fecha;
- productos;
- total;
- forma de pago;
- vuelto si efectivo.

Futuro:

- imprimir usando navegador;
- generar PDF;
- integracion con impresora termica solo cuando el hardware este definido.

## Historial Del Dia

Pantalla propuesta:

- Reportes o nueva seccion dentro de POS/Caja.

Datos:

```txt
ventas confirmadas
ventas anuladas
ventas rollback_pendiente
total por forma de pago
acciones: ver detalle, anular
```

Endpoint futuro:

```txt
GET /ventas?date=YYYY-MM-DD&cajaId=...
```

## Cierre De Caja

Pantalla: Caja.

Flujo:

1. Mostrar caja abierta.
2. Mostrar ventas del dia y movimientos manuales.
3. Mostrar saldo esperado por forma de pago.
4. Ingresar efectivo contado.
5. Calcular diferencia.
6. Si diferencia distinta de cero, exigir observacion.
7. Confirmar cierre.
8. Bloquear nuevas ventas.

Endpoint futuro:

```txt
POST /caja/cierre
```

## Errores De Conexion

Reglas UI:

- mostrar `Servidor no disponible`;
- bloquear operaciones sensibles: abrir caja, cobrar, anular, cerrar caja;
- no activar fallback local automaticamente;
- mantener carrito local mientras no se confirme venta.

## Cambios Frontend Recomendados Sin Rediseño

1. Crear estado operativo compartido.
2. Agregar `operationId` en venta.
3. Agregar bloqueo de cobrar si caja no esta abierta.
4. Extender vista Caja con apertura/cierre.
5. Agregar historial simple del dia.
6. Agregar comprobante post-venta.
7. Convertir formas de pago hardcodeadas en opciones configurables.

## Deuda UX Actual

- El header dice datos locales, aunque el sistema trabaja con n8n.
- Vista Caja es placeholder.
- Vista Reportes es placeholder.
- Alta rapida de producto no corresponde al flujo real de datos.
- No hay comprobante ni historial.
