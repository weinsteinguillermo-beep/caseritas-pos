# CASERITAS OS

Prototipo frontend de punto de venta para un pequeño comercio de productos congelados. Funciona con HTML, CSS y JavaScript puro, sin frameworks, sin npm, sin dependencias y sin conexión directa a Airtable.

## Demo v0.1

Esta versión agrega una capa visual de demo comercial sin cambiar la arquitectura ni la lógica existente:

- pantalla de carga inicial;
- transiciones suaves entre vistas;
- notificaciones tipo toast;
- indicadores visuales de búsqueda y cobro;
- estados táctiles para tablet;
- navegación lateral con iconografía;
- mejor jerarquía visual para el POS;
- animaciones con soporte para `prefers-reduced-motion`.

Todo sigue funcionando con datos simulados locales. No se conecta Airtable, n8n ni impresoras.

## Cómo ejecutar localmente

Abrí `index.html` directamente en el navegador. No hace falta instalar nada ni iniciar un servidor.

También podés usar cualquier servidor estático local si querés probarlo desde una URL local, pero no es obligatorio para este prototipo.

## Funcionalidades incluidas

- Aplicación de una sola página con navegación interna.
- Vista POS funcional para nueva venta.
- Buscador grande para nombre de producto o código de barras.
- Catálogo local de productos simulados con id, nombre, código, precio, peso y stock.
- Agregado rápido al carrito sin duplicar productos.
- Aumento, disminución y eliminación de cantidades.
- Recalculo automático de subtotal, descuento y total final.
- Modal de producto no encontrado con carga rápida.
- Cálculo de importe por precio por kilogramo y peso en gramos.
- Métodos de pago: efectivo, tarjeta y transferencia.
- Campo de efectivo recibido y cálculo de vuelto.
- Validaciones antes de cobrar.
- Confirmación visual de cobro y limpieza de carrito.
- Vistas preparadas para Clientes, Productos, Producción, Caja, Reportes y Configuración.

## Arquitectura actual

El proyecto está organizado en módulos para separar responsabilidades y permitir crecimiento sin mezclar interfaz, lógica de negocio, navegación y comunicación externa.

- `index.html`: único HTML de la aplicación. Contiene el encabezado, la barra lateral y el contenedor central de vistas.
- `styles.css`: diseño base existente. No requiere frameworks.
- `js/config.js`: configuración general. Contiene `API_BASE_URL`.
- `js/utils.js`: utilidades compartidas de moneda, fechas, validación y sanitización.
- `js/api.js`: clase `CaseritasAPI`. Es el único archivo que puede usar `fetch()`.
- `js/pos.js`: clase `POS`. Contiene reglas del punto de venta, carrito, descuento, vuelto y cobro.
- `js/ui.js`: clase `UI`. Centraliza DOM, mensajes, modales, carrito, totales e indicadores de carga.
- `js/router.js`: router SPA propio.
- `js/main.js`: punto de entrada. Inicializa API, POS y Router.
- `views/`: vistas cargadas dinámicamente por el router.

## Router SPA

El router usa el hash de la URL, por ejemplo `#pos` o `#clientes`, para cambiar de vista sin recargar la página y sin abrir otros archivos HTML.

Cada ruta define:

- `id`: identificador de navegación.
- `label`: nombre mostrado en la barra lateral.
- `icon`: marca breve para la opción.
- `script`: archivo de vista a cargar bajo demanda.
- `viewName`: nombre registrado en `window.CaseritasViews`.

Cada vista debe exponer:

```js
render()
init(context)
destroy()
```

- `render()` devuelve el HTML de la vista.
- `init(context)` conecta eventos y recibe dependencias compartidas como `api` y `pos`.
- `destroy()` limpia listeners o recursos cuando se cambia a otra vista.

Las vistas se cargan dinámicamente insertando su script la primera vez que se navega a ellas. Luego quedan disponibles en memoria para visitas posteriores.

## Vistas disponibles

- `views/pos.js`: punto de venta funcional.
- `views/clientes.js`: preparada para clientes.
- `views/productos.js`: preparada para inventario.
- `views/produccion.js`: preparada para producción.
- `views/caja.js`: preparada para caja.
- `views/reportes.js`: preparada para reportes.
- `views/configuracion.js`: preparada para configuración.

## Configuración para n8n

`js/config.js` contiene:

```js
const API_BASE_URL = "";
```

Mientras ese valor esté vacío, la aplicación usa datos simulados en memoria desde `js/api.js`, por lo que sigue funcionando sin servidor y es compatible con GitHub Pages.

Cuando los webhooks de n8n estén listos, reemplazá el valor vacío por la URL base del webhook:

```js
const API_BASE_URL = "https://tu-instancia-n8n/webhook/caseritas-pos";
```

No se debe llamar Airtable directamente desde el navegador. n8n será la capa intermedia segura entre GitHub Pages y Airtable.

## Publicación con GitHub Pages

1. Subí estos archivos a un repositorio de GitHub.
2. Entrá en `Settings > Pages`.
3. En `Build and deployment`, elegí `Deploy from a branch`.
4. Seleccioná la rama principal y la carpeta raíz.
5. Guardá los cambios y esperá a que GitHub publique la página.

Como el prototipo usa archivos estáticos, GitHub Pages puede servirlo sin pasos de compilación.

## Seguridad y validación

El prototipo evita insertar HTML ingresado por el usuario y muestra textos mediante `textContent` en las partes dinámicas de datos. Los campos numéricos se validan antes de calcular importes, descuentos, vuelto y cobros. No hay claves, tokens ni credenciales en el frontend.
