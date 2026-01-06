# Integración Frontend ↔ Backend

## Cliente HTTP

- Definido en `lib/api-client.ts`.
- Incluye automáticamente el token (`Authorization`) si existe en localStorage.

## Patrones de servicio

- Crear un archivo `*.service.ts` por feature dentro de `src/features/<feature>/services`.
- Exponer métodos tipados (`getX`, `createX`, `updateX`, etc.).
- Mantener los DTOs y tipos en `src/shared/types` o en `src/features/<feature>/types`.

## Subida de documentos

- Usa `DocumentUpload` para PDFs (contratos, documentos de soporte).
- Usa `ImageUpload`/`MultiImageUpload` para imágenes (logo, fotos de espacio).
- `DocumentUpload` emite `(id, url)`; guarda ambos si después crearás entidades que requieren `documentUrl`.

## Flujo de contrato REA (espacios)

1. El usuario registra el espacio.
2. Genera y firma la Carta Compromiso (se descarga .docx).
3. Sube el PDF firmado con `DocumentUpload`.
4. Se crea el contrato vía `contractService.createContract({ adminName, spaceId, contractType: "space", documentUrl })`.

Código de referencia: `src/app/rea-spaces/agreement/[id]/page.tsx`.

## Añadir nuevos endpoints

1. Crea o extiende un servicio en `src/features/<feature>/services`.
2. Define tipos de request/response.
3. Maneja casos donde el backend devuelve `{ data: ... }` o un array/objeto directo.
4. Añade tests manuales desde la UI y logs controlados si es necesario.

## Manejo de sesión

- `authService` guarda el token y usuario en localStorage y cookie.
- `useAuth` y `useProfile` son hooks para consumir el estado actual.
- Verifica expiración de token antes de usarlo.
