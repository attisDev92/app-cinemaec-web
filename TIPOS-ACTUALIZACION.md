# Actualización del Sistema de Tipos

## 📋 Resumen de Cambios

Se ha actualizado completamente el sistema de tipos del frontend para alinearlo con la documentación del backend, manteniendo **camelCase** en el frontend y manejando correctamente las transformaciones desde **snake_case** del backend.

## 📁 Estructura de Tipos Creada

### `/src/shared/types/`

#### 1. **enums.ts** - Enumeraciones compartidas

- `UserRole`: ADMIN, EDITOR, USER
- `LegalStatus`: NATURAL_PERSON, LEGAL_ENTITY
- `AssetTypeEnum`: IMAGE, VIDEO, DOCUMENT, LOGO, OTHER
- `AssetOwnerEnum`: SPACE_LOGO, SPACE_PHOTO, USER_BC_PHOTO, etc.

#### 2. **user.ts** - Tipos de Usuario

- `User`: Entidad completa del usuario
- `LoginResponse`: Respuesta del login (con snake_case del backend)
- `UserProfileResponse`: Respuesta de GET /users/me (con snake_case)
- `RegisterDto`, `LoginDto`, `ChangePasswordDto`, `ForgotPasswordDto`, `ResetPasswordDto`, `VerifyEmailDto`
- `AuthResponse`: Respuesta de autenticación transformada a camelCase

#### 3. **profile.ts** - Tipos de Perfil

- `Profile`: Entidad completa del perfil (camelCase)
- `CreateProfileDto`: DTO para crear perfil
- `UpdateProfileDto`: DTO para actualizar perfil
- `ProfileResponse`: Respuesta con mensaje y perfil

#### 4. **asset.ts** - Tipos de Assets

- `Asset`: Entidad de archivo/asset
- `UploadAssetDto`: DTO para subir archivos (FormData)
- `QueryAssetsDto`: DTO para consultar assets

#### 5. **api.ts** - Tipos de API genéricos

- `SuccessResponse`: Respuesta de éxito genérica
- `ErrorResponse`: Respuesta de error
- `PaginatedResponse<T>`: Para paginación futura
- `ApiResponse<T>` y `ApiError`: Legacy types (compatibilidad)

#### 6. **index.ts** - Export centralizado

Exporta todos los tipos desde un solo punto de entrada

## 🔄 Compatibilidad con Código Existente

### `/src/features/auth/types/index.ts`

- Importa y re-exporta tipos de `@/shared/types`
- Mantiene aliases para compatibilidad:
  - `LoginCredentials = LoginDto`
  - `RegisterData = RegisterDto`
  - `VerifyEmailData = VerifyEmailDto`

### `/src/features/profile/types/index.ts`

- Importa y re-exporta tipos de `@/shared/types`
- Mantiene aliases:
  - `CompleteProfileData = CreateProfileDto`
  - `UpdateProfileData = UpdateProfileDto`
  - `ChangePasswordData = ChangePasswordDto`

### `/src/shared/types/auth.ts` (Legacy)

- Redirige a los nuevos tipos en `user.ts`
- Mantiene aliases para no romper imports existentes

## ⚠️ Campos en snake_case en Respuestas del Backend

Según la documentación, estos campos se mantienen en snake_case en las respuestas:

### En `LoginResponse` y `UserProfileResponse`:

- `is_active` (boolean)
- `has_profile` (boolean)
- `last_login` (Date | null)

### Transformación en Frontend

El servicio `authService.transformUserFromBackend()` ya maneja la transformación:

```typescript
{
  isActive: backendUser.is_active,
  hasProfile: backendUser.has_profile,
  lastLogin: backendUser.last_login,
}
```

## 📦 Formato de Datos

### Fechas

- **Backend**: Strings ISO 8601
- **Frontend (tipos)**: `Date` en interfaces, string en DTOs
- **Transformación**: Convertir a `Date` cuando sea necesario

```typescript
createdAt: new Date(data.createdAt)
```

### Perfil - birthdate

- **Formato**: `YYYY-MM-DD` (string)
- **Tipo en DTO**: `string`
- **Tipo en Entity**: `Date | null`

## 🎯 Uso Recomendado

### Imports

```typescript
// Importar desde shared types
import { UserRole, LegalStatus, Profile, User } from "@/shared/types"

// O desde feature types (usa los mismos tipos internamente)
import { User, LoginCredentials } from "@/features/auth/types"
import { Profile, LegalStatus } from "@/features/profile/types"
```

### Transformación de Respuestas

```typescript
// El servicio ya maneja la transformación
const user = await authService.getCurrentUser() // Ya en camelCase

// Para transformaciones manuales
const profile: Profile = {
  ...backendProfile,
  fullName: backendProfile.full_name,
  legalName: backendProfile.legal_name,
  tradeName: backendProfile.trade_name,
  legalStatus: backendProfile.legal_status as LegalStatus,
}
```

## ✅ Verificaciones Necesarias

### Archivos que usan tipos de User/Profile:

1. ✅ `/src/features/auth/services/auth.service.ts` - Transformación correcta
2. ⏳ `/src/features/auth/store/authSlice.ts` - Verificar tipos
3. ⏳ `/src/features/profile/store/profileSlice.ts` - Verificar tipos
4. ⏳ Componentes que usan `Profile` o `User`

### Puntos de atención:

- [ ] Verificar que todos los componentes usen `profile.fullName` (no `full_name`)
- [ ] Verificar que todos los componentes usen `profile.legalStatus` (no `legal_status`)
- [ ] Actualizar formularios que envían datos al backend (usar DTOs)
- [ ] Verificar transformaciones en servicios

## 🔧 Próximos Pasos

1. **Revisar y actualizar servicios**:
   - Verificar que `auth.service.ts` use correctamente las transformaciones
   - Verificar transformaciones en `profile` service

2. **Actualizar stores de Redux**:
   - Asegurar que `authSlice` use los tipos correctos
   - Asegurar que `profileSlice` use los tipos correctos

3. **Revisar componentes**:
   - Buscar usos de snake_case en componentes
   - Actualizar a camelCase

4. **Testing**:
   - Probar login/registro
   - Probar creación/edición de perfil
   - Verificar persistencia de datos

## 📝 Notas Importantes

1. **No modificar los tipos en `/src/shared/types/`** - Son la fuente de verdad
2. **Los aliases en feature types son solo para compatibilidad** - Usar los tipos de shared cuando sea posible
3. **Siempre transformar snake_case a camelCase** en servicios antes de guardar en estado
4. **Los DTOs mantienen camelCase** - El backend los acepta así
