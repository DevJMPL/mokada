# Datos para facturación en pedidos

En el checkout, clientes, agentes y administradores pueden marcar **Requiere factura**. Se elige uno de los perfiles fiscales activos del cliente y la forma de pago para facturación. La condición contado/crédito del pedido se mantiene independiente de esa forma de pago.

Se usan los campos existentes: nombre del cliente, razón social, RFC, uso CFDI, régimen fiscal, código postal fiscal y correo de facturación. Como correo de contacto opcional se usa el correo del cliente. El código postal del emisor es siempre **42186**.

Al crear el pedido, Supabase valida que el perfil pertenezca al cliente y guarda una copia de los datos fiscales. Las ediciones posteriores del perfil no cambian esa copia. No se permite cambiar los datos fiscales del pedido después del envío, entrega o cancelación.

En el detalle del pedido, el administrador encontrará **Factura solicitada → Datos para facturación**. El modal permite revisar los campos, imprimirlos o descargar el PDF. Es un documento de información para preparar la factura; no realiza timbrado.

Los pedidos históricos quedan sin solicitud de factura. Se conservan los flujos existentes de descuentos, crédito, garantías, pagos y movimientos de inventario.
