# Migración a Redux Toolkit

## 📦 Resumen de la Migración

Se ha reemplazado exitosamente **Context API** por **Redux Toolkit** para el manejo de estado global de autenticación.

## 🎯 Ventajas de Redux Toolkit

1. **Mejor performance**: Optimizaciones automáticas y menos re-renders
2. **DevTools integradas**: Debugging avanzado con Redux DevTools
3. **Middleware**: Soporte para thunks, sagas, etc.
4. **Inmutabilidad automática**: Usa Immer internamente
5. **TypeScript nativo**: Tipado fuerte sin configuración extra
6. **Código más limpio**: Menos boilerplate que Redux tradicional
7. **Mejor escalabilidad**: Fácil agregar más slices

## 📁 Estructura Creada

```
src/shared/
├── store/
│   ├── index.ts                 # Configuración del store
│   ├── hooks.ts                 # Hooks tipados (useAppDispatch, useAppSelector)
│   ├── ReduxProvider.tsx        # Provider de Redux
│   └── slices/
│       └── authSlice.ts         # Slice de autenticación
└── hooks/
    └── useAuth.ts               # Hook personalizado para auth
```

## 🔧 Componentes Principales

### 1. Store (`src/shared/store/index.ts`)

- Configuración central del store
- Combina todos los reducers
- Tipos exportados: `RootState`, `AppDispatch`

### 2. Auth Slice (`src/shared/store/slices/authSlice.ts`)

Incluye:

- **Estado**: `user`, `isLoading`, `isAuthenticated`, `error`
- **Async Thunks**:
  - `initializeAuth` - Inicializa auth desde localStorage
  - `loginAsync` - Login de usuario
  - `registerAsync` - Registro de usuario
  - `logoutAsync` - Cerrar sesión
  - `refreshUserAsync` - Actualizar datos del usuario
- **Reducers síncronos**:
  - `updateUser` - Actualizar usuario manualmente
  - `clearError` - Limpiar errores

### 3. Custom Hook (`src/shared/hooks/useAuth.ts`)

Wrapper sobre Redux que proporciona la misma API que el antiguo Context:

```typescript
const {
  user,
  isLoading,
  isAuthenticated,
  error,
  login,
  register,
  logout,
  updateUser,
  refreshUser,
  clearError,
} = useAuth()
```

## 🔄 Cambios Realizados

### Archivos Modificados

1. ✅ `src/app/layout.tsx` - Reemplazado `AuthProvider` por `ReduxProvider`
2. ✅ `src/app/register/page.tsx` - Actualizado import
3. ✅ `src/app/login/page.tsx` - Actualizado import
4. ✅ `src/app/page.tsx` - Actualizado import
5. ✅ `src/app/dashboard/page.tsx` - Actualizado import
6. ✅ `src/app/admin/page.tsx` - Actualizado import
7. ✅ `src/app/profile/page.tsx` - Actualizado import
8. ✅ `src/app/profile/change-password/page.tsx` - Actualizado import
9. ✅ `src/app/complete-profile/page.tsx` - Actualizado import
10. ✅ `src/shared/components/Navbar.tsx` - Actualizado import

### Archivos Deprecados (pueden eliminarse)

- `src/shared/contexts/AuthContext.tsx` - Ya no se usa

## 📝 Uso en Componentes

### Antes (Context API)

```tsx
import { useAuth } from "@/shared/contexts/AuthContext"

const { user, login, logout } = useAuth()
```

### Ahora (Redux Toolkit)

```tsx
import { useAuth } from "@/shared/hooks/useAuth"

const { user, login, logout } = useAuth()
```

**¡La API es exactamente la misma!** No se requieren cambios en la lógica de los componentes.

## 🔍 Debugging con Redux DevTools

1. Instala la extensión [Redux DevTools](https://github.com/reduxjs/redux-devtools)
2. Abre las DevTools del navegador
3. Ve a la pestaña "Redux"
4. Inspecciona:
   - Estado actual
   - Historial de acciones
   - Time-travel debugging
   - State diffs

## 🚀 Próximos Pasos

Para agregar más funcionalidad al store:

1. **Crear un nuevo slice**:

```bash
touch src/shared/store/slices/moviesSlice.ts
```

2. **Agregar al store**:

```typescript
// src/shared/store/index.ts
import moviesReducer from "./slices/moviesSlice"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    movies: moviesReducer, // ← Nuevo slice
  },
})
```

3. **Crear hook personalizado**:

```typescript
// src/shared/hooks/useMovies.ts
export function useMovies() {
  const dispatch = useAppDispatch()
  const movies = useAppSelector((state) => state.movies)
  // ...
}
```

## 📦 Dependencias Instaladas

```json
{
  "@reduxjs/toolkit": "^2.x.x",
  "react-redux": "^9.x.x"
}
```

## ✨ Beneficios Adicionales

1. **Persistencia**: Fácil integrar `redux-persist` si se necesita
2. **Testing**: Más fácil testear con Redux
3. **Middleware**: Agregar logging, analytics, etc.
4. **RTK Query**: Manejo de cache y fetching automático (opcional)
5. **Código predecible**: Flujo unidireccional de datos

## 🎓 Recursos

- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Redux DevTools](https://github.com/reduxjs/redux-devtools)
- [Best Practices](https://redux.js.org/style-guide/style-guide)
