// Auth Types - usando tipos compartidos
import {
  UserRole,
  User,
  ExtendedUser,
  LoginResponse,
  UserProfileResponse,
  RegisterDto,
  LoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  AuthResponse,
} from "@/shared/types"

// Re-exports
export {
  UserRole,
  type User,
  type ExtendedUser,
  type LoginResponse,
  type UserProfileResponse,
  type RegisterDto,
  type LoginDto,
  type ChangePasswordDto,
  type ForgotPasswordDto,
  type ResetPasswordDto,
  type VerifyEmailDto,
  type AuthResponse,
}

// Aliases para mantener compatibilidad
export type LoginCredentials = LoginDto
export type RegisterData = RegisterDto
export type VerifyEmailData = VerifyEmailDto
export interface ResendVerificationData {
  email: string
}
