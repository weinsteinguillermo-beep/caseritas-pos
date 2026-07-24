# Scanner Lab

## Objetivo

Mejorar el flujo de escaneo de codigos de barras.

## Ideas

- Detectar scanner como entrada rapida.
- Buscar producto por codigo exacto.
- Evitar busqueda textual cuando el input parece barcode.
- Mostrar aviso si el producto no existe.
- Agregar modo inventario para conteo por scanner.

## Requisitos

- Campo `codigo_barras`.
- Endpoint `/producto?code=...`.
- Producto con stock disponible.

## Riesgos

- Codigos duplicados.
- Codigos mal cargados.
- Scanner enviando Enter inesperado.

## Proxima Exploracion

Probar scanner fisico y documentar comportamiento del input.
