# Pruebas de inventario y pedidos

Desde la raíz del repositorio, con las dependencias de la aplicación instaladas:

```powershell
npm ci --prefix tests/inventory-orders
npm test --prefix tests/inventory-orders
```

La suite carga todas las migraciones reales en PostgreSQL embebido (PGlite), con esquemas `auth` y `storage` de prueba. Verifica compras, traspasos, costos, ganancias, cancelaciones, descuentos, permisos, garantías con aprobación, notificaciones privadas, reposiciones pagadas manualmente y selección de perfiles fiscales. También ejecuta los servicios y componentes reales con respuestas simuladas para comprobar paginación, evidencias y controles por rol. No necesita credenciales ni modifica Supabase.

Los archivos `remote-*.sql` son pruebas de integración opcionales para un proyecto Supabase ya migrado y con administrador y sucursal existentes. Crean datos temporales y terminan con `ROLLBACK`. Ejemplo:

```powershell
npx supabase db query --linked --file tests/inventory-orders/remote-invoice.sql
```

La compilación de Vite y la revisión visual del PDF se verificaron por separado. El chequeo general de TypeScript tiene errores anteriores a estos cambios en otros módulos; no se considera aprobado por esta suite.
