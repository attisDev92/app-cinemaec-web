// Legacy auth types - redirecting to new types
import { UserRole, User, AuthResponse, LoginDto, RegisterDto } from "./user"

export { UserRole, type User, type AuthResponse }

// Aliases
export type LoginCredentials = LoginDto
export type RegisterData = RegisterDto

// Additional legacy types
export interface CompleteProfileData {
  firstName: string
  lastName: string
  phone?: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  email?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}
