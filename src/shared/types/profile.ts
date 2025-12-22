import { LegalStatus } from "./enums"

// Re-export LegalStatus for convenience
export { LegalStatus } from "./enums"

// Profile Entity
export interface Profile {
  id: number
  fullName: string
  legalName?: string | null
  tradeName?: string | null
  legalStatus: LegalStatus
  birthdate?: Date | null
  province: string | null
  city: string | null
  address: string | null
  phone: string | null
  userId: number
  createdAt: Date
  updatedAt: Date
}

// Create Profile DTO
export interface CreateProfileDto {
  fullName: string
  legalName?: string
  tradeName?: string
  legalStatus: LegalStatus
  birthdate?: string // Format: YYYY-MM-DD
  province?: string
  city?: string
  address?: string
  phone?: string
}

// Update Profile DTO
export interface UpdateProfileDto {
  fullName?: string
  legalName?: string
  tradeName?: string
  legalStatus?: LegalStatus
  birthdate?: string // Format: YYYY-MM-DD
  province?: string
  city?: string
  address?: string
  phone?: string
}

// Profile Response
export interface ProfileResponse {
  message: string
  profile: Profile
}
