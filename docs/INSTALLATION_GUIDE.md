# Installation Guide

Mision 009: instalacion desde repositorio vacio hasta sistema funcionando.

## 1. Preparar cuentas

1. Crear o confirmar cuenta GitHub.
2. Crear o confirmar repositorio `caseritas-pos`.
3. Crear o confirmar cuenta n8n Cloud.
4. Crear o confirmar cuenta Airtable.
5. Confirmar acceso del responsable tecnico a GitHub, n8n y Airtable.

## 2. Obtener el repositorio

Desde un equipo nuevo:

1. Instalar GitHub Desktop.
2. Iniciar sesion con la cuenta GitHub.
3. Clonar el repositorio `caseritas-pos`.
4. Abrir la carpeta local.
5. Confirmar que existen:

```txt
index.html
styles.css
js/
views/
n8n-workflows/
docs/
```

## 3. Revisar configuracion frontend

1. Abrir `js/config.js`.
2. Confirmar:

```js
export const API_BASE =
  "https://gweinstein26.app.n8n.cloud/webhook";

export const USE_LOCAL_FALLBACK = false;
```

3. No activar fallback local en piloto.

## 4. Publicar frontend

Opcion recomendada: GitHub Pages.

1. Abrir repositorio en GitHub.
2. Ir a Settings.
3. Ir a Pages.
4. Seleccionar rama principal.
5. Seleccionar carpeta raiz.
6. Guardar.
7. Esperar URL publica.
8. Abrir la URL en navegador.

## 5. Preparar Airtable

1. Abrir la base productiva/piloto.
2. Confirmar Base ID.
3. Crear o revisar tablas:

```txt
PRODUCCION
CLIENTES
VENTAS
DETALLE_VENTA
MOVIMIENTOS_STOCK
CAJAS
SESIONES_CAJA
MOVIMIENTOS_CAJA
```

4. Confirmar campos exactos segun `docs/DATABASE.md`.
5. Cargar productos piloto.
6. Revisar stock inicial.
7. Exportar backup inicial.

## 6. Importar workflows n8n

1. Entrar a n8n Cloud.
2. Ir a Workflows.
3. Importar archivos desde `n8n-workflows/`.
4. Importar al menos:

```txt
productos.json
producto.json
clientes.json
venta.json
caja-abrir.json
caja-estado.json
caja-movimiento.json
caja-cerrar.json
ventas-historial.json
venta-detalle.json
venta-anular.json
```

5. Abrir cada workflow.
6. Configurar credencial Airtable.
7. Confirmar Base ID y Table IDs/nombres.
8. Activar workflows.

## 7. Probar endpoints

Desde navegador o herramienta de prueba:

1. Probar productos:

```txt
GET /productos?text=papas
```

2. Probar producto por codigo:

```txt
GET /producto?code=CODIGO_REAL
```

3. Probar caja:

```txt
POST /caja/abrir
POST /caja/estado
POST /caja/movimiento
POST /caja/cerrar
```

4. Probar venta:

```txt
POST /venta
```

5. Probar historial/anulacion:

```txt
POST /ventas/historial
POST /venta/detalle
POST /venta/anular
```

## 8. Configurar equipo del comercio

1. Abrir URL publica en el navegador principal.
2. Guardar acceso directo.
3. Probar impresion del navegador.
4. Confirmar lector de codigo de barras si existe.
5. Confirmar conexion a internet.
6. Preparar plan de hotspot.

## 9. Prueba de humo

Ejecutar:

1. Buscar producto.
2. Abrir caja.
3. Registrar venta de prueba.
4. Ver historial.
5. Ver detalle.
6. Anular venta de prueba si corresponde.
7. Cerrar caja.

Resultado esperado:

- No hay errores de servidor.
- Airtable refleja todos los registros.
- n8n muestra ejecuciones exitosas.

## 10. Preparar dia piloto

1. Hacer backup de Airtable.
2. Confirmar productos y stock.
3. Confirmar responsable tecnico disponible.
4. Confirmar registro manual paralelo.
5. Confirmar criterios de vuelta atras.
6. Iniciar jornada piloto.

## Tiempo estimado

| Etapa | Tiempo |
|---|---:|
| Clonar y revisar repo | 15 min |
| Publicar GitHub Pages | 15 a 30 min |
| Preparar Airtable | 60 a 120 min |
| Importar workflows n8n | 45 a 90 min |
| Pruebas de humo | 45 a 90 min |
| Preparacion comercio | 30 a 60 min |
| Total estimado | 3 a 6 horas |

