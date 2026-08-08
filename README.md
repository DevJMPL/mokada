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
