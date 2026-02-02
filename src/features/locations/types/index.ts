// Location Types
export interface Location {
  id: string
  userId: string
  name: string
  address: string
  city: string
  province: string
  country: string
  zipCode?: string
  phone?: string
  email?: string
  description?: string
  type: "urban" | "rural" | "cultural-center" | "educational" | "other"
  capacity?: number
  facilities?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateLocationData {
  name: string
  address: string
  city: string
  province: string
  country: string
  zipCode?: string
  phone?: string
  email?: string
  description?: string
  type: "urban" | "rural" | "cultural-center" | "educational" | "other"
  capacity?: number
  facilities?: string[]
}

export interface UpdateLocationData extends Partial<CreateLocationData> {
  isActive?: boolean
}
