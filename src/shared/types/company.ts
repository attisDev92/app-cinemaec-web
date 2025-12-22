// Company Types (alineados con el backend)

// Company Entity
export interface Company {
  id: number
  userId: number
  businessName: string
  tradeName: string | null
  ruc: string
  email: string
  phone: string
  website: string | null
  description: string | null
  logoId: number | null
  photosId: number[]
  createdAt: Date
  updatedAt: Date
}

// Create Company DTO
export interface CreateCompanyDto {
  businessName: string
  tradeName?: string
  ruc: string
  email: string
  phone: string
  website?: string
  description?: string
  logoId?: number
  photosId?: number[]
}

// Update Company DTO
export interface UpdateCompanyDto extends Partial<CreateCompanyDto> {}
