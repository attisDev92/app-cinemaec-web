# 🔧 Solución al Error de CORS

## 🚨 Error Actual

```
Access to fetch at 'http://localhost:3001/user/register' from origin 'http://localhost:3000'
has been blocked by CORS policy: The 'Access-Control-Allow-Origin' header has a value
'http://localhost:3001' that is not equal to the supplied origin.
```

**Problema:** El backend está configurado para permitir solicitudes desde `http://localhost:3001` (su propia URL) en lugar de `http://localhost:3000` (el frontend).

---

## ✅ Soluciones por Framework

### **1. NestJS**

#### **Opción A: En `main.ts` (Recomendado para desarrollo)**

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Configuración de CORS
  app.enableCors({
    origin: [
      "http://localhost:3000", // Frontend en desarrollo
      "https://cinemaec.com", // Frontend en producción (ajusta según tu dominio)
      "https://www.cinemaec.com", // Con www
    ],
    credentials: true, // Permite enviar cookies/tokens
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })

  // Prefijo global de rutas (si usas /api)
  app.setGlobalPrefix("api")

  await app.listen(3001)
  console.log(`🚀 Backend corriendo en http://localhost:3001`)
}
bootstrap()
```

#### **Opción B: Usando variables de entorno (Mejor práctica)**

```typescript
// src/main.ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // CORS dinámico según entorno
  const corsOrigins = process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ]

  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })

  app.setGlobalPrefix("api")
  await app.listen(process.env.PORT || 3001)
}
bootstrap()
```

**Archivo `.env` del backend:**

```bash
# Desarrollo
PORT=3001
CORS_ORIGINS=http://localhost:3000

# Producción
# CORS_ORIGINS=https://cinemaec.com,https://www.cinemaec.com
```

---

### **2. Express.js**

```typescript
// src/index.ts o app.ts
import express from "express"
import cors from "cors"

const app = express()

// Configuración de CORS
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://cinemaec.com",
      "https://www.cinemaec.com",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  }),
)

app.use(express.json())

// Tus rutas...
app.use("/api/auth", authRoutes)
app.use("/api/user", userRoutes)

app.listen(3001, () => {
  console.log("🚀 Backend corriendo en http://localhost:3001")
})
```

**Instalar dependencia:**

```bash
npm install cors
npm install --save-dev @types/cors
```

---

### **3. Express.js con configuración dinámica**

```typescript
import express from "express"
import cors from "cors"

const app = express()

// Función personalizada de validación de origen
const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      "http://localhost:3000",
      "https://cinemaec.com",
      "https://www.cinemaec.com",
    ]

    // Permitir solicitudes sin origin (Postman, apps móviles, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error("No permitido por CORS"))
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
}

app.use(cors(corsOptions))
app.use(express.json())

// Rutas...
app.listen(3001)
```

---

### **4. Fastify**

```typescript
import Fastify from "fastify"
import cors from "@fastify/cors"

const fastify = Fastify()

// Configurar CORS
await fastify.register(cors, {
  origin: [
    "http://localhost:3000",
    "https://cinemaec.com",
    "https://www.cinemaec.com",
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept"],
})

// Rutas...
fastify.listen({ port: 3001 })
```

---

## 🔍 **Verificación**

Después de configurar CORS, verifica con curl:

```bash
# Verificar preflight request (OPTIONS)
curl -X OPTIONS http://localhost:3001/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type,Authorization" \
  -v

# Deberías ver en la respuesta:
# Access-Control-Allow-Origin: http://localhost:3000
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, ...
# Access-Control-Allow-Headers: Content-Type, Authorization, ...
```

---

## 🚨 **Errores Comunes a Evitar**

### ❌ **Error 1: Permitir solo la URL del backend**

```typescript
// MAL - Permite solo el backend llamarse a sí mismo
app.enableCors({
  origin: "http://localhost:3001", // ❌ Esto está mal
})
```

### ❌ **Error 2: Usar `origin: true` en producción**

```typescript
// MAL - Permite CUALQUIER origen (inseguro)
app.enableCors({
  origin: true, // ❌ Solo usar en desarrollo
})
```

### ❌ **Error 3: No incluir credentials**

```typescript
// MAL - No permite enviar tokens/cookies
app.enableCors({
  origin: "http://localhost:3000",
  // ❌ Falta credentials: true
})
```

---

## ✅ **Configuración Recomendada (Producción)**

```typescript
// backend/src/main.ts
import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Obtener orígenes permitidos desde variables de entorno
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || []

  app.enableCors({
    origin: (origin, callback) => {
      // Permitir solicitudes sin origin (apps móviles, Postman)
      if (!origin) return callback(null, true)

      // Verificar si el origin está en la lista permitida
      if (allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        console.warn(`⚠️  CORS bloqueado para origin: ${origin}`)
        callback(new Error("No permitido por CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin"],
    exposedHeaders: ["Authorization"],
    maxAge: 3600, // Cache de preflight por 1 hora
  })

  app.setGlobalPrefix("api")

  const port = process.env.PORT || 3001
  await app.listen(port)
  console.log(`🚀 Backend: http://localhost:${port}`)
  console.log(`✅ CORS habilitado para: ${allowedOrigins.join(", ")}`)
}
bootstrap()
```

**Variables de entorno (.env):**

```bash
# .env.development
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# .env.production
PORT=3001
ALLOWED_ORIGINS=https://cinemaec.com,https://www.cinemaec.com
```

---

## 🧪 **Testing**

### **1. Prueba con curl**

```bash
# Preflight request
curl -X OPTIONS http://localhost:3001/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Request real
curl -X POST http://localhost:3001/api/auth/login \
  -H "Origin: http://localhost:3000" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}' \
  -v
```

### **2. Prueba desde el navegador**

```javascript
// Abre DevTools Console en http://localhost:3000
fetch("http://localhost:3001/api/auth/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    email: "test@test.com",
    password: "123456",
  }),
})
  .then((r) => r.json())
  .then(console.log)
  .catch(console.error)

// Si funciona, verás la respuesta del backend
// Si falla, verás el error de CORS
```

---

## 📚 **Recursos Adicionales**

- [MDN: CORS](https://developer.mozilla.org/es/docs/Web/HTTP/CORS)
- [NestJS CORS Documentation](https://docs.nestjs.com/security/cors)
- [Express CORS Package](https://www.npmjs.com/package/cors)

---

## 🎯 **Resumen**

1. **El problema:** Backend permite `http://localhost:3001` (él mismo) en vez de `http://localhost:3000` (frontend)
2. **La solución:** Cambiar `origin` a `http://localhost:3000` en la configuración de CORS
3. **Configuración mínima:**
   ```typescript
   app.enableCors({
     origin: "http://localhost:3000",
     credentials: true,
   })
   ```
4. **Después de cambiar:** Reinicia el servidor backend
5. **Verificar:** Recarga el frontend y prueba el registro nuevamente

✅ Una vez configurado, el error de CORS desaparecerá y las solicitudes funcionarán correctamente.
