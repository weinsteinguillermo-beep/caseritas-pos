# CASERITAS OS

Frontend estatico de punto de venta para Caseritas POS.

La aplicacion trabaja con datos reales a traves de n8n. No accede directamente a Airtable y no activa datos locales salvo que se habilite manualmente el modo de desarrollo.

## URL publica

URL esperada de GitHub Pages:

```txt
https://weinsteinguillermo-beep.github.io/caseritas-pos/
```

Repositorio:

```txt
https://github.com/weinsteinguillermo-beep/caseritas-pos
```

## Como ejecutar

Publicar con GitHub Pages o servir la carpeta con un servidor estatico local.

No requiere npm, build ni dependencias frontend. Al usar modulos JavaScript, algunos navegadores bloquean imports si se abre `index.html` directamente como archivo local.

## Configuracion API

`js/config.js` contiene:

```js
export const API_BASE =
  "https://gweinstein26.app.n8n.cloud/webhook";

export const USE_LOCAL_FALLBACK = false;
```

URL base de n8n:

```txt
https://gweinstein26.app.n8n.cloud/webhook
```

Endpoints utilizados:

```txt
GET  /productos?text=texto
GET  /producto?code=7790000000000
GET  /clientes?text=texto
POST /venta
```

## Consumo de n8n

n8n tiene limite mensual de ejecuciones. Para reducir consumo:

- el POS no consulta productos con busquedas vacias;
- exige minimo 2 caracteres antes de consultar productos;
- aplica debounce de 500 ms al campo de busqueda;
- evita repetir una consulta identica si el texto no cambio;
- no hace fallback automatico si n8n no responde.

Recomendacion operativa: no consultar en cada pulsacion directa contra n8n. Mantener siempre debounce y minimo de caracteres.

## Modo de desarrollo

`USE_LOCAL_FALLBACK` debe quedar en `false` para produccion.

Si se cambia manualmente a `true`, el POS permite un conjunto pequeno de productos locales solo para desarrollo. Este modo no se activa automaticamente cuando n8n falla.

## Arquitectura

- `index.html`: estructura principal de la aplicacion.
- `styles.css`: estilos existentes.
- `js/config.js`: URL base de n8n y bandera de fallback controlado.
- `js/api.js`: capa API desacoplada. Es el unico archivo que usa `fetch()`.
- `js/utils.js`: utilidades compartidas.
- `js/pos.js`: logica del punto de venta, carrito, descuento, vuelto y cobro.
- `js/ui.js`: DOM, mensajes, modales, carrito, totales e indicadores.
- `js/router.js`: router SPA.
- `js/main.js`: punto de entrada.
- `views/`: vistas cargadas por el router.
- `n8n-workflows/`: workflows importables para n8n Cloud.

## n8n y Airtable

Los workflows importables estan en `n8n-workflows/`:

- `productos.json`
- `producto.json`
- `clientes.json`
- `venta.json`

La tabla PRODUCCION usa estos campos reales para productos:

```txt
Name
Codigo de Barras
Importe
Precio x Kg
Peso
Stock Actual
```

Ver `n8n-workflows/README.md` para importar workflows, configurar credenciales Airtable, confirmar tablas esperadas y probar URLs.

## Publicar con GitHub Desktop

1. Abrir GitHub Desktop.
2. Seleccionar el repositorio `caseritas-pos`.
3. Revisar los cambios pendientes.
4. Escribir un resumen de commit.
5. Presionar `Commit to main` o la rama activa.
6. Presionar `Push origin`.
7. En GitHub, revisar `Settings > Pages`.
8. Confirmar que GitHub Pages publique desde la rama y carpeta configuradas.
9. Abrir la URL publica del POS.

## Seguridad

No hay claves, tokens ni credenciales en el frontend.

Airtable queda protegido detras de n8n. GitHub Pages solo consume webhooks publicos configurados para responder con CORS.
