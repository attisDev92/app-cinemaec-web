// Profile Types - usando tipos compartidos
import {
  LegalStatus,
  Profile,
  CreateProfileDto,
  UpdateProfileDto,
  ProfileResponse,
  ChangePasswordDto,
} from "@/shared/types"

// Re-exports
export {
  LegalStatus,
  type Profile,
  type CreateProfileDto,
  type UpdateProfileDto,
  type ProfileResponse,
}

// Aliases para mantener compatibilidad
export type CompleteProfileData = CreateProfileDto
export type UpdateProfileData = UpdateProfileDto
export type ChangePasswordData = ChangePasswordDto
