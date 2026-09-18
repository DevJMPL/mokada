# Descuentos, garantías y notificaciones

Aplicado a Mokada (`jhatiafagmtjbgbawptt`) el 18 de septiembre de 2026 mediante la migración `20260918030000_order_discounts_returns_notifications.sql`.

La migración `20260918040000_customer_warranty_approval.sql` añade aprobación de solicitudes de clientes. Las anteriores sin pedido de reposición vinculado pasan a pendientes; las que ya tienen reposición conservan su autorización.

## Descuentos por producto

En confirmar pedido, agentes y administradores pueden capturar el porcentaje de descuento o el precio final por unidad, junto con su motivo. El importe final debe estar entre cero y el precio de lista. Se conservan el precio de lista, el porcentaje, el motivo y el usuario que acordó el descuento. La lista del producto no cambia.

En el detalle del pedido se puede ajustar el descuento antes de enviar o entregar. El servidor recalcula precio, subtotal y total. Después de la salida, los productos y precios quedan protegidos. Clientes no pueden aplicar descuentos por su cuenta.

## Devoluciones por garantía

En **Mis pedidos** y en el detalle de **Pedidos**, la sección **Devoluciones y garantías** permite seleccionar un producto entregado, su cantidad, motivo y de una a cinco evidencias JPG, PNG, WEBP o PDF (máximo 10 MB por archivo).

Las solicitudes de clientes quedan **Pendientes de aprobación**. El administrador abre el aviso o el pedido, revisa evidencia y usa **Aprobar garantía** o **Rechazar** en **Devoluciones y garantías**. Rechazar requiere motivo; el cliente recibe un aviso con la decisión. Se guardan administrador, fecha y comentario. Las registradas por agentes y administradores se autorizan directamente.

El servidor comprueba el acceso al pedido, su estado entregado y la cantidad restante después de solicitudes anteriores pendientes o aprobadas. Rechazar libera la cantidad para una nueva solicitud con evidencia. Un reintento del mismo registro o decisión no duplica solicitudes, pérdidas ni avisos. Una decisión resuelta no puede cambiarse mediante los botones de revisión.

Las piezas defectuosas no vuelven al inventario vendible. Este flujo corresponde a garantía y reposición; no genera un reembolso ni reduce el saldo o los pagos de la compra original. Un pedido con devoluciones registradas no permite cancelación completa, para evitar reintegrar también piezas defectuosas.

Los pedidos anteriores sin costos históricos pueden registrar garantías. Su pérdida se muestra como costo desconocido hasta que un administrador capture los costos históricos desde la garantía, o se complete una reposición con costos conocidos. No se estiman importes inexistentes.

## Reposición y ganancia

1. El administrador abre el aviso o la garantía del pedido.
2. Si la solicitud es de cliente, aprueba primero la garantía. Usa **Crear pedido de reposición desde el catálogo** para elegir el producto y agregarlo al carrito.
3. En confirmar pedido, selecciona la garantía en **Reposición por garantía**. Se sugieren el cliente, sucursal y almacén del pedido original. El producto y la cantidad deben corresponder a la garantía.
4. Crea el pedido y, en su detalle, usa **Marcar pagado manualmente**. Se registra la liquidación con usuario y comentario; no crea un cobro de efectivo en los reportes de ruta.
5. Al enviar o entregar, se descuenta inventario normalmente. El pedido de reposición no genera un segundo ingreso en el tablero de ventas ni en el reporte de ganancias.

Se permite una reposición activa por garantía. Si se cancela, puede crearse otra. Un marcado pagado repetido no duplica la liquidación. Antes de marcar pagado se deben resolver los pagos pendientes que pudiera tener el pedido.

Al aprobar la garantía (o autorizarla directamente el agente) se descuenta de la ganancia de la venta original el costo estimado de reemplazar las piezas: se utilizan sus costos históricos de la venta. Las solicitudes pendientes o rechazadas no descuentan ganancias ni permiten crear reposiciones. Al despachar la reposición, se sustituyen por sus costos reales. Si la reposición es parcial, las piezas restantes conservan su estimación. No se descuenta el costo dos veces.

Ejemplo: compra original $200, venta final $500, ganancia bruta $300. Una garantía con reposición de costo original $200 reduce la ganancia a $100. Si al despachar el reemplazo su costo real es $220, la ganancia queda en $80.

El reporte muestra piezas con garantía, pérdida y ganancia neta de esa pérdida. Se atribuye la pérdida a la venta original; los filtros de fecha corresponden a la fecha de salida de esa venta.

## Campanita general

`notifications` almacena destinatario, título, texto, tipo de entidad, identificador del registro y ruta interna de destino. No tiene una relación fija con pedidos: puede apuntar a productos, clientes, garantías o cualquier otra entidad.

Cada usuario consulta únicamente sus avisos. La campanita muestra los últimos 50, el contador completo sin leer, actualización en tiempo real, marcado individual al abrir y marcado de todos como leídos. Al hacer clic se abre la ruta registrada. Solo se admiten rutas internas.

Cada solicitud genera un aviso por administrador activo, dirigido al pedido y con la garantía resaltada. La aprobación o rechazo genera un aviso privado al cliente, dirigido a su pedido. La evidencia es privada y se abre mediante enlaces temporales para usuarios con acceso al pedido.

Para futuros avisos personalizados, administradores pueden llamar `send_custom_notification` con:

```json
{
  "p_recipients": ["UUID-del-usuario-destinatario"],
  "p_title": "Título del aviso",
  "p_body": "Cualquier texto",
  "p_entity_type": "products",
  "p_entity_id": "UUID-del-producto",
  "p_target_path": "/catalog/products/UUID-del-producto"
}
```

Las funciones y disparadores del servidor pueden insertar avisos desde otras entidades. Clientes y agentes no pueden escribir avisos arbitrarios para otros usuarios.

## Verificación

- Migraciones y casos de permisos probados en PostgreSQL mediante PGlite: descuentos, precios finales, garantías de clientes y agentes, cantidades, evidencia, reintentos, avisos privados, pérdida y reposición.
- Migración ensayada en Supabase con reversión, comprobando que los precios, subtotales y totales anteriores no cambien.
- Flujo probado en Supabase después de aplicar la migración; datos de prueba revertidos, incluido el cambio del costo estimado por el real del reemplazo.
- Evidencia probada con políticas de acceso: otros clientes no pueden verla; los adjuntos de una garantía registrada no pueden borrarse. El servicio conserva evidencia de solicitudes confirmadas aunque se pierda la respuesta, y limpia archivos no vinculados tras un error.
- Compilación de Vite válida. El proyecto completo aún tiene errores TypeScript anteriores en otros archivos; la revisión visual interactiva en navegador queda pendiente.

```powershell
node scratch/pricing-tests/run.mjs
node scratch/pricing-tests/returns-service-check.cjs
node scratch/pricing-tests/warranty-approval-ui.cjs
npx supabase db query --linked --file scratch/pricing-tests/remote-order-features.sql
npx supabase db query --linked --file scratch/pricing-tests/remote-warranty-approval.sql
```
