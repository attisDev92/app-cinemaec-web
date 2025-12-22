// Location Types (alineados con el backend)

// Location Entity
export interface Location {
  id: number
  userId: number
  province: string
  city: string
  address: string
  latitude: number
  longitude: number
  createdAt: Date
  updatedAt: Date
}

// Create Location DTO
export interface CreateLocationDto {
  province: string
  city: string
  address: string
  latitude: number
  longitude: number
}

// Update Location DTO
export type UpdateLocationDto = Partial<CreateLocationDto>
