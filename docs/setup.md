# Guía de Inicio (Setup)

## Requisitos

- Node.js 20+
- npm 9+
- Acceso al backend y URL de API

## Variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_ENV=development
```

Para producción (`.env.production`):

```
NEXT_PUBLIC_API_URL=https://api.cinemaec.com/api
NEXT_PUBLIC_ENV=production
```

## Instalación y ejecución

```bash
npm install
npm run dev
```

App: http://localhost:3000

## Comandos útiles

- Desarrollo: `npm run dev`
- Linter: `npm run lint`
- Build: `npm run build`
- Producción: `npm run start`

## Estructura del proyecto (resumen)

- app/: rutas y páginas (Next.js App Router)
- features/: módulos por funcionalidad (auth, spaces, assets, etc.)
- shared/: componentes, tipos y utilidades compartidas
- lib/: cliente HTTP y configuración

Para más detalle consulta Arquitectura general en ../ARCHITECTURE.md.
