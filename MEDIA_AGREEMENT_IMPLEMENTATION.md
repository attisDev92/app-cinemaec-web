# Acuerdo de Responsabilidad de Medios Electrónicos

## Resumen de la Implementación

Se ha implementado un sistema completo para la gestión del acuerdo de responsabilidad de medios electrónicos como parte del proceso de registro de usuarios.

## Flujo de Usuario

1. **Registro** → El usuario se registra en `/register`
2. **Verificación de Email** → El usuario verifica su email en `/verify-email`
3. **Completar Perfil** → El usuario completa su perfil en `/complete-profile`
4. **Acuerdo de Medios** → El usuario debe descargar, firmar y subir el acuerdo en `/media-agreement`
5. **Acceso al Sistema** → Solo después de subir el acuerdo puede acceder a `/home` y otros servicios

## Archivos Creados

### 1. `/src/app/media-agreement/page.tsx`

Página principal que gestiona el acuerdo de responsabilidad. Incluye:

- **Generación del documento**: Crea un documento de texto con los datos del usuario
- **Descarga del documento**: Permite al usuario descargar el documento en formato `.txt`
- **Subida del documento firmado**: Permite al usuario subir el documento firmado (PDF, JPG, PNG)
- **Validaciones**: Valida el tamaño (máx 5MB) y tipo de archivo
- **Protección de rutas**: Redirige si el usuario no está autenticado o no tiene perfil completo

#### Características:

- ✅ Genera documento personalizado con datos del usuario
- ✅ Descarga del documento en formato texto
- ✅ Validación de archivos (tipo y tamaño)
- ✅ Interfaz amigable con instrucciones claras
- ✅ Sin conexión al backend (preparado para futura integración)

### 2. `/src/app/media-agreement/page.module.css`

Estilos para la página del acuerdo con:

- Diseño responsive
- Gradiente de fondo atractivo
- Caja de información destacada
- Sección de subida de archivos con estilo drag-and-drop
- Mensajes de error y éxito bien diseñados

## Archivos Modificados

### 1. `/src/shared/types/user.ts`

Se agregó el campo `hasMediaAgreement?: boolean` al tipo `ExtendedUser` para rastrear si el usuario ha completado este paso.

```typescript
export interface ExtendedUser {
  // ... otros campos
  hasMediaAgreement?: boolean
  // ...
}
```

### 2. `/src/middleware.ts`

Se actualizó el middleware para:

- Agregar `/media-agreement` a las rutas que requieren perfil completo
- Documentar la futura validación del acuerdo de medios

### 3. `/src/app/complete-profile/page.tsx`

Se modificó para redirigir a `/media-agreement` en lugar de `/home` después de completar el perfil.

```typescript
router.push("/media-agreement") // Antes era: router.push("/home")
```

### 4. `/src/features/auth/hooks/useAuth.ts`

Se actualizó el hook de autenticación para:

- Verificar si el usuario ha subido el acuerdo de medios
- Redirigir a `/media-agreement` si no lo ha hecho
- Mantener el flujo de redirección correcto según el estado del usuario

```typescript
if (!user.hasProfile) {
  window.location.href = "/complete-profile"
} else if (!user.hasMediaAgreement) {
  window.location.href = "/media-agreement" // Nueva verificación
} else if (user.role === UserRole.ADMIN) {
  window.location.href = "/admin"
} else {
  window.location.href = "/home"
}
```

## Contenido del Documento

El documento generado incluye:

- **Fecha de generación**
- **Datos del usuario**: Nombre, Email, Cédula/RUC, Teléfono
- **8 Cláusulas principales**:
  1. Aceptación de responsabilidad
  2. Uso adecuado de la plataforma
  3. Protección de credenciales
  4. Veracidad de la información
  5. Cumplimiento normativo
  6. Responsabilidad por daños
  7. Privacidad y protección de datos
  8. Modificaciones
- **Campos para firma física**
- **Instrucciones para subir el documento**

## Estado Actual (Mock)

### Funcionalidades Implementadas

✅ Generación del documento con datos del usuario  
✅ Descarga del documento  
✅ Selección y validación de archivos  
✅ Interfaz de usuario completa  
✅ Flujo de navegación integrado  
✅ Validaciones de tipo y tamaño de archivo  
✅ Mensajes de error y éxito  
✅ Diseño responsive

### Pendiente para Conexión con Backend

🔄 Endpoint para subir el documento firmado  
🔄 Almacenamiento del documento en el servidor  
🔄 Actualización del campo `hasMediaAgreement` en la base de datos  
🔄 Recuperación del estado del acuerdo desde el backend

## Integración Futura con Backend

Cuando se implemente el backend, será necesario:

### 1. Crear Endpoint para Subir Documento

```typescript
// En page.tsx, líneas 172-178 (comentadas actualmente)
const formData = new FormData()
formData.append("file", uploadedFile)
const response = await fetch("/api/users/media-agreement", {
  method: "POST",
  body: formData,
})
if (!response.ok) throw new Error("Error al subir el documento")
```

### 2. Actualizar Base de Datos

Agregar campo `has_media_agreement` a la tabla de usuarios:

```sql
ALTER TABLE users ADD COLUMN has_media_agreement BOOLEAN DEFAULT FALSE;
```

### 3. Middleware del Backend

Agregar validación en el backend para verificar que el usuario haya subido el acuerdo antes de acceder a servicios protegidos.

### 4. Respuesta del Login

Incluir `has_media_agreement` en la respuesta del endpoint de login:

```typescript
{
  "user": {
    // ... otros campos
    "has_media_agreement": true
  }
}
```

## Validaciones Implementadas

### Validaciones de Archivo:

- ✅ Tipos permitidos: PDF, JPG, JPEG, PNG
- ✅ Tamaño máximo: 5MB
- ✅ Validación antes de permitir subida
- ✅ Mensajes de error claros

### Validaciones de Flujo:

- ✅ Usuario debe estar autenticado
- ✅ Usuario debe tener email verificado
- ✅ Usuario debe tener perfil completo
- ✅ Usuario no puede acceder a otros servicios sin subir el acuerdo
- ✅ Redirección automática según el estado del usuario

## Mejoras Futuras Opcionales

1. **Generación de PDF real**: Usar librerías como `jsPDF` o `react-pdf` para generar un PDF con formato profesional
2. **Firma digital**: Implementar firma digital usando librerías como `signature_pad`
3. **Preview del archivo**: Mostrar una vista previa del archivo antes de subir
4. **Historial de documentos**: Permitir resubir el documento si es necesario
5. **Notificaciones por email**: Enviar confirmación cuando se suba el documento
6. **Dashboard de admin**: Panel para revisar y aprobar documentos subidos

## Pruebas Recomendadas

1. Completar el flujo completo de registro hasta subir el acuerdo
2. Verificar que no se pueda acceder a `/home` sin subir el acuerdo
3. Verificar que la descarga del documento funcione correctamente
4. Probar con diferentes tipos de archivo (válidos e inválidos)
5. Probar con archivos de diferentes tamaños
6. Verificar el flujo de redirecciones en diferentes estados del usuario

## Notas Técnicas

- El documento actualmente se genera como archivo de texto (.txt)
- La subida es simulada con un delay de 1.5 segundos
- El estado `hasMediaAgreement` se actualiza localmente en el cliente
- Todos los componentes son client-side (`"use client"`)
- Se utilizan los componentes UI existentes del proyecto

---

**Fecha de implementación**: Diciembre 2025  
**Versión**: 1.0.0  
**Estado**: Listo para pruebas (Mock mode)
