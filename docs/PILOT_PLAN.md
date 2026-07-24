# Pilot Plan

Mision 009: Certificacion pre-produccion.

Estado objetivo: primera instalacion piloto controlada.

## Objetivos del piloto

- Validar CASERITAS OS en una jornada real de comercio con bajo riesgo.
- Confirmar que productos, caja, venta, historial y anulacion funcionan contra n8n/Airtable.
- Medir estabilidad operativa durante apertura, ventas, movimientos, cierre y recuperacion ante errores.
- Detectar brechas antes de habilitar uso diario completo.
- Confirmar que el personal puede operar el sistema sin asistencia tecnica constante.

## Comercio piloto

Comercio sugerido:

- Nombre: Caseritas piloto.
- Tipo: pequeno comercio de alimentos/congelados.
- Pais: Uruguay.
- Modalidad: una caja, un cajero principal, un encargado.
- Volumen objetivo: 10 a 30 ventas durante la jornada piloto.

Condiciones del piloto:

- Usar productos reales con stock controlado.
- Empezar con un subconjunto pequeno de productos.
- Evitar promociones complejas.
- No operar sin internet.
- Mantener registro manual paralelo durante el primer dia.

## Duracion

Fase 0: preparacion tecnica.

- Duracion estimada: 1 dia.
- Resultado: workflows importados, Airtable preparado, app publicada y prueba de humo aprobada.

Fase 1: venta real controlada.

- Duracion estimada: 1 jornada corta.
- Resultado: apertura, una venta real, historial, cierre y revision de registros.

Fase 2: jornada piloto completa.

- Duracion estimada: 1 a 3 dias.
- Resultado: operacion diaria con monitoreo cercano.

Fase 3: decision.

- Duracion estimada: 1 reunion de revision.
- Resultado: continuar, corregir o volver atras.

## Metricas

### Operativas

- Cantidad de ventas procesadas.
- Cantidad de ventas rechazadas correctamente.
- Cantidad de anulaciones realizadas.
- Cantidad de movimientos manuales de caja.
- Tiempo promedio para registrar una venta.
- Tiempo de apertura de caja.
- Tiempo de cierre de caja.

### Tecnicas

- Porcentaje de respuestas exitosas n8n.
- Cantidad de timeouts.
- Cantidad de errores Airtable.
- Cantidad de operaciones `RollbackPendiente`.
- Cantidad de operaciones desconocidas.
- Duplicados por `operationId`.
- Diferencias de stock.
- Diferencias de caja.

### Calidad de datos

- Ventas con detalle completo.
- Ventas con movimiento de stock.
- Ventas con movimiento de caja.
- Sesiones de caja cerradas correctamente.
- Anulaciones con motivo y movimientos inversos.

## Criterios de exito

El piloto se considera exitoso si:

- Se abre caja desde backend.
- Se procesa al menos una venta real sin duplicados.
- Cada venta crea `VENTAS`, `DETALLE_VENTA`, `MOVIMIENTOS_STOCK` y `MOVIMIENTOS_CAJA`.
- El stock baja correctamente.
- El historial server-side muestra las ventas.
- El cierre de caja calcula el total esperado desde backend.
- No hay ventas duplicadas.
- No hay stock negativo no explicado.
- No hay movimientos de caja sin venta o motivo.
- Los errores muestran mensajes comprensibles.
- El personal puede completar la jornada con apoyo minimo.

## Criterios para volver atras

Volver a registro manual si ocurre cualquiera de estos casos:

- n8n no tiene ejecuciones disponibles.
- Airtable no responde de forma estable.
- `POST /venta` crea registros parciales sin rollback claro.
- Se duplica una venta confirmada.
- Se descuenta stock dos veces por una sola venta.
- Caja no puede cerrarse.
- Historial no refleja ventas reales.
- Aparecen diferencias de caja no explicables por movimientos.
- Una anulacion restaura stock/caja dos veces.
- El comercio no puede operar por mas de 15 minutos.

## Alcance permitido durante piloto

- POS.
- Productos reales desde PRODUCCION.
- Apertura de caja.
- Venta.
- Movimientos manuales de caja.
- Historial del dia.
- Detalle de venta.
- Anulacion controlada.
- Cierre de caja.

## Alcance no permitido durante piloto

- Uso offline para vender.
- Dashboard como fuente operativa.
- Compras.
- Produccion operativa avanzada.
- Gestion completa de usuarios/roles.
- Ventas con promociones complejas.
- Facturacion fiscal.

## Roles

| Rol | Responsabilidad |
|---|---|
| Cajero | Operar POS, caja, movimientos y cierre |
| Encargado | Autorizar anulaciones y revisar diferencias |
| Responsable tecnico | Monitorear n8n, Airtable y errores |
| Responsable de negocio | Decidir continuar, pausar o volver atras |

## Decision final

Al terminar el piloto, revisar:

- registros Airtable;
- ejecuciones n8n;
- diferencias de caja;
- diferencias de stock;
- errores reportados por usuarios;
- tiempo de operacion;
- confianza del comercio.

Resultado posible:

- Aprobado para ampliar piloto.
- Aprobado con correcciones menores.
- Bloqueado hasta corregir brechas.
- Vuelta temporal a operacion manual.

