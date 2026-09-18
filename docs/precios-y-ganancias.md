# Precios, costos y ganancias

Proyecto Supabase: `jhatiafagmtjbgbawptt`. Las migraciones de precios, márgenes e integridad de traspasos están aplicadas. El 18 de septiembre de 2026 se aplicó `20260918020000_inventory_transfer_integrity.sql` y se verificó el flujo completo en Supabase mediante una transacción revertida al terminar.

## Antes de empezar

En **Inventario → Costos y ganancias → Costos del inventario**, configura el costo de las existencias anteriores. No se estiman automáticamente: un costo desconocido se muestra como **Sin costo** y bloquea nuevos traspasos o salidas de venta de ese producto.

- En el principal, captura el costo promedio de compra en ambos campos.
- En el secundario, el costo del almacén es el precio interno promedio que pagó; el costo original es el costo promedio de compra al proveedor.
- Usa importes comparables en todos los pasos. El sistema calcula diferencias entre los importes registrados; no separa IVA, fletes, impuestos o descuentos del proveedor automáticamente.

## Operación

1. **Movimientos → Nuevo movimiento → Compra**: selecciona almacén principal, producto, cantidad y costo por unidad. Las nuevas entradas recalculan los costos promedio ponderados.
2. **Traspasos**: selecciona principal y secundario, cantidad y precio interno por unidad. Cada producto muestra existencias, reservas y disponible de ambos almacenes, sus costos actuales, precios de venta y cantidades previstas. Puedes configurar los costos directamente desde esta pantalla. Al completar, el precio interno entra como costo del secundario, mientras se conserva el costo original del negocio. El traspaso no altera las listas de venta.
3. **Producto → Precios**: configura importes en las listas de público, mayoreo o las que ya utilices. Puedes vincular una lista a cada almacén para sugerirla al agente.
4. **Confirmar pedido**: el agente selecciona cliente, sucursal, almacén de salida y lista de venta. El servidor obtiene los precios de la lista y crea el pedido y sus productos en una sola transacción.
5. **Enviar o entregar**: descuenta inventario disponible y conserva los costos de esa salida. Pasar de enviado a entregado no vuelve a descontar. El crédito debe estar aprobado.
6. **Cancelar y reintegrar**: devuelve las piezas al almacén con los costos registrados en la venta y excluye esa venta del reporte. Los pagos permanecen registrados y deben conciliarse o devolverse por separado.

Un pedido con salida registrada ya no permite cambiar productos, cantidades, precios, lista ni almacén. En pedidos anteriores que siguen pendientes puedes seleccionar el almacén desde el detalle.

Los traspasos usan las existencias sin ubicación; no mezclan cantidades de distintas ubicaciones. Guardar un borrador no reserva ni mueve piezas. Al completarlo se vuelve a comprobar el disponible. Solo permiten almacenes activos, una partida por producto y cantidades disponibles. El guardado y la edición son transacciones completas: un error no deja encabezados huérfanos ni borra las partidas anteriores.

Si el destino ya tiene existencias sin costos registrados, configura también sus costos actuales. Un traspaso nuevo no puede reconstruir el costo de esas piezas anteriores. Un costo de cero es válido; un costo desconocido se mantiene como «Sin costo».

## Reporte

**Costos y ganancias → Ventas y márgenes** permite filtrar por fecha de salida (hora de Ciudad de México), producto, almacén y vendedor. El vendedor corresponde al usuario que creó el pedido.

| Concepto por unidad | Ejemplo |
|---|---:|
| Costo original de compra | $100 |
| Precio interno / costo del secundario | $130 |
| Venta al público | $180 |
| Margen del almacén de venta | $50 |
| Margen interno acumulado | $30 |
| Ganancia bruta total del negocio | $80 |

El margen interno acumulado se reconoce en este reporte junto con la venta al cliente; el simple movimiento entre tus almacenes no genera una venta externa. Con varios traspasos representa el margen acumulado de los almacenes anteriores.

Los cobros y saldos se cuentan una vez por pedido. Al filtrar productos, corresponden a los pedidos completos que contienen esos productos. No equivalen a ganancia cobrada. El reporte muestra ganancia bruta descontando garantías autorizadas; no descuenta gastos, comisiones, reembolsos ni impuestos. Las solicitudes pendientes de aprobación no afectan ganancias. Consulta `descuentos-garantias-notificaciones.md` para el flujo de aprobación y reposición.

Los pedidos anteriores ya enviados, entregados o cancelados se conservan sin activar retroactivamente las nuevas salidas automáticas ni inventar costos históricos. Los pedidos pendientes anteriores sí pueden utilizar el nuevo flujo.

## Verificación

- Se aplicaron todas las migraciones reales sobre PostgreSQL con PGlite y se probaron compras, traspasos, público/mayoreo, márgenes, costos históricos, cancelaciones, inventario insuficiente, transacciones y permisos de agentes/clientes.
- Se verificó el flujo en Supabase real mediante una transacción revertida al terminar, sin conservar productos ni pedidos de prueba.

Para repetir las pruebas locales:

```powershell
npm install --prefix scratch/pricing-tests --no-package-lock --no-save @electric-sql/pglite
node scratch/pricing-tests/run.mjs
node scratch/pricing-tests/service-check.cjs
node scratch/pricing-tests/product-info-check.cjs
```

Prueba en Supabase (requiere administrador y una sucursal existentes; revierte sus datos de prueba):

```powershell
npx supabase db query --linked --file scratch/pricing-tests/remote-verify.sql
```

La compilación con Vite y la revisión de inventario con oxlint pasan. La comprobación TypeScript del proyecto completo sigue encontrando errores anteriores en otros módulos (catálogo, flotilla y pedidos); no reporta errores en inventario. La verificación del componente de información del traspaso se hizo con renderizado de React; queda pendiente la revisión visual interactiva en navegador.
