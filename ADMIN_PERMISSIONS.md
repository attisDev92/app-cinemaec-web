# Sistema de Administración y Permisos

## Roles de Usuario

### USER / EDITOR

Usuarios regulares que **NO tienen permisos**.

- `permissions: null` o `undefined`
- Deben completar su perfil
- Deben aceptar el acuerdo de medios
- Acceden a funcionalidades de usuario regular

### ADMIN

Los usuarios con rol `ADMIN` tienen acceso al panel de administración y **SIEMPRE tienen un array de permisos** (puede estar vacío).

- `permissions: []` o `permissions: ["admin_spaces", "admin_movies", ...]`
- **No requieren completar perfil**: Los administradores van directamente a `/admin` después del login.
- **No necesitan acuerdo de medios**: El flujo de `complete-profile` y `media-agreement` no aplica para admins.
- **Permisos granulares**: Cada admin puede tener diferentes permisos asignados.

## Estructura de Datos por Rol

### Usuario USER/EDITOR

```json
{
  "id": 123,
  "email": "usuario@example.com",
  "role": "user",
  "permissions": null,
  "hasProfile": true,
  "hasUploadedAgreement": true
}
```

### Usuario ADMIN con permisos

```json
{
  "id": 1,
  "email": "admin@icca.gob.ec",
  "role": "admin",
  "permissions": ["admin_spaces", "admin_movies", "approve_movies_request"],
  "hasProfile": false,
  "hasUploadedAgreement": false
}
```

### Usuario ADMIN sin permisos asignados

```json
{
  "id": 2,
  "email": "admin2@icca.gob.ec",
  "role": "admin",
  "permissions": [],
  "hasProfile": false,
  "hasUploadedAgreement": false
}
```

## Permisos Disponibles

```typescript
export enum PermissionEnum {
  ADMIN_SPACES = "admin_spaces", // Gestionar espacios REA
  ADMIN_MOVIES = "admin_movies", // Administrar películas
  APPROVE_MOVIES_REQUEST = "approve_movies_request", // Aprobar solicitudes de películas
  ADMIN_USERS = "admin_users", // Gestionar usuarios
  ASSIGN_ROLES = "assign_roles", // Asignar roles y permisos
  VIEW_REPORTS = "view_reports", // Ver reportes y estadísticas
  EXPORT_DATA = "export_data", // Exportar datos del sistema
}
```

## Estructura de Datos

### User Interface

```typescript
interface User {
  id: number
  email: string
  cedula: string
  role: UserRole
  permissions?: PermissionEnum[] // Array de permisos asignados
  isActive: boolean
  // ...otros campos
}
```

### ExtendedUser Interface

```typescript
interface ExtendedUser extends Omit<User, ...> {
  hasProfile: boolean
  permissions?: PermissionEnum[]
  // ...otros campos
}
```

## Hook de Permisos

### usePermissions

```typescript
import { usePermissions } from '@/features/auth/hooks'

const MyComponent = () => {
  const { hasPermission, hasAnyPermission, hasAllPermissions, permissions } = usePermissions()

  // Verificar un permiso específico
  if (hasPermission(PermissionEnum.ADMIN_SPACES)) {
    // Mostrar funcionalidad de administración de espacios
  }

  // Verificar si tiene al menos uno de varios permisos
  if (hasAnyPermission([PermissionEnum.ADMIN_USERS, PermissionEnum.ASSIGN_ROLES])) {
    // Mostrar funcionalidad de gestión de usuarios
  }

  // Verificar si tiene todos los permisos requeridos
  if (hasAllPermissions([PermissionEnum.VIEW_REPORTS, PermissionEnum.EXPORT_DATA])) {
    // Mostrar funcionalidad de reportes completa
  }

  return <div>...</div>
}
```

## Panel de Administración

### Ruta: `/admin`

El panel de administración muestra diferentes módulos según los permisos del usuario:

1. **Espacios REA** - Requiere `ADMIN_SPACES`
   - Gestionar espacios registrados
   - Aprobar/rechazar espacios
   - Ver detalles y contratos

2. **Películas** - Requiere `ADMIN_MOVIES`
   - Administrar catálogo de películas
   - Agregar/editar/eliminar contenido

3. **Solicitudes de Películas** - Requiere `APPROVE_MOVIES_REQUEST`
   - Revisar solicitudes de exhibición
   - Aprobar/rechazar solicitudes

4. **Usuarios** - Requiere `ADMIN_USERS`
   - Gestionar usuarios del sistema
   - Ver perfiles y actividad

5. **Roles y Permisos** - Requiere `ASSIGN_ROLES`
   - Asignar roles a usuarios
   - Gestionar permisos

6. **Reportes** - Requiere `VIEW_REPORTS`
   - Ver estadísticas del sistema
   - Generar reportes

7. **Exportación de Datos** - Requiere `EXPORT_DATA`
   - Exportar información en diferentes formatos
   - Descargar datos del sistema

### Estadísticas del Dashboard

El dashboard muestra:

- Total de usuarios
- Total de espacios registrados
- Espacios pendientes de aprobación
- Películas en catálogo

### Acciones Rápidas

Botones de acceso rápido a funcionalidades comunes:

- Revisar espacios pendientes
- Ver usuarios recientes
- Generar reportes

## Flujo de Redirección

### Usuario ADMIN

```
Login → /admin (directo)
```

### Usuario USER/EDITOR

```
Login →
  ↓ (si !hasProfile)
  /complete-profile →
    ↓ (si !hasUploadedAgreement)
    /media-agreement →
      ↓
      /home
```

## Middleware

El middleware protege las rutas de admin:

- Verifica token de autenticación
- Redirige a `/login` si no está autenticado
- No verifica hasProfile para admins

## Archivos Importantes

- `/src/shared/types/enums.ts` - Definición de PermissionEnum
- `/src/shared/types/user.ts` - Interfaces User y ExtendedUser
- `/src/features/auth/hooks/usePermissions.ts` - Hook de permisos
- `/src/app/admin/page.tsx` - Panel de administración principal
- `/src/middleware.ts` - Protección de rutas

## Backend Integration

El backend debe:

1. Incluir el campo `permissions` en la respuesta del login
2. Validar permisos en cada endpoint protegido
3. Permitir asignar/remover permisos a usuarios admin

Ejemplo de respuesta esperada:

```json
{
  "accessToken": "...",
  "user": {
    "id": 1,
    "email": "admin@icca.gob.ec",
    "role": "admin",
    "permissions": ["admin_spaces", "admin_movies", "approve_movies_request"]
    // ...otros campos
  }
}
```
