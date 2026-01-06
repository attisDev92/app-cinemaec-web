# API del Backend (consumida por el Frontend)

Todas las llamadas usan el `apiClient` con `Authorization: Bearer <token>` cuando el usuario está autenticado.

Base URL: `${NEXT_PUBLIC_API_URL}` (ver docs/setup.md)

## Autenticación y usuario

- POST /users/login
- POST /users/register
- POST /auth/logout
- GET /users/me
- POST /profiles

Referencias: src/features/auth/services/auth.service.ts

## Espacios (REA)

- POST /spaces
- GET /spaces
- GET /spaces/my-spaces
- GET /spaces/:id
- PUT /spaces/:id
- DELETE /spaces/:id
- PUT /spaces/:id/status
- POST /spaces/:id/review
- GET /spaces/:id/reviews

Servicio: src/features/spaces/services/space.service.ts

## Assets (archivos)

- POST /assets/upload (multipart/form-data)
  - Campos: file, documentType, ownerType, [ownerId]
  - Respuesta: `{ id, url, documentType, ownerType }`

Servicio: src/features/assets/services/asset.service.ts

## Contratos (nueva integración)

- POST /contracts

Body esperado (ejemplo):

```
{
  "adminName": "Juan Pérez",
  "spaceId": 456,
  "contractType": "space",
  "documentUrl": "https://...",
  "startDate": "2025-11-25T12:00:00Z",      // opcional
  "expirationDate": "2026-11-25T12:00:00Z"  // opcional
}
```

Respuesta (resumen):

```
{
  "id": 789,
  "userId": 2,
  "adminId": 5,
  "spaceId": 456,
  "contractType": "space",
  "documentUrl": "https://...",
  "startDate": "2025-11-25T12:00:00.000Z",
  "expirationDate": "2026-11-25T12:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "..."
}
```

Servicio: src/features/contracts/services/contract.service.ts

## Autorización

Incluye el token JWT en cada petición protegida:

```
Authorization: Bearer <token>
```

El token se guarda/lee desde localStorage por `authService`.
