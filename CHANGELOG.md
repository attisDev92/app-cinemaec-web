# Changelog

Todos los cambios notables en el proyecto CinemaEC Frontend serán documentados en este archivo.

## [2.0.0] - 2024-01-XX

### 🎉 Cambios Mayores - Reorganización a Arquitectura Basada en Features

#### ✨ Nuevo
- **Arquitectura basada en features**: Reorganización completa del código en módulos independientes
- **8 Features principales**:
  - `auth/` - Autenticación y sesión
  - `profile/` - Gestión de perfil
  - `locations/` - Gestión de localizaciones
  - `companies/` - Gestión de empresas
  - `exhibition-spaces/` - Espacios de exhibición
  - `content-bank/` - Banco de contenido
  - `film-requests/` - Solicitudes de películas
  - `feedback/` - Retroalimentación
- **Carpeta shared/** para código compartido:
  - Componentes UI reutilizables
  - Contextos de React
  - Tipos TypeScript compartidos
  - Hooks personalizados
  - Utilidades
- **Tipos TypeScript completos** para todas las features
- **Barrel exports** (index.ts) en cada feature para importaciones simplificadas
- **Documentación extensa**:
  - `ARCHITECTURE.md` - Arquitectura completa del proyecto
  - `src/features/README.md` - Guía de features y convenciones
  - `README.md` actualizado con nueva estructura

#### 🔄 Cambiado
- **Rutas de importación actualizadas**:
  - `@/components/` → `@/shared/components/`
  - `@/contexts/` → `@/shared/contexts/`
  - `@/types/` → `@/shared/types/` y `@/features/{feature}/types/`
  - `@/services/` → `@/features/{feature}/services/`
- **Estructura de carpetas** completamente rediseñada
- **User type** extendido con nuevos campos:
  - `emailVerified`: boolean
  - `hasLocation`: boolean
  - `hasCompany`: boolean
  - `hasExhibitionSpace`: boolean
  - `isContentBankUser`: boolean
  - `contentBankApproved`: boolean

#### 🗑️ Eliminado
- Carpetas antiguas:
  - `src/components/` (movido a `src/shared/components/`)
  - `src/contexts/` (movido a `src/shared/contexts/`)
  - `src/services/` (movido a features específicos)
  - `src/types/` (movido a `src/shared/types/`)

#### 🐛 Corregido
- Error de CSS en `complete-profile/page.module.css`: `text-center` → `text-align: center`
- Error de CSS en `register/page.module.css`: `text-center` → `text-align: center`
- Indentación incorrecta en `admin/page.tsx`

#### 📝 Tipos Nuevos Creados

**Auth Feature:**
- `User` - Usuario con campos extendidos
- `AuthResponse` - Respuesta de autenticación
- `LoginCredentials` - Credenciales de login
- `RegisterData` - Datos de registro
- `VerifyEmailData` - Datos de verificación de email
- `ResendVerificationData` - Reenvío de verificación

**Profile Feature:**
- `CompleteProfileData` - Completar perfil
- `UpdateProfileData` - Actualizar perfil
- `ChangePasswordData` - Cambiar contraseña

**Locations Feature:**
- `Location` - Localización completa
- `CreateLocationData` - Crear localización
- `UpdateLocationData` - Actualizar localización

**Companies Feature:**
- `Company` - Empresa completa
- `CreateCompanyData` - Crear empresa
- `UpdateCompanyData` - Actualizar empresa

**Exhibition Spaces Feature:**
- `ExhibitionSpace` - Espacio de exhibición completo
- `CreateExhibitionSpaceData` - Crear espacio
- `UpdateExhibitionSpaceData` - Actualizar espacio

**Content Bank Feature:**
- `ContentBankUser` - Usuario del banco de contenido
- `CreateContentBankUserData` - Solicitar acceso
- `UpdateContentBankUserData` - Actualizar solicitud

**Film Requests Feature:**
- `Film` - Película del catálogo
- `FilmRequest` - Solicitud de película
- `CreateFilmRequestData` - Crear solicitud
- `UpdateFilmRequestData` - Actualizar solicitud

**Feedback Feature:**
- `Feedback` - Retroalimentación completa
- `CreateFeedbackData` - Crear feedback
- `UpdateFeedbackData` - Actualizar feedback

#### ✅ Verificado
- ✅ Build exitoso sin errores
- ✅ Sin errores de TypeScript
- ✅ Sin errores de linting
- ✅ Todas las páginas compiladas correctamente
- ✅ Middleware funcionando

---

## [1.0.0] - 2024-01-XX

### ✨ Funcionalidades Iniciales

#### Autenticación
- Sistema de registro de usuarios
- Sistema de inicio de sesión
- Cierre de sesión
- Gestión de tokens JWT
- Contexto global de autenticación (AuthContext)

#### Gestión de Usuario
- Completar perfil después del registro
- Ver perfil de usuario
- Editar información personal
- Cambiar contraseña
- Validación de formularios

#### Dashboard
- Dashboard de usuario con servicios disponibles
- Dashboard de administrador
- Navegación protegida por roles (user/admin)

#### Seguridad
- Middleware para proteger rutas privadas
- Redirección automática según autenticación
- Separación de permisos por roles

#### UI/UX
- Conversión completa a CSS Modules
- Componentes UI reutilizables:
  - `Input` - Campo de entrada con validación
  - `Button` - Botón con estados de carga
  - `Card` - Contenedor de contenido
  - `Navbar` - Barra de navegación responsiva

#### Configuración
- Variables de entorno (.env.local, .env.production)
- Git con .gitignore configurado
- Cliente API personalizado
- Manejo de errores centralizado

### 🔧 Tecnologías
- Next.js 16 con App Router
- React 19.2
- TypeScript 5
- CSS Modules
- JWT para autenticación

---

## Leyenda de Etiquetas

- 🎉 **Cambios Mayores**: Cambios importantes en la arquitectura o funcionalidades
- ✨ **Nuevo**: Nuevas funcionalidades o características
- 🔄 **Cambiado**: Cambios en funcionalidades existentes
- 🐛 **Corregido**: Corrección de bugs
- 🗑️ **Eliminado**: Funcionalidades o código eliminado
- 📝 **Documentación**: Cambios solo en documentación
- ⚡ **Rendimiento**: Mejoras de rendimiento
- 🔒 **Seguridad**: Correcciones de seguridad
- ✅ **Verificado**: Items verificados y funcionando
