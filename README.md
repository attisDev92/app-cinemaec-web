# CinemaEC Frontend# CinemaEC Frontend# Frontend - Sistema de Gestión CinemaEC



Sistema de gestión de exhibiciones cinematográficas de Ecuador. Plataforma para gestionar espacios de exhibición, solicitudes de películas del banco de contenido nacional, y retroalimentación de exhibiciones.



## 🚀 TecnologíasSistema de gestión de exhibiciones cinematográficas de Ecuador. Plataforma para gestionar espacios de exhibición, solicitudes de películas del banco de contenido nacional, y retroalimentación de exhibiciones.Sistema de autenticación y gestión de usuarios para plataforma de cine construido con Next.js 16 y TypeScript.



- **Next.js 16** - Framework de React con App Router

- **React 19.2** - Biblioteca de UI

- **TypeScript 5** - Tipado estático## 🚀 Tecnologías## 🚀 Getting Started

- **CSS Modules** - Estilos encapsulados

- **JWT** - Autenticación con tokens



## 📁 Arquitectura- **Next.js 16** - Framework de React con App RouterPrimero, instala las dependencias:



Este proyecto utiliza una **arquitectura basada en features** para mejorar la escalabilidad y mantenibilidad. Cada funcionalidad está organizada en su propio módulo con componentes, servicios, tipos y hooks específicos.- **React 19.2** - Biblioteca de UI



Para más detalles, consulta:- **TypeScript 5** - Tipado estático```bash

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Documentación completa de la arquitectura

- [`src/features/README.md`](./src/features/README.md) - Guía de features y convenciones- **CSS Modules** - Estilos encapsuladosnpm install



### Estructura Principal- **JWT** - Autenticación con tokens```



```

src/

├── app/              # Páginas de Next.js (App Router)## 📁 ArquitecturaLuego, inicia el servidor de desarrollo:

├── features/         # Módulos de funcionalidades

│   ├── auth/         # Autenticación

│   ├── profile/      # Perfil de usuario

│   ├── locations/    # LocalizacionesEste proyecto utiliza una **arquitectura basada en features** para mejorar la escalabilidad y mantenibilidad. Cada funcionalidad está organizada en su propio módulo con componentes, servicios, tipos y hooks específicos.```bash

│   ├── companies/    # Empresas

│   ├── spaces/       # Espacios de exhibiciónnpm run dev

│   ├── user-cb/      # Usuarios del banco de contenido

│   ├── movies/       # Catálogo de películasPara más detalles, consulta:```

│   ├── film-requests/# Solicitudes de películas

│   └── feedback/     # Retroalimentación- [`ARCHITECTURE.md`](./ARCHITECTURE.md) - Documentación completa de la arquitectura

├── shared/           # Código compartido

│   ├── components/- [`src/features/README.md`](./src/features/README.md) - Guía de features y convencionesAbre [http://localhost:3000](http://localhost:3000) para ver la aplicación.

│   ├── contexts/

│   ├── types/

│   ├── hooks/

│   └── utils/### Estructura Principal## 📁 Estructura del Proyecto

└── lib/              # Librerías y configuraciones

```



## 🔧 Configuración``````



### Variables de Entornosrc/src/



Crea archivos `.env.local` y `.env.production` en la raíz del proyecto:├── app/              # Páginas de Next.js (App Router)├── app/                          # Páginas de Next.js (App Router)



```env├── features/         # Módulos de funcionalidades│   ├── admin/                    # Páginas de administración

# .env.local (Desarrollo)

NEXT_PUBLIC_API_URL=http://localhost:3001/api│   ├── auth/│   ├── complete-profile/         # Completar perfil después del registro



# .env.production (Producción)│   ├── profile/│   ├── dashboard/                # Dashboard de usuario

NEXT_PUBLIC_API_URL=https://api.cinemaec.com/api

```│   ├── locations/│   ├── login/                    # Página de inicio de sesión



Ver `.env.example` para más detalles.│   ├── companies/│   ├── profile/                  # Perfil y cambiar contraseña



## 🚀 Inicio Rápido│   ├── exhibition-spaces/│   ├── register/                 # Página de registro



```bash│   ├── content-bank/│   └── page.tsx                  # Página de inicio

# Instalar dependencias

npm install│   ├── film-requests/├── components/                   # Componentes reutilizables



# Modo desarrollo│   └── feedback/│   ├── ui/                       # Componentes de UI (Button, Card, Input)

npm run dev

├── shared/           # Código compartido│   └── Navbar.tsx                # Barra de navegación

# Construir para producción

npm run build│   ├── components/├── contexts/                     # Contextos de React



# Ejecutar en producción│   ├── contexts/│   └── AuthContext.tsx           # Contexto de autenticación

npm run start

│   ├── types/├── services/                     # Servicios de API

# Linting

npm run lint│   ├── hooks/│   └── auth.service.ts           # Servicios de autenticación y usuario

```

│   └── utils/├── types/                        # Definiciones de TypeScript

El proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

└── lib/              # Librerías y configuraciones│   ├── api.ts                    # Tipos de API

## 📋 Flujo de la Aplicación

```│   └── auth.ts                   # Tipos de autenticación

### 1. Autenticación

1. Registro con email y contraseña├── lib/                          # Utilidades

2. Verificación de email (por implementar)

3. Login## 🔧 Configuración│   └── api-client.ts             # Cliente HTTP para APIs

4. Completar perfil (nombre, apellido, teléfono)

├── config/                       # Configuración

### 2. Registro de Información

El usuario debe completar estos pasos en orden:### Variables de Entorno│   └── environment.ts            # Variables de entorno



1. **Localización** (`/locations`) - Registrar ubicación física└── middleware.ts                 # Middleware para protección de rutas

2. **Empresa** (`/companies`) - Registrar organización responsable

3. **Espacio** (`/spaces`) - Registrar espacio de proyecciónCrea archivos `.env.local` y `.env.production` en la raíz del proyecto:```

   - Espera aprobación del administrador



### 3. Acceso al Banco de Contenido

4. **Usuario CB** (`/user-cb`) - Solicitar acceso al catálogo```env## ✨ Características Implementadas

   - Espera aprobación del administrador

# .env.local (Desarrollo)

### 4. Funcionalidades Activas

5. **Películas** (`/movies`) - Explorar catálogo disponibleNEXT_PUBLIC_API_URL=http://localhost:3001/api### 🔐 Autenticación

6. **Solicitudes** (`/film-requests`) - Solicitar películas

7. **Feedback** (`/feedback`) - Retroalimentación post-exhibición- Registro de usuarios



## 🎯 Funcionalidades Implementadas# .env.production (Producción)- Inicio de sesión



### ✅ CompletadasNEXT_PUBLIC_API_URL=https://api.cinemaec.com/api- Cierre de sesión

- [x] Sistema de autenticación completo

- [x] Gestión de perfil de usuario```- Completar perfil después del registro

- [x] Dashboard de usuario

- [x] Panel de administración básico- Gestión de tokens JWT

- [x] Protección de rutas

- [x] CSS Modules en todos los componentesVer `.env.example` para más detalles.- Contexto global de autenticación

- [x] Estructura de features completa con tipos TypeScript



### 🚧 Por Implementar

- [ ] Verificación de email## 🚀 Inicio Rápido### 👤 Gestión de Usuario

- [ ] CRUD de localizaciones

- [ ] CRUD de empresas- Ver perfil

- [ ] CRUD de espacios de exhibición

- [ ] Sistema de aprobación de administrador```bash- Editar información personal

- [ ] Gestión de usuarios CB

- [ ] Catálogo de películas# Instalar dependencias- Cambiar contraseña

- [ ] Sistema de solicitudes de películas

- [ ] Sistema de retroalimentaciónnpm install- Validación de formularios

- [ ] Reportes y estadísticas



## 🏗️ Comandos de Desarrollo

# Modo desarrollo### 📊 Dashboard

```bash

# Desarrollo con hot-reloadnpm run dev- Dashboard de usuario con servicios disponibles

npm run dev

- Dashboard de administrador con opciones de gestión

# Build de producción

npm run build# Construir para producción- Navegación protegida por roles (user/admin)



# Iniciar servidor de producciónnpm run build

npm run start

### 🛡️ Seguridad

# Linter

npm run lint# Ejecutar en producción- Middleware para proteger rutas privadas

```

npm run start- Redirección automática según autenticación

## 📚 Documentación Adicional

- Separación de permisos por roles

- [Arquitectura del Proyecto](./ARCHITECTURE.md)

- [Guía de Features](./src/features/README.md)# Linting

- [Next.js Documentation](https://nextjs.org/docs)

- [React Documentation](https://react.dev)npm run lint## 🔧 Variables de Entorno



## 🤝 Convenciones de Código```



### ImportacionesCrear `.env.local` para desarrollo:

Usa los alias de TypeScript:

```typescriptEl proyecto estará disponible en [http://localhost:3000](http://localhost:3000)

import { User } from '@/features/auth/types';

import { Button } from '@/shared/components/ui';```bash

import { useAuth } from '@/shared/contexts/AuthContext';

```## 📋 Flujo de la AplicaciónNEXT_PUBLIC_API_URL=http://localhost:3001



### ComponentesNEXT_PUBLIC_ENV=development

```typescript

import styles from './Component.module.css';### 1. Autenticación```



interface ComponentProps {1. Registro con email y contraseña

  // props

}2. Verificación de email (por implementar)Para producción (`.env.production`):



export function Component({ }: ComponentProps) {3. Login

  return <div className={styles.container}>...</div>;

}4. Completar perfil (nombre, apellido, teléfono)```bash

```

NEXT_PUBLIC_API_URL=https://api.cinemaec.com/api

### Servicios

```typescript### 2. Registro de InformaciónNEXT_PUBLIC_ENV=production

export const featureService = {

  async getAll(): Promise<Entity[]> {El usuario debe completar estos pasos en orden:```

    const response = await apiClient.get<ApiResponse<Entity[]>>('/endpoint');

    if (response.data) return response.data;

    throw new Error('Error message');

  },1. **Localización** - Registrar ubicación física del espacio## 📡 Endpoints del Backend Requeridos

};

```2. **Empresa** - Registrar la organización responsable



## 📝 Licencia3. **Espacio de Exhibición** - Registrar el espacio técnico de proyección### Autenticación



Este proyecto es privado y confidencial.   - Espera aprobación del administrador- `POST /auth/register` - Registro de usuario



## 👥 Contacto- `POST /auth/login` - Inicio de sesión



Para más información sobre el proyecto, contacta al equipo de desarrollo.### 3. Acceso al Banco de Contenido- `POST /auth/logout` - Cerrar sesión


4. **Solicitud de Acceso** - Solicitar acceso al catálogo de películas- `GET /auth/me` - Obtener usuario actual

   - Espera aprobación del administrador- `POST /auth/complete-profile` - Completar perfil



### 4. Funcionalidades Activas### Usuario

5. **Solicitudes de Películas** - Solicitar películas para exhibir- `GET /user/profile` - Obtener perfil

6. **Feedback** - Enviar retroalimentación post-exhibición- `PUT /user/profile` - Actualizar perfil

- `POST /user/change-password` - Cambiar contraseña

## 🎯 Funcionalidades Implementadas

## 📜 Scripts Disponibles

### ✅ Completadas

- [x] Sistema de autenticación completo```bash

- [x] Gestión de perfil de usuarionpm run dev          # Iniciar servidor de desarrollo

- [x] Dashboard de usuarionpm run build        # Construir para producción

- [x] Panel de administración básiconpm run start        # Iniciar servidor de producción

- [x] Protección de rutasnpm run lint         # Ejecutar linter

- [x] CSS Modules en todos los componentesnpm run lint:fix     # Corregir problemas de linting

- [x] Estructura de features completa con tipos TypeScriptnpm run format       # Formatear código con Prettier

npm run type-check   # Verificar tipos de TypeScript

### 🚧 Por Implementar```

- [ ] Verificación de email

- [ ] CRUD de localizaciones## 🔄 Flujo de Usuario

- [ ] CRUD de empresas

- [ ] CRUD de espacios de exhibición1. **Registro**: Usuario se registra con email y contraseña

- [ ] Sistema de aprobación de administrador2. **Completar Perfil**: Ingresa nombre, apellido y teléfono (opcional)

- [ ] Gestión del banco de contenido3. **Dashboard**: Accede al dashboard según su rol (usuario o admin)

- [ ] Catálogo de películas4. **Gestión de Perfil**: Puede editar información o cambiar contraseña

- [ ] Sistema de solicitudes de películas5. **Servicios**: Acceso a películas, reservas, promociones, etc.

- [ ] Sistema de retroalimentación

- [ ] Reportes y estadísticas## 🛠️ Tecnologías



## 🏗️ Comandos de Desarrollo- **Next.js 16** - Framework de React con App Router

- **TypeScript** - Tipado estático

```bash- **Tailwind CSS** - Estilos utility-first

# Desarrollo con hot-reload- **React Context** - Gestión de estado global

npm run dev- **Fetch API** - Peticiones HTTP



# Build de producción## 📝 Próximos Pasos

npm run build

Funcionalidades pendientes:

# Iniciar servidor de producción- [ ] Gestión de películas (usuario y admin)

npm run start- [ ] Sistema de reservas de entradas

- [ ] Gestión de salas y funciones

# Linter- [ ] Sistema de promociones y descuentos

npm run lint- [ ] Reportes y estadísticas (admin)

- [ ] Gestión de usuarios (admin)

# Linter con auto-fix- [ ] Historial de compras

npm run lint:fix- [ ] Notificaciones en tiempo real

```

## 🤝 Learn More

## 📚 Documentación Adicional

Para aprender más sobre Next.js:

- [Arquitectura del Proyecto](./ARCHITECTURE.md)

- [Guía de Features](./src/features/README.md)- [Next.js Documentation](https://nextjs.org/docs) - características y API de Next.js

- [Next.js Documentation](https://nextjs.org/docs)- [Learn Next.js](https://nextjs.org/learn) - tutorial interactivo de Next.js

- [React Documentation](https://react.dev)

## 🤝 Convenciones de Código

### Importaciones
Usa los alias de TypeScript:
```typescript
import { User } from '@/features/auth/types';
import { Button } from '@/shared/components/ui';
import { useAuth } from '@/shared/contexts/AuthContext';
```

### Componentes
```typescript
import styles from './Component.module.css';

interface ComponentProps {
  // props
}

export function Component({ }: ComponentProps) {
  return <div className={styles.container}>...</div>;
}
```

### Servicios
```typescript
export const featureService = {
  async getAll(): Promise<Entity[]> {
    const response = await apiClient.get<ApiResponse<Entity[]>>('/endpoint');
    if (response.data) return response.data;
    throw new Error('Error message');
  },
};
```

## 📝 Licencia

Este proyecto es privado y confidencial.

## 👥 Contacto

Para más información sobre el proyecto, contacta al equipo de desarrollo.
