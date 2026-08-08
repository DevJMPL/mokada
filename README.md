# Mokada - Sistema de Inventario y Catálogo

Este es el frontend para el sistema de inventario y catálogo de refacciones automotrices, construido con React, Vite, TypeScript, Tailwind CSS, y conectado a Supabase.

## Requisitos

- Node.js (v18+)
- NPM o Yarn

## Configuración Inicial

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Copia el archivo `.env.example` a `.env` y configura tus variables de Supabase:
   ```bash
   cp .env.example .env
   ```
4. Actualiza `.env` con tus credenciales:
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-anon-key"
   ```

## Ejecución

Para iniciar el servidor de desarrollo:

```bash
npm run dev
```

La aplicación estará disponible típicamente en `http://localhost:5173`.

## Arquitectura

El proyecto sigue una arquitectura orientada a dominios/módulos para facilitar la mantenibilidad y el crecimiento del sistema:

- **`/app`**: Configuración global, providers (React Query), y enrutador principal.
- **`/components`**: Componentes UI compartidos y genéricos (Tablas, Badges, Loaders).
- **`/layouts`**: Estructura principal de la app (Sidebar, Header).
- **`/lib`**: Clientes de servicios de terceros (Supabase).
- **`/modules`**: Funcionalidad agrupada por dominio:
  - `catalog/`: Productos, Marcas, Categorías, Vehículos.
  - `inventory/`: Existencias, Almacenes, Movimientos.
  - `configuration/`: Unidades, Atributos, Listas de precios.
  - `dashboard/`: Pantalla inicial de resumen.
- **`/types`**: Tipos estáticos generados por Supabase (`database.types.ts`).
- **`/utils`**: Formateadores y utilidades.

## Scripts Disponibles

- `npm run dev`: Inicia servidor local Vite.
- `npm run build`: Compila el proyecto con TypeScript y Vite.
- `npm run lint`: Ejecuta el linter (ESLint).
- `npm run preview`: Previsualiza el build de producción.
# mokada

## Database Development

Este proyecto utiliza **Supabase CLI** y un sistema de migraciones formales para garantizar que el modelo de datos crezca junto con la aplicación de forma versionada.

### Flujo de Configuración Inicial (Para nuevos desarrolladores)

Dado que no almacenamos tokens ni credenciales personales, debes enlazar el proyecto local con tu base de datos remota para obtener el baseline.

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Autenticar Supabase CLI (Tu cuenta debe tener acceso al proyecto en Supabase):**
   ```bash
   npx supabase login
   ```

3. **Vincular el entorno local al proyecto remoto (Obtén el ID de tu .env):**
   ```bash
   npx supabase link --project-ref <project-ref>
   ```
   *(Asegúrate de ingresar la contraseña de la base de datos de tu proyecto remoto cuando lo solicite)*.

4. **Generar la migración base desde el entorno remoto (SOLO LA PRIMERA VEZ o si falta la baseline local):**
   ```bash
   npm run db:pull
   ```
   *(Esto creará el esquema actual en `supabase/migrations/XXX_remote_schema.sql`)*.

5. **Arrancar contenedor local:**
   ```bash
   npm run supabase:start
   ```

6. **Construir tu base local con el schema y seed base:**
   ```bash
   npm run db:reset
   ```

### Flujo de Trabajo (Creando Cambios)

1. Crear una nueva migración local:
   ```bash
   npx supabase migration new <migration-name>
   ```
   Escribe tu SQL dentro del archivo generado.

2. Probar la migración en tu entorno local Docker:
   ```bash
   npm run db:reset
   ```

3. Verificar las migraciones locales versus remotas:
   ```bash
   npm run db:migrations
   ```

4. Empujar los cambios al servidor remoto (Cuidado, esto aplicará cambios en la base real):
   ```bash
   npm run db:push
   ```

5. Regenerar Tipos de TypeScript (para mantener el frontend en sincronía):
   ```bash
   npm run db:types
   ```

