# PRODUCTION CHECKLIST V1

Objetivo: listar todo lo necesario antes de declarar "Caseritas OS esta listo para operar."

Estado actual: checklist de preparacion. No implica que los puntos esten cumplidos.

## 1. Datos y Airtable

- [ ] Confirmar Base ID productiva.
- [ ] Confirmar tabla PRODUCCION con campos reales: Name, Codigo de Barras, Importe, Precio x Kg, Peso, Stock Actual.
- [ ] Crear/verificar tabla VENTAS.
- [ ] Crear/verificar tabla DETALLE_VENTA.
- [ ] Crear/verificar tabla CAJA.
- [ ] Crear/verificar tabla MOVIMIENTOS_CAJA.
- [ ] Crear/verificar tabla MOVIMIENTOS_STOCK.
- [ ] Crear/verificar tabla CLIENTES.
- [ ] Agregar empresa_id a registros operativos.
- [ ] Agregar usuario_id a operaciones sensibles.
- [ ] Agregar caja_id a ventas y movimientos.
- [ ] Agregar operationId unico a VENTAS.
- [ ] Agregar estado de venta: confirmada, anulada, rollback_pendiente, error.
- [ ] Agregar numeracion correlativa de venta si se usara comprobante interno.
- [ ] Definir campos obligatorios y defaults.
- [ ] Crear vistas de control para ventas del dia.
- [ ] Crear vistas de control para movimientos de caja.
- [ ] Crear vistas de control para stock negativo o inconsistente.

## 2. n8n

- [ ] Importar workflow productos.
- [ ] Importar workflow producto por codigo.
- [ ] Importar workflow clientes.
- [ ] Importar workflow venta.
- [ ] Configurar credencial Airtable en cada workflow.
- [ ] Activar workflows en modo produccion.
- [ ] Verificar CORS en todos los endpoints usados por GitHub Pages.
- [ ] Probar OPTIONS si aplica al navegador.
- [ ] Probar GET /productos?text=milanesa.
- [ ] Probar GET /producto?code=CODIGO_REAL.
- [ ] Probar GET /clientes?text=CLIENTE.
- [ ] Probar POST /venta con venta valida.
- [ ] Probar POST /venta con stock insuficiente.
- [ ] Probar POST /venta con producto inexistente.
- [ ] Probar POST /venta con total alterado.
- [ ] Probar POST /venta repetido con el mismo operationId.
- [ ] Probar falla forzada despues de crear VENTAS.
- [ ] Probar falla forzada despues de crear DETALLE_VENTA.
- [ ] Probar falla forzada despues de descontar STOCK.
- [ ] Probar falla forzada antes de registrar CAJA.
- [ ] Confirmar rollback compensatorio o estado rollback_pendiente.
- [ ] Documentar limite mensual de ejecuciones y estrategia de ahorro.

## 3. API frontend

- [ ] Confirmar que todas las URLs salen de `API_BASE`.
- [ ] Confirmar que el frontend no accede directo a Airtable.
- [ ] Confirmar que `fetch()` solo se usa en `js/api.js`.
- [ ] Confirmar que errores de conexion muestran "Servidor no disponible".
- [ ] Confirmar mensajes amigables para errores del backend.
- [ ] Confirmar debounce de busqueda de productos.
- [ ] Confirmar minimo de 2 caracteres antes de buscar.
- [ ] Confirmar que no se repite una consulta identica innecesariamente.
- [ ] Confirmar invalidacion de cache de productos luego de venta o stock.
- [ ] Confirmar contrato de respuesta de cada endpoint.

## 4. POS

- [ ] Abrir POS con servidor disponible.
- [ ] Abrir POS con servidor no disponible.
- [ ] Buscar producto por texto.
- [ ] Buscar producto por codigo de barras.
- [ ] Agregar producto al carrito.
- [ ] Cambiar cantidades.
- [ ] Prevenir cantidades imposibles o advertir stock insuficiente.
- [ ] Seleccionar forma de pago.
- [ ] Seleccionar o ingresar cliente.
- [ ] Confirmar venta antes de cobrar.
- [ ] Bloquear cobro si no hay caja abierta.
- [ ] Bloquear doble clic en cobrar.
- [ ] Mantener operationId estable durante intento de venta.
- [ ] Manejar timeout sin duplicar venta.
- [ ] Vaciar carrito solo despues de confirmacion real.
- [ ] Definir comportamiento ante recarga con venta pendiente.

## 5. Caja

- [ ] Abrir caja contra backend.
- [ ] Registrar cajero con usuario_id.
- [ ] Registrar fondo inicial.
- [ ] Bloquear segunda apertura de la misma caja.
- [ ] Mostrar indicador de caja abierta/cerrada.
- [ ] Registrar ventas en caja segun forma de pago.
- [ ] Registrar ingresos manuales contra backend.
- [ ] Registrar egresos manuales contra backend.
- [ ] Asociar todo movimiento a caja_id y usuario_id.
- [ ] Calcular total esperado desde backend.
- [ ] Cerrar caja contra backend.
- [ ] Registrar total contado.
- [ ] Registrar diferencia.
- [ ] Registrar observaciones.
- [ ] Bloquear ventas despues del cierre.

## 6. Historial y comprobantes

- [ ] Consultar ventas del dia desde backend.
- [ ] Filtrar por empresa_id, caja_id y fecha.
- [ ] Buscar por producto, cliente, comprobante o forma de pago.
- [ ] Ver detalle de venta.
- [ ] Reimprimir comprobante dedicado.
- [ ] Registrar numero de comprobante.
- [ ] Evitar que historial dependa solo de localStorage.

## 7. Anulaciones

- [ ] Implementar endpoint de anulacion.
- [ ] Exigir usuario_id.
- [ ] Exigir motivo.
- [ ] Validar que venta exista.
- [ ] Validar que venta no este anulada.
- [ ] No borrar la venta original.
- [ ] Crear movimiento inverso de caja.
- [ ] Crear movimiento inverso de stock.
- [ ] Cambiar estado de venta a anulada.
- [ ] Registrar auditoria de anulacion.
- [ ] Reflejar anulacion en historial y cierre.

## 8. Usuarios y seguridad

- [ ] Definir usuarios reales.
- [ ] Definir roles: administrador, cajero, supervisor.
- [ ] Bloquear operaciones sensibles por rol.
- [ ] Evitar usuario libre escrito como texto para produccion.
- [ ] Registrar usuario_id en ventas, caja, anulaciones y movimientos.
- [ ] Proteger endpoints contra uso no autorizado.
- [ ] Definir estrategia de claves o token para frontend publico.

## 9. Persistencia local

- [ ] Versionar estado guardado en localStorage.
- [ ] Validar estructura al iniciar.
- [ ] Limpiar estado incompatible.
- [ ] Separar cache de UI de datos contables.
- [ ] Definir recuperacion de carrito ante recarga.
- [ ] Definir recuperacion de venta pendiente.
- [ ] Agregar accion operativa para reiniciar estado local sin afectar backend.

## 10. Errores y recuperacion

- [ ] Mostrar error claro si n8n no responde.
- [ ] Mostrar error claro si Airtable falla.
- [ ] Mostrar error claro si hay stock insuficiente.
- [ ] Mostrar error claro si la caja esta cerrada.
- [ ] Mostrar error claro si una venta queda en estado incierto.
- [ ] Documentar procedimiento manual ante rollback_pendiente.
- [ ] Documentar procedimiento manual ante diferencia de caja.
- [ ] Documentar procedimiento manual ante perdida de internet.

## 11. Pruebas manuales obligatorias

- [ ] Apertura de caja.
- [ ] Venta en efectivo.
- [ ] Venta con tarjeta.
- [ ] Venta con stock insuficiente.
- [ ] Producto inexistente.
- [ ] Doble clic en cobrar.
- [ ] Perdida de conexion antes de cobrar.
- [ ] Perdida de conexion despues de enviar venta.
- [ ] Anulacion de venta.
- [ ] Ingreso manual de caja.
- [ ] Egreso manual de caja.
- [ ] Cierre de caja sin diferencia.
- [ ] Cierre de caja con diferencia.
- [ ] Recarga de pagina durante jornada.
- [ ] Recarga de pagina durante venta pendiente.

## 12. Despliegue

- [ ] Confirmar URL publica de GitHub Pages.
- [ ] Confirmar `API_BASE` productivo.
- [ ] Confirmar que `USE_LOCAL_FALLBACK` este en false.
- [ ] Confirmar que no queden datos simulados activos.
- [ ] Confirmar que no haya credenciales en el repositorio.
- [ ] Confirmar que los workflows no incluyan credenciales exportadas.
- [ ] Confirmar que README tenga instrucciones de publicacion.
- [ ] Confirmar que el navegador carga modulos correctamente desde servidor web.

## 13. Operacion del comercio

- [ ] Capacitar apertura de caja.
- [ ] Capacitar busqueda y escaneo.
- [ ] Capacitar cobro.
- [ ] Capacitar lectura de errores.
- [ ] Capacitar movimientos manuales.
- [ ] Capacitar cierre de caja.
- [ ] Capacitar anulaciones.
- [ ] Definir responsable ante incidentes.
- [ ] Definir rutina diaria de control.
- [ ] Definir respaldo/exportacion de datos.

## 14. Criterios Go / No-Go

El sistema puede operar una primera venta real solo si:

- [ ] Productos reales responden desde n8n/Airtable.
- [ ] POST /venta esta probado con exito.
- [ ] OperationId evita duplicados.
- [ ] Stock se valida en backend.
- [ ] Total se recalcula en backend.
- [ ] Venta crea cabecera, detalle, stock y caja.
- [ ] Error parcial deja rollback efectivo o estado recuperable.
- [ ] El frontend muestra exito y error correctamente.

El sistema puede operar un dia completo solo si:

- [ ] Apertura de caja es real.
- [ ] Movimientos de caja son reales.
- [ ] Cierre de caja es real.
- [ ] Historial del dia viene del backend.
- [ ] Anulaciones estan implementadas.
- [ ] Usuarios y permisos minimos estan definidos.
- [ ] Hay procedimiento de recuperacion ante fallas.
- [ ] La checklist de pruebas manuales esta aprobada.

