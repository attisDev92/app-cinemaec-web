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

````

src/

├── app/              # Páginas de Next.js (App Router)## 📁 ArquitecturaLuego, inicia el servidor de desarrollo:

├── features/         # Módulos de funcionalidades

│   ├── auth/         # Autenticación

│   ├── profile/      # Perfil de usuario

│   ├── locations/    # LocalizacionesEste proyecto utiliza una **arquitectura basada en features** para mejorar la escalabilidad y mantenibilidad. Cada funcionalidad está organizada en su propio módulo con componentes, servicios, tipos y hooks específicos.```bash

│   ├── companies/    # Empresas

# CinemaEC Frontend

Sistema de gestión de exhibiciones cinematográficas de Ecuador. Frontend en Next.js que consume el backend de CinemaEC.

## 🚀 Inicio rápido

```bash
npm install
npm run dev
````

App: http://localhost:3000

## 🔧 Configuración

- Variables de entorno y requisitos: ver docs/setup.md
- Estructura del proyecto y convenciones: ver ARCHITECTURE.md y src/features/README.md

## 🔗 Documentación

- Guía de inicio: docs/setup.md
- API del backend (para frontend): docs/backend-api.md

# CinemaEC Frontend

Sistema de gestión de exhibiciones cinematográficas de Ecuador. Frontend en Next.js que consume el backend de CinemaEC.

## 🚀 Inicio rápido

```bash
npm install
npm run dev
```

La aplicación estará disponible en http://localhost:3000

## 📦 Tecnologías

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- CSS Modules
- JWT para autenticación

## 📚 Documentación

### Guías Esenciales

- **[Configuración inicial](docs/setup.md)** - Variables de entorno, instalación y estructura del proyecto
- **[API del Backend](docs/backend-api.md)** - Endpoints disponibles y contratos de datos
- **[Integración Frontend ↔ Backend](docs/frontend-integration.md)** - Patrones de servicio y flujos de integración
- **[Solución de Problemas](docs/troubleshooting.md)** - Errores comunes y sus soluciones

### Arquitectura y Convenciones

- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Arquitectura general del proyecto y principios de diseño
- **[Features Guide](src/features/README.md)** - Guía de módulos por funcionalidad (auth, spaces, movies, etc.)

## 🔧 Configuración

### Variables de Entorno

Crear `.env.local` para desarrollo:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_ENV=development
```

Para producción (`.env.production`):

```bash
NEXT_PUBLIC_API_URL=https://api.cinemaec.com/api
NEXT_PUBLIC_ENV=production
```

Ver [docs/setup.md](docs/setup.md) para más detalles.

## 📄 Licencia

Proyecto privado y confidencial.
