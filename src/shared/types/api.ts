// Generic API Response Types

// Generic Success Response
export interface SuccessResponse {
  message: string
}

// Generic Error Response
export interface ErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}

// Paginated Response (para futuras implementaciones)
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

// Legacy types (mantener para compatibilidad)
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface ApiError {
  message: string
  statusCode: number
  errors?: Record<string, string[]>
}
