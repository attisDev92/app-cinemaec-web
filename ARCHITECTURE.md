# Arquitectura del Proyecto CinemaEC

## Estructura de Carpetas

Este proyecto utiliza una arquitectura basada en **features** (características/módulos) para mejorar la escalabilidad y mantenibilidad del código.

```
src/
├── app/                          # Next.js App Router (páginas y rutas)
│   ├── layout.tsx               # Layout principal con ReduxProvider
│   ├── page.tsx                 # Página de inicio
│   ├── login/                   # Página de inicio de sesión (Formik + Yup)
│   ├── register/                # Página de registro (Formik + Yup)
│   ├── forgot-password/         # Recuperar contraseña (Formik + Yup)
│   ├── reset-password/          # Restablecer contraseña (Formik + Yup)
│   ├── complete-profile/        # Completar perfil después del registro
│   ├── dashboard/               # Dashboard del usuario
│   ├── profile/                 # Perfil del usuario
│   │   └── change-password/     # Cambiar contraseña
│   └── admin/                   # Panel de administración
│
├── features/                     # Módulos de funcionalidades
│   ├── auth/                    # Autenticación
│   │   ├── components/          # Componentes específicos de auth
│   │   ├── services/            # Servicios de auth (login, register, forgot/reset password)
│   │   ├── types/               # Tipos TypeScript de auth
│   │   ├── hooks/               # Hooks personalizados de auth (useAuth)
│   │   ├── store/               # Redux slice de autenticación (authSlice.ts)
│   │   └── index.ts             # Barrel export
│   │
│   ├── profile/                 # Gestión de perfil de usuario
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── locations/               # Gestión de localizaciones
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── companies/               # Gestión de empresas
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── spaces/                  # Espacios de exhibición
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── user-cb/                 # Usuarios del banco de contenido
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── movies/                  # Catálogo de películas
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── film-requests/           # Solicitudes de películas
│   │   ├── components/
│   │   ├── services/
│   │   ├── types/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   └── feedback/                # Retroalimentación de exhibiciones
│       ├── components/
│       ├── services/
│       ├── types/
│       ├── hooks/
│       └── index.ts
│
├── shared/                       # Código compartido entre features
│   ├── components/              # Componentes reutilizables
│   │   ├── ui/                  # Componentes UI básicos
│   │   │   ├── Input.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   └── index.ts
│   │   └── Navbar.tsx           # Barra de navegación
│   │
│   ├── store/                   # Redux configuration
│   │   ├── index.ts            # Store principal (combineReducers)
│   │   ├── hooks.ts            # useAppDispatch, useAppSelector
│   │   └── ReduxProvider.tsx   # Provider de Redux
│   │
│   └── types/                   # Tipos TypeScript compartidos
│       ├── auth.ts              # Tipos de autenticación
│       └── api.ts               # Tipos de API
│
├── lib/                          # Librerías y configuraciones
│   ├── api-client.ts            # Cliente HTTP para la API
│   └── environment.ts           # Variables de entorno
│
└── middleware.ts                 # Middleware de Next.js (protección de rutas)
```

## Flujo de la Aplicación

### 1. Registro y Autenticación

1. Usuario se registra con email y contraseña → `/register`
2. Verifica su email (flujo a implementar)
3. Inicia sesión → `/login`
4. Completa su perfil con nombre, apellido y teléfono → `/complete-profile`
5. Accede al dashboard → `/dashboard`

### 2. Registro de Información

El usuario debe registrar la siguiente información en orden:

#### 2.1. Localización (`/locations`)

- Registra una localización física donde se realizarán las exhibiciones
- Incluye dirección, ciudad, provincia, tipo, capacidad, instalaciones, etc.
- **Prerequisito**: Perfil completado

#### 2.2. Empresa (`/companies`)

- Registra la empresa u organización responsable
- Incluye RUC, representante legal, tipo de negocio, documentos legales
- **Prerequisito**: Localización registrada

#### 2.3. Espacio de Exhibición (`/spaces`)

- Registra el espacio físico donde se proyectarán las películas
- Incluye tipo de espacio, capacidad, especificaciones técnicas, equipamiento
- Vinculado a una localización y opcionalmente a una empresa
- **Prerequisito**: Localización registrada
- **Estado**: Pendiente de aprobación por administrador

### 3. Acceso al Banco de Contenido

Después de registrar un espacio de exhibición:

#### 3.1. Solicitud de Acceso como Usuario CB (`/user-cb`)

- El usuario solicita acceso al banco de contenido de películas
- Explica el motivo, uso previsto, audiencia estimada, frecuencia de programación
- Debe vincular un espacio de exhibición aprobado
- **Prerequisito**: Espacio de exhibición registrado
- **Estado**: Pendiente de aprobación por administrador

#### 3.2. Aprobación por Administrador

- Un administrador revisa la solicitud de espacio de exhibición
- Aprueba o rechaza con razón
- Una vez aprobado el espacio, el administrador revisa la solicitud de user-cb
- Aprueba o rechaza con razón

### 4. Funcionalidades Desbloqueadas (Después de Aprobación)

#### 4.1. Catálogo de Películas (`/movies`)

- El usuario puede explorar el catálogo de películas disponibles
- Ver detalles técnicos, sinopsis, disponibilidad
- **Prerequisito**: Acceso como user-cb aprobado

#### 4.2. Solicitudes de Películas (`/film-requests`)

- El usuario puede solicitar películas del catálogo
- Selecciona película, fechas preferidas, información del evento
- Proporciona información de audiencia y envío
- **Prerequisito**: Acceso como user-cb aprobado

#### 4.3. Retroalimentación (`/feedback`)

- Después de una exhibición, el usuario envía feedback
- Incluye audiencia real, evaluación técnica, recepción del público
- Ayuda a mejorar el servicio
- **Prerequisito**: Solicitud de película completada

## Convenciones de Código

### Arquitectura Feature-First

Este proyecto utiliza **feature-first architecture** donde cada feature contiene su propia lógica, estado y componentes:

```
feature-name/
├── components/       # Componentes específicos del feature
├── services/         # Lógica de negocio y llamadas a API
├── types/            # Tipos TypeScript del feature
├── hooks/            # Hooks personalizados del feature
├── store/            # Redux slice específico del feature (si aplica)
└── index.ts          # Barrel export para facilitar importaciones
```

**Principios:**

- ✅ **Shared** contiene código REALMENTE compartido entre múltiples features
- ✅ **Features** contienen código específico de un dominio
- ✅ Redux slices van en `features/[nombre]/store/` si son específicos
- ✅ Hooks específicos van en `features/[nombre]/hooks/`

### Estado Global (Redux Toolkit)

El proyecto usa **Redux Toolkit** para estado global:

```typescript
// ✅ Correcto - Usar hooks tipados
import { useAppDispatch, useAppSelector } from "@/shared/store/hooks"
import { useAuth } from "@/features/auth/hooks"

// En componentes
const dispatch = useAppDispatch()
const { login, logout, isAuthenticated } = useAuth()
```

**Store Structure:**

```
shared/store/
├── index.ts              # Store config (combineReducers)
├── hooks.ts              # Typed hooks (useAppDispatch, useAppSelector)
└── ReduxProvider.tsx     # Provider wrapper

features/auth/store/
└── authSlice.ts          # Auth Redux slice
```

### Manejo de Formularios

Todos los formularios usan **Formik + Yup**:

```typescript
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

// Schema de validación
const loginSchema = Yup.object({
  email: Yup.string()
    .email('Email inválido')
    .required('Email requerido'),
  password: Yup.string()
    .min(6, 'Mínimo 6 caracteres')
    .required('Contraseña requerida'),
});

// En componente
<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={loginSchema}
  onSubmit={handleSubmit}
>
  {/* Form fields */}
</Formik>
```

### Importaciones

Utiliza los alias de TypeScript configurados:

```typescript
// ✅ Correcto - Features
import { useAuth } from "@/features/auth/hooks"
import { authService } from "@/features/auth/services/auth.service"
import { User } from "@/features/auth/types"

// ✅ Correcto - Shared
import { Button, Input } from "@/shared/components/ui"
import { useAppDispatch } from "@/shared/store/hooks"

// ❌ Incorrecto (paths relativos largos)
import { User } from "../../../features/auth/types"

// ❌ Incorrecto (importar desde shared cuando está en features)
import { useAuth } from "@/shared/hooks/useAuth" // Ya no existe aquí
```

### Estructura de Features

Cada feature debe seguir esta estructura:

```
feature-name/
├── components/       # Componentes específicos del feature
├── services/         # Lógica de negocio y llamadas a API
├── types/            # Tipos TypeScript del feature
├── hooks/            # Hooks personalizados del feature
├── store/            # Redux slice (solo si el feature necesita estado global)
└── index.ts          # Barrel export para facilitar importaciones
```

**Ejemplo con auth feature:**

```
features/auth/
├── components/       # (vacío por ahora, forms están en app/)
├── services/
│   └── auth.service.ts    # login, register, forgotPassword, resetPassword
├── types/
│   └── index.ts           # User, AuthResponse, etc.
├── hooks/
│   ├── useAuth.ts         # Hook wrapper de Redux actions
│   └── index.ts
├── store/
│   └── authSlice.ts       # Redux slice con thunks
└── index.ts               # Export todo
```

### Barrel Exports

Usa `index.ts` para exportar todo desde un feature:

```typescript
// features/auth/index.ts
export * from "./types"
export * from "./services/auth.service"
```

### CSS Modules

Todos los estilos usan CSS Modules:

```typescript
import styles from './Component.module.css';

<div className={styles.container}>
  <h1 className={styles.title}>Title</h1>
</div>
```

## Estado de Implementación

### ✅ Completado

- Estructura de carpetas base con feature-first architecture
- **Autenticación completa:**
  - Registro con Formik + Yup validación
  - Login con Formik + Yup validación
  - Recuperar contraseña (forgot-password)
  - Restablecer contraseña (reset-password)
  - Logout
- **Estado Global:**
  - Migrado de Context API a Redux Toolkit
  - authSlice con thunks asíncronos
  - Hooks tipados (useAppDispatch, useAppSelector)
  - useAuth hook personalizado
- **Reorganización arquitectónica:**
  - authSlice movido a features/auth/store/
  - useAuth movido a features/auth/hooks/
  - Todos los imports actualizados (11 archivos)
  - Carpetas vacías eliminadas
- Completar perfil
- Dashboard de usuario
- Perfil de usuario (ver, editar)
- Cambio de contraseña
- Panel de administración básico
- Protección de rutas con middleware
- CSS Modules en todos los componentes
- Tipos TypeScript para todas las features
- **Build exitoso con 13 rutas**

### 🚧 Por Implementar

- Verificación de email
- Gestión de localizaciones (CRUD)
- Gestión de empresas (CRUD)
- Gestión de espacios de exhibición (CRUD)
- Sistema de aprobación de administrador
- Acceso y gestión del banco de contenido
- Catálogo de películas
- Sistema de solicitudes de películas
- Sistema de retroalimentación
- Reportes y estadísticas para administradores

## Tecnologías Utilizadas

- **Next.js 16**: Framework de React con App Router
- **React 19.2**: Biblioteca de UI
- **TypeScript 5**: Tipado estático
- **Redux Toolkit**: Estado global con slices y thunks
- **Formik 2.4.6**: Manejo de formularios
- **Yup 1.5.0**: Validación de esquemas
- **CSS Modules**: Estilos encapsulados
- **JWT**: Autenticación con tokens
- **Fetch API**: Cliente HTTP personalizado

## Variables de Entorno

```env
# Development
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# Production
NEXT_PUBLIC_API_URL=https://api.cinemaec.com/api
```

## Comandos Útiles

```bash
# Desarrollo
npm run dev

# Construcción
npm run build

# Producción
npm run start

# Linting
npm run lint
```

## Próximos Pasos

1. ~~Implementar verificación de email~~ (pendiente backend)
2. ~~Migrar a Redux Toolkit~~ ✅ Completado
3. ~~Agregar Formik + Yup a formularios~~ ✅ Completado
4. ~~Sistema de recuperación de contraseña~~ ✅ Completado
5. ~~Reorganizar arquitectura feature-first~~ ✅ Completado
6. Crear páginas y componentes para gestión de localizaciones
7. Crear páginas y componentes para gestión de empresas
8. Crear páginas y componentes para espacios de exhibición
9. Implementar sistema de aprobación de administrador
10. Desarrollar funcionalidad de banco de contenido
11. Implementar solicitudes de películas
12. Desarrollar sistema de feedback

---

## 📝 Changelog de Reorganización

### 2024 - Migración a Redux Toolkit y Feature-First Architecture

**Cambios Principales:**

1. ✅ Migrado de Context API a Redux Toolkit
2. ✅ Movido `authSlice.ts` de `shared/store/slices/` a `features/auth/store/`
3. ✅ Movido `useAuth.ts` de `shared/hooks/` a `features/auth/hooks/`
4. ✅ Actualizado 11 archivos con nuevos imports
5. ✅ Eliminado `AuthContext.tsx` (reemplazado por Redux)
6. ✅ Agregado Formik + Yup a login y register
7. ✅ Implementado sistema completo de recuperación de contraseña
8. ✅ Eliminadas carpetas vacías: `shared/hooks/`, `shared/utils/`, `shared/store/slices/`, `shared/contexts/`

**Archivos Afectados:**

- `/app/login/page.tsx` - Actualizado import
- `/app/register/page.tsx` - Actualizado import
- `/app/page.tsx` - Actualizado import
- `/app/complete-profile/page.tsx` - Actualizado import
- `/app/dashboard/page.tsx` - Actualizado import
- `/app/profile/page.tsx` - Actualizado import
- `/app/profile/change-password/page.tsx` - Actualizado import
- `/app/admin/page.tsx` - Actualizado import
- `/shared/components/Navbar.tsx` - Actualizado import
- `/shared/store/index.ts` - Actualizado import de authReducer
- `/shared/store/ReduxProvider.tsx` - Actualizado import de initializeAuth

**Nueva Estructura de Auth:**

```
features/auth/
├── hooks/
│   ├── index.ts
│   └── useAuth.ts
├── services/
│   └── auth.service.ts
├── store/
│   └── authSlice.ts
└── types/
    └── index.ts
```

**Build Status:** ✅ Exitoso - 13 rutas generadas sin errores
