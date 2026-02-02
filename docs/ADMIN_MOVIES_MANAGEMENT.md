# Frontend Admin Movies Management Module

## Overview

Se ha creado un módulo completo de administración de películas para los administradores del sistema. Este módulo permite ver, editar y eliminar películas registradas en la plataforma.

## Cambios Realizados

### 1. Tipos Actualizados

**Archivo**: `/src/features/movies/types/index.ts`

- Agregado tipo `MovieStatus` con valores: `draft | in_review | approved | rejected | archived`
- Actualizado la interfaz `Movie` para incluir:
  - `isActive: boolean` - Indica si la película está activa en el sistema
  - `status: MovieStatus` - Estado de revisión de la película

```typescript
export type MovieStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "archived"

export interface Movie extends CreateMoviePayload {
  id: number
  isActive: boolean
  status: MovieStatus
  createdAt: string
  updatedAt?: string | null
  ownerId?: number | null
}
```

### 2. Servicio de Películas Expandido

**Archivo**: `/src/features/movies/services/movie.service.ts`

Agregados los métodos CRUD:

- `getAll()` - Obtiene todas las películas
- `getById(id)` - Obtiene una película específica
- `create(payload)` - Crea una nueva película (ya existía)
- `update(id, payload)` - Actualiza una película
- `delete(id)` - Elimina una película

### 3. Componente MovieManagementTable

**Archivos**:

- `/src/features/movies/components/MovieManagementTable.tsx`
- `/src/features/movies/components/MovieManagementTable.module.css`

Componente de tabla reutilizable que muestra:

- Título, tipo, duración, estado de proyecto
- Año de lanzamiento, estado de revisión
- Estado de actividad (Activo/Inactivo)
- Botones de acción (Editar, Eliminar)

**Características**:

- Tabla responsive con scroll horizontal
- Estados coloreados (borrador azul, en revisión amarillo, aprobado verde, etc.)
- Indicador visual de películas inactivas (opacidad reducida)
- Manejo de eliminación con confirmación
- Manejo de estados de carga

### 4. Dashboard de Administración de Películas

**Archivos**:

- `/src/app/admin/movies-management/page.tsx`
- `/src/app/admin/movies-management/page.module.css`

**Ruta**: `/admin/movies-management`

**Características**:

- Validación de permisos de administrador
- Interfaz con pestañas:
  - **Lista de Películas**: Muestra todas las películas con tabla interactiva
  - **Crear Nueva Película**: (placeholder para futura implementación)
- Carga automática de películas al cargar la página
- Manejo de errores y estados de carga
- Integración con `useAuth` para validar permisos

**Validación de Acceso**:

```typescript
// Solo usuarios autenticados con role ADMIN pueden acceder
if (!isAuthenticated || (user && user.role !== UserRole.ADMIN)) {
  router.push("/home") // O mostrar mensaje de error
}
```

### 5. Exportación de Módulo

**Archivo**: `/src/features/movies/index.ts`

Agregada exportación del componente `MovieManagementTable`:

```typescript
export * from "./components/MovieManagementTable"
```

## Flujo de Uso

1. **Acceso**: El administrador accede a `/admin/movies-management`
2. **Validación**: El sistema valida que sea administrador
3. **Carga**: Se obtienen todas las películas vía `movieService.getAll()`
4. **Visualización**: Se muestra tabla con información completa
5. **Acciones**:
   - **Editar**: Redirige a `/admin/movies/{id}` (próxima implementación)
   - **Eliminar**: Elimina la película tras confirmación y recarga la lista

## Estilos

### Colores de Estados

- **Draft**: Azul claro (#0277bd)
- **In Review**: Amarillo (#856404)
- **Approved**: Verde (#155724)
- **Rejected**: Rojo (#721c24)
- **Archived**: Gris (#383d41)

### Responsive Design

- Tabla con scroll horizontal en dispositivos pequeños
- Padding ajustado para mobile
- Botones de acción con tamaño adecuado en todas las pantallas

## Estructura de Archivos

```
/src
  /app
    /admin
      /movies-management
        page.tsx           # Dashboard principal
        page.module.css    # Estilos del dashboard
  /features
    /movies
      /components
        MovieManagementTable.tsx       # Tabla de películas
        MovieManagementTable.module.css # Estilos de tabla
      /services
        movie.service.ts   # Métodos CRUD expandidos
      /types
        index.ts           # Tipos actualizados con isActive y status
      index.ts             # Exportaciones
```

## API Endpoints Utilizados

- `GET /movies` - Obtiene todas las películas
- `GET /movies/{id}` - Obtiene una película específica
- `POST /movies` - Crea una nueva película
- `PUT /movies/{id}` - Actualiza una película
- `DELETE /movies/{id}` - Elimina una película

## Próximos Pasos

1. **Implementar formulario de edición**: Crear página `/admin/movies/{id}`
2. **Integrar formulario de creación**: Conectar con el tab "Crear Nueva Película"
3. **Agregar filtros y búsqueda**: Permitir búsqueda por título, estado, etc.
4. **Implementar paginación**: Para manejar listas grandes de películas
5. **Crear módulos similares**: Para profesionales, empresas, plataformas, etc.

## Consideraciones Técnicas

- El componente utiliza `useState` para manejo de estado local
- Las llamadas a API se hacen con `movieService` que utiliza el `ApiClient` del proyecto
- La autenticación se maneja a través del hook `useAuth` que obtiene el token del localStorage
- Los estilos están modularizados (CSS Modules) para evitar conflictos
- La tabla es totalmente responsive y accesible
