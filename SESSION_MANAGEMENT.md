# 🔐 Gestión de Sesión - CinemaEC Frontend

## 📋 Resumen

Este documento explica cómo funciona la persistencia de sesión, autenticación y manejo de tokens en la aplicación CinemaEC.

---

## 🔄 Flujo de Autenticación

### 1. **Inicio de Sesión**

```typescript
// Usuario ingresa credenciales en /login
authService.login({ email, password })
  ↓
// Backend responde con token + user data
{ token: "jwt_token_here", user: { id, email, name... } }
  ↓
// Se guarda en localStorage
localStorage.setItem("token", token)
localStorage.setItem("user", JSON.stringify(user))
localStorage.setItem("tokenExpiresAt", Date.now() + 7_días)
  ↓
// Redux actualiza el estado
authSlice: { user, isAuthenticated: true }
  ↓
// Usuario es redirigido al dashboard
```

### 2. **Persistencia de Sesión**

La sesión persiste incluso si:

- ✅ El usuario cierra el navegador
- ✅ El usuario recarga la página
- ✅ El usuario abre la app en una nueva pestaña

**Duración de la sesión: 7 días**

```typescript
// En authService
TOKEN_EXPIRATION_TIME: 7 * 24 * 60 * 60 * 1000 // 7 días en ms
```

### 3. **Inicialización al Cargar la App**

Cada vez que la aplicación se carga:

```typescript
// ReduxProvider.tsx ejecuta al montar
useEffect(() => {
  store.dispatch(initializeAuth())
}, [])
```

**Proceso de inicialización:**

```
1. Verificar expiración local
   ↓
   ¿Sesión expirada? → SÍ → Limpiar localStorage → Usuario no autenticado
   ↓ NO
2. Obtener token y user de localStorage
   ↓
   ¿Existen? → NO → Usuario no autenticado
   ↓ SÍ
3. Validar token con backend (GET /auth/me)
   ↓
   ¿Token válido? → SÍ → Actualizar user data → Usuario autenticado
   ↓ NO
4. Token inválido → Limpiar localStorage → Usuario no autenticado
```

---

## 💾 Almacenamiento Local

### Datos Guardados en localStorage

| Clave            | Tipo               | Descripción                | Ejemplo                                     |
| ---------------- | ------------------ | -------------------------- | ------------------------------------------- |
| `token`          | string             | JWT token de autenticación | `"eyJhbGciOiJIUzI1NiIsInR..."`              |
| `user`           | JSON string        | Datos del usuario          | `'{"id":1,"email":"user@example.com",...}'` |
| `tokenExpiresAt` | string (timestamp) | Fecha de expiración en ms  | `"1731446400000"`                           |

### Métodos del authService

```typescript
// Guardar sesión
authService.saveSession(token, user)
// → Guarda token, user y tokenExpiresAt

// Limpiar sesión
authService.clearSession()
// → Elimina token, user y tokenExpiresAt

// Verificar validez
authService.isSessionValid()
// → Compara Date.now() con tokenExpiresAt

// Obtener datos
authService.getStoredToken() // → Retorna token si no expiró
authService.getStoredUser() // → Retorna user si no expiró
authService.isAuthenticated() // → true si sesión válida
```

---

## 🔒 Seguridad

### 1. **Validación de Token en Cada Request**

Todos los requests autenticados incluyen el token:

```typescript
// api-client.ts
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 2. **Manejo de Token Expirado (401 Unauthorized)**

Si el backend responde con 401:

```typescript
// api-client.ts - Interceptor automático
if (response.status === 401) {
  // 1. Limpiar sesión local
  localStorage.removeItem("token")
  localStorage.removeItem("user")
  localStorage.removeItem("tokenExpiresAt")

  // 2. Redirigir al login con mensaje
  window.location.href = "/login?session=expired"
}
```

### 3. **Verificación en Dos Niveles**

#### **Nivel 1: Cliente (Expiración Local)**

```typescript
isSessionValid() {
  const expiresAt = parseInt(localStorage.getItem('tokenExpiresAt'))
  const now = Date.now()

  if (now >= expiresAt) {
    // Sesión expirada localmente
    this.clearSession()
    return false
  }
  return true
}
```

**Ventajas:**

- No requiere request al backend
- Respuesta instantánea
- Reduce carga en el servidor

#### **Nivel 2: Servidor (Validación de Token)**

```typescript
// initializeAuth thunk
const currentUser = await authService.getCurrentUser()
// → GET /auth/me con token
// → Backend verifica firma JWT, expiración, revocación, etc.
```

**Ventajas:**

- Verifica que el token no fue revocado
- Detecta tokens manipulados
- Actualiza datos del usuario

---

## ⚠️ Expiración de Sesión

### Mensaje al Usuario

Cuando la sesión expira (401 del backend), el usuario ve:

```
┌─────────────────────────────────────────┐
│ ⚠️  Tu sesión ha expirado.              │
│     Por favor, inicia sesión nuevamente.│
└─────────────────────────────────────────┘
```

### Páginas que NO Redirigen

Las siguientes páginas públicas no redirigen al login en caso de 401:

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`

```typescript
// api-client.ts
if (!window.location.pathname.startsWith('/login') &&
    !window.location.pathname.startsWith('/register') &&
    // ...otras páginas públicas
) {
  window.location.href = '/login?session=expired'
}
```

---

## 🔄 Refresh de Usuario

Para actualizar los datos del usuario sin cerrar sesión:

```typescript
// Desde cualquier componente
const { refreshUser } = useAuth()

await refreshUser()
// → Llama a GET /auth/me
// → Actualiza localStorage y Redux
// → NO invalida la sesión
```

**Casos de uso:**

- Después de actualizar el perfil
- Después de completar el perfil
- Para verificar cambios de rol/permisos

---

## 🛡️ Protección de Rutas

### Middleware de Next.js

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")
  const path = request.nextUrl.pathname

  // Rutas protegidas
  if (protectedPaths.some((p) => path.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  // Rutas solo para no autenticados
  if (authPaths.some((p) => path.startsWith(p))) {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }
}
```

---

## 📊 Estados de Autenticación

### Redux State

```typescript
interface AuthState {
  user: User | null // Datos del usuario
  isLoading: boolean // Cargando autenticación
  isAuthenticated: boolean // Usuario autenticado
  error: string | null // Error de autenticación
}
```

### Ciclo de Vida

```
┌─────────────────┐
│ Initial Load    │
│ isLoading: true │
└────────┬────────┘
         │
         ├── Token válido ────→ ┌──────────────────────┐
         │                      │ Authenticated         │
         │                      │ user: {...}          │
         │                      │ isAuthenticated: true│
         │                      │ isLoading: false     │
         │                      └──────────────────────┘
         │
         └── Token inválido ──→ ┌──────────────────────┐
             o expirado         │ Not Authenticated     │
                                │ user: null           │
                                │ isAuthenticated: false│
                                │ isLoading: false     │
                                └──────────────────────┘
```

---

## 🚀 Mejoras Futuras

### 1. **Refresh Token**

Implementar sistema de refresh token para renovar automáticamente la sesión:

```typescript
// Pseudocódigo
if (tokenExpiresIn < 1_hora) {
  const newToken = await authService.refreshToken()
  authService.saveSession(newToken, user)
}
```

### 2. **HttpOnly Cookies**

Mover tokens de localStorage a cookies HttpOnly para mayor seguridad:

```typescript
// Backend establece cookie
Set-Cookie: token=...; HttpOnly; Secure; SameSite=Strict
```

**Ventajas:**

- No accesible desde JavaScript
- Protege contra XSS
- Más seguro que localStorage

### 3. **Session Activity Tracking**

Extender sesión automáticamente con actividad del usuario:

```typescript
// Cada acción del usuario resetea el timer
onUserActivity(() => {
  const newExpiresAt = Date.now() + 7_días
  localStorage.setItem('tokenExpiresAt', newExpiresAt.toString())
})
```

### 4. **Multi-Tab Sync**

Sincronizar estado de autenticación entre pestañas:

```typescript
// localStorage event listener
window.addEventListener("storage", (e) => {
  if (e.key === "token" && !e.newValue) {
    // Token eliminado en otra pestaña
    store.dispatch(logoutAsync())
  }
})
```

---

## 📝 Resumen Técnico

| Característica          | Implementación         |
| ----------------------- | ---------------------- |
| **Almacenamiento**      | localStorage           |
| **Duración**            | 7 días                 |
| **Validación cliente**  | Timestamp comparison   |
| **Validación servidor** | GET /auth/me           |
| **Manejo 401**          | Auto-logout + redirect |
| **Inicialización**      | Automática en mount    |
| **Estado global**       | Redux Toolkit          |
| **Protección rutas**    | Next.js middleware     |
| **Refresh user**        | Manual via hook        |

---

## 🔍 Debugging

### Ver estado de sesión

```javascript
// En DevTools Console
localStorage.getItem("token")
localStorage.getItem("user")
localStorage.getItem("tokenExpiresAt")

// Verificar expiración
const expiresAt = parseInt(localStorage.getItem("tokenExpiresAt"))
const now = Date.now()
const remaining = expiresAt - now
const daysLeft = remaining / (24 * 60 * 60 * 1000)
console.log(`Sesión expira en ${daysLeft.toFixed(2)} días`)
```

### Redux DevTools

```javascript
// Ver estado de auth
store.getState().auth

// Ver acciones de autenticación
// En Redux DevTools → Action History
// Buscar: auth/login, auth/initialize, auth/logout
```

---

## ❓ FAQ

**P: ¿Por qué 7 días de duración?**  
R: Balance entre seguridad y experiencia de usuario. Suficientemente largo para no molestar, suficientemente corto para seguridad.

**P: ¿Qué pasa si cambio la fecha del sistema?**  
R: La validación del servidor detectará el token manipulado y rechazará el request.

**P: ¿Se puede usar en múltiples dispositivos?**  
R: Sí, cada dispositivo tiene su propia sesión independiente.

**P: ¿Qué pasa si el backend cambia el schema de User?**  
R: El próximo `getCurrentUser()` actualizará los datos con el nuevo schema.

**P: ¿localStorage es seguro?**  
R: Para SPAs es aceptable. Para mayor seguridad considerar HttpOnly cookies (ver Mejoras Futuras).
