# Features

Este directorio contiene todos los módulos de funcionalidad del sistema CinemaEC. Cada feature es un módulo independiente con su propia lógica, componentes, servicios y tipos.

## Features Disponibles

### 1. Auth (`auth/`)
**Propósito**: Manejo de autenticación y sesión de usuario

**Contenido**:
- `services/auth.service.ts`: Login, register, logout, getCurrentUser
- `types/`: Tipos de User, AuthResponse, LoginCredentials, RegisterData

**Uso**:
```typescript
import { authService, User, LoginCredentials } from '@/features/auth';

const response = await authService.login(credentials);
```

### 2. Profile (`profile/`)
**Propósito**: Gestión del perfil de usuario

**Contenido**:
- `types/`: CompleteProfileData, UpdateProfileData, ChangePasswordData

**Uso**:
```typescript
import { CompleteProfileData } from '@/features/profile';
```

### 3. Locations (`locations/`)
**Propósito**: Gestión de localizaciones físicas

**Contenido**:
- `types/`: Location, CreateLocationData, UpdateLocationData

**Tipos de localización**:
- `urban`: Zona urbana
- `rural`: Zona rural
- `cultural-center`: Centro cultural
- `educational`: Institución educativa
- `other`: Otro

**Prerequisitos**: Perfil completado

### 4. Companies (`companies/`)
**Propósito**: Gestión de empresas u organizaciones

**Contenido**:
- `types/`: Company, CreateCompanyData, UpdateCompanyData

**Tipos de negocio**:
- `production`: Producción
- `distribution`: Distribución
- `exhibition`: Exhibición
- `cultural`: Cultural
- `educational`: Educativa
- `other`: Otro

**Prerequisitos**: Localización registrada

### 5. Spaces (`spaces/`)
**Propósito**: Espacios físicos de exhibición de películas

**Contenido**:
- `types/`: Space, CreateSpaceData, UpdateSpaceData

**Tipos de espacio**:
- `cinema`: Cine tradicional
- `auditorium`: Auditorio
- `cultural-center`: Centro cultural
- `outdoor`: Al aire libre
- `mobile`: Cine móvil
- `other`: Otro

**Tipos de proyección**:
- `digital`: Proyección digital
- `film`: Proyección en película
- `both`: Ambas

**Estados de aprobación**:
- `pending`: Pendiente de revisión
- `approved`: Aprobado por administrador
- `rejected`: Rechazado

**Prerequisitos**: Localización registrada

### 6. User CB (`user-cb/`)
**Propósito**: Gestión de usuarios del banco de contenido (Content Bank)

**Contenido**:
- `types/`: UserCB, CreateUserCBData, UpdateUserCBData

**Descripción**:
Un User CB es un usuario que ha sido aprobado para acceder al catálogo de películas del banco de contenido nacional. Para convertirse en User CB, el usuario debe:
1. Tener un espacio de exhibición aprobado
2. Solicitar acceso al banco de contenido
3. Ser aprobado por un administrador

**Estados de aprobación**:
- `pending`: Pendiente de revisión
- `approved`: Acceso aprobado (desbloquea movies y film-requests)
- `rejected`: Acceso rechazado

**Prerequisitos**: Espacio de exhibición aprobado

### 7. Movies (`movies/`)
**Propósito**: Catálogo de películas disponibles

**Contenido**:
- `types/`: Movie, CreateMovieData, UpdateMovieData

**Formatos disponibles**:
- `DCP`: Digital Cinema Package
- `BluRay`: Disco Blu-ray
- `DVD`: Disco DVD
- `Digital`: Archivo digital
- `Film`: Película física (35mm, 16mm, etc.)

**Campos principales**:
- Información básica: título, director, año, duración
- Detalles técnicos: formato, resolución, idioma, subtítulos
- Contenido: sinopsis, género, país de origen
- Disponibilidad: estado, póster, trailer

**Prerequisitos**: Acceso como User CB aprobado

### 8. Film Requests (`film-requests/`)
**Propósito**: Solicitudes de películas del banco de contenido

**Contenido**:
- `types/`: FilmRequest, CreateFilmRequestData, UpdateFilmRequestData

**Tipos de evento**:
- `regular`: Función regular
- `special`: Evento especial
- `festival`: Festival
- `educational`: Educativo
- `community`: Comunitario

**Estados**:
- `pending`: Pendiente de aprobación
- `approved`: Aprobada
- `rejected`: Rechazada
- `completed`: Exhibición completada
- `cancelled`: Cancelada

**Prerequisitos**: Acceso como User CB aprobado

### 9. Feedback (`feedback/`)
**Propósito**: Retroalimentación después de exhibiciones

**Contenido**:
- `types/`: Feedback, CreateFeedbackData, UpdateFeedbackData

**Evaluaciones** (escala 1-5):
- `technicalQuality`: Calidad técnica de la proyección
- `audienceReception`: Recepción de la audiencia
- `overallExperience`: Experiencia general

**Prerequisitos**: Solicitud de película completada

## Flujo de Trabajo General

```
1. Usuario se registra y completa perfil
   ↓
2. Registra Localización
   ↓
3. Registra Empresa (opcional pero recomendado)
   ↓
4. Registra Espacio de Exhibición
   ↓
5. Espacio es aprobado por Admin
   ↓
6. Solicita convertirse en User CB
   ↓
7. User CB es aprobado por Admin
   ↓
8. Puede explorar catálogo de Movies
   ↓
9. Puede solicitar películas (Film Requests)
   ↓
10. Solicitudes son aprobadas por Admin
    ↓
11. Realiza exhibición
    ↓
12. Envía Feedback
```

## Convenciones

### Estructura de cada Feature
```
feature-name/
├── components/        # Componentes React específicos
├── services/          # Lógica de negocio y API calls
├── types/             # Tipos TypeScript
│   └── index.ts       # Exporta todos los tipos
├── hooks/             # Hooks personalizados
└── index.ts           # Barrel export
```

### Servicios
Los servicios deben:
- Usar `apiClient` de `@/lib/api-client`
- Manejar errores adecuadamente
- Tipar correctamente requests y responses
- Seguir el patrón:

```typescript
export const featureService = {
  async create(data: CreateData): Promise<Entity> {
    const response = await apiClient.post<ApiResponse<Entity>>('/endpoint', data);
    if (response.data) return response.data;
    throw new Error('Error message');
  },
  
  async getAll(): Promise<Entity[]> {
    const response = await apiClient.get<ApiResponse<Entity[]>>('/endpoint');
    if (response.data) return response.data;
    throw new Error('Error message');
  },
  
  async getById(id: string): Promise<Entity> {
    const response = await apiClient.get<ApiResponse<Entity>>(`/endpoint/${id}`);
    if (response.data) return response.data;
    throw new Error('Error message');
  },
  
  async update(id: string, data: UpdateData): Promise<Entity> {
    const response = await apiClient.put<ApiResponse<Entity>>(`/endpoint/${id}`, data);
    if (response.data) return response.data;
    throw new Error('Error message');
  },
  
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/endpoint/${id}`);
  },
};
```

### Tipos
Los tipos deben:
- Estar en `types/index.ts`
- Ser exportados para uso externo
- Incluir tipos para entidades, create, update
- Documentar campos importantes con comentarios

```typescript
export interface Entity {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntityData {
  name: string;
}

export type UpdateEntityData = Partial<CreateEntityData> & {
  isActive?: boolean;
};
```

### Componentes
Los componentes deben:
- Usar CSS Modules
- Tipar correctamente las props
- Manejar estados de loading y error
- Ser reutilizables cuando sea posible

```typescript
import styles from './Component.module.css';

interface ComponentProps {
  data: Entity;
  onSave: (data: UpdateEntityData) => Promise<void>;
}

export function Component({ data, onSave }: ComponentProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Implementation
  
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
}
```

## Próximos Pasos para Desarrolladores

1. **Implementar servicios**: Crear los archivos de servicio en cada feature
2. **Crear componentes**: Desarrollar los componentes UI necesarios
3. **Agregar páginas**: Crear las páginas en `src/app/` que consuman los features
4. **Implementar hooks**: Crear hooks personalizados para lógica reutilizable
5. **Testing**: Agregar tests para servicios y componentes críticos
