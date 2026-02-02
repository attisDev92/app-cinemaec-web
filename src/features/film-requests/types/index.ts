// Film Request Types
export interface Film {
  id: string
  title: string
  originalTitle?: string
  director: string
  year: number
  duration: number // en minutos
  genre: string[]
  country: string
  language: string
  subtitles?: string[]
  synopsis: string
  posterUrl?: string
  trailerUrl?: string
  rating?: string
  format: "DCP" | "BluRay" | "DVD" | "Digital" | "Film"
  isAvailable: boolean
}

export interface FilmRequest {
  id: string
  userId: string
  userCBId: string
  filmId: string
  spaceId: string
  requestedDate: string
  preferredDates: string[]
  alternativeDates?: string[]
  estimatedAudience: number
  ticketPrice?: number
  isFreeEntry: boolean
  eventType: "regular" | "special" | "festival" | "educational" | "community"
  additionalNotes?: string
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled"
  approvedBy?: string
  approvedAt?: string
  rejectionReason?: string
  shippingInfo?: {
    address: string
    contactName: string
    contactPhone: string
    specialInstructions?: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateFilmRequestData {
  filmId: string
  spaceId: string
  preferredDates: string[]
  alternativeDates?: string[]
  estimatedAudience: number
  ticketPrice?: number
  isFreeEntry: boolean
  eventType: "regular" | "special" | "festival" | "educational" | "community"
  additionalNotes?: string
  shippingInfo?: {
    address: string
    contactName: string
    contactPhone: string
    specialInstructions?: string
  }
}

export interface UpdateFilmRequestData extends Partial<CreateFilmRequestData> {
  status?: "cancelled"
}
