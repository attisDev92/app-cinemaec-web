import { UserRole, PermissionEnum } from "./enums"

// Re-export UserRole and PermissionEnum for convenience
export { UserRole, PermissionEnum } from "./enums"

// User Entity
export interface User {
  id: number
  email: string
  cedula: string
  role: UserRole
  permissions?: PermissionEnum[]
  isActive: boolean
  emailVerificationToken: string | null
  passwordResetToken: string | null
  passwordResetExpires: Date | null
  profileId: number | null
  lastLogin: Date | null
  createdAt: Date
}

// Extended User (para uso en frontend con campos adicionales)
export interface ExtendedUser
  extends Omit<User, "createdAt" | "lastLogin" | "passwordResetExpires"> {
  hasProfile: boolean
  permissions?: PermissionEnum[]
  createdAt?: string
  lastLogin?: string | null
  passwordResetExpires?: string | null
  // Campos adicionales del perfil (si existen)
  firstName?: string
  lastName?: string
  phone?: string
  // Flags para indicar registros completados
  hasLocation?: boolean
  hasCompany?: boolean
  hasSpace?: boolean
  isUserCB?: boolean
  userCBApproved?: boolean
  hasUploadedAgreement?: boolean
  updatedAt?: string
}

// Login Response
export interface LoginResponse {
  accessToken: string
  user: {
    id: number
    email: string
    cedula: string
    role: string
    is_active: boolean // Este campo se mantiene en snake_case en la respuesta
    has_profile: boolean // Este campo se mantiene en snake_case en la respuesta
    permissions: string[]
  }
}

// User Profile Response (GET /users/me)
export interface UserProfileResponse {
  id: number
  email: string
  cedula: string
  role: string
  is_active: boolean // Este campo se mantiene en snake_case en la respuesta
  has_profile: boolean // Este campo se mantiene en snake_case en la respuesta
  last_login: Date | null // Este campo se mantiene en snake_case en la respuesta
}

// Register DTO
export interface RegisterDto {
  email: string
  cedula: string
  password: string
}

// Login DTO
export interface LoginDto {
  email: string
  password: string
}

// Change Password DTO
export interface ChangePasswordDto {
  currentPassword: string
  newPassword: string
}

// Forgot Password DTO
export interface ForgotPasswordDto {
  email: string
}

// Reset Password DTO
export interface ResetPasswordDto {
  token: string
  newPassword: string
}

// Verify Email DTO
export interface VerifyEmailDto {
  token: string
}

// Auth Response (para mantener compatibilidad)
export interface AuthResponse {
  accessToken: string
  user: ExtendedUser
}
