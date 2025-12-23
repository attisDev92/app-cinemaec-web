// Space Types (alineados con el backend)

export enum SpaceType {
  THEATER = "theater",
  CINEMA = "cinema",
  CULTURAL_CENTER = "cultural_center",
  MULTIPURPOSE = "multipurpose",
  OTHER = "other",
}

export enum SpaceStatus {
  PENDING = "pending",
  UNDER_REVIEW = "under_review",
  APPROVED = "approved",
  REJECTED = "rejected",
}

// Space Entity
export interface Space {
  id: number
  userId: number
  // Información básica
  name: string
  type: SpaceType
  province: string
  city: string
  address: string
  email: string
  phone: string
  coordinates: [number, number]
  description: string
  target: string
  mainActivity: string
  otherActivities: string[]
  commercialActivities: string[]
  // Personal administrativo
  managerName: string
  managerPhone: string
  managerEmail: string
  // Personal técnico
  technicianInCharge: string
  technicianRole: string
  technicianPhone: string
  technicianEmail: string
  // Infraestructura
  capacity: number
  projectionEquipment: string[]
  soundEquipment: string[]
  screen: string[]
  // Servicios y operación
  boxofficeRegistration: string
  accessibilities: string[]
  services: string[]
  operatingHistory: string
  // Assets
  logoId: number
  photosId: number[]
  ciDocument: number
  rucDocument?: number | null
  managerDocument: number
  serviceBill: number
  operatingLicense: number
  contractId?: number | null
  // Estado
  status: SpaceStatus
  approvedBy: number | null
  approvedAt: Date | null
  rejectionReason: string | null
  createdAt: Date
  updatedAt: Date
}

// Create Space DTO
export interface CreateSpaceDto {
  // Información básica
  name: string
  type: SpaceType
  province: string
  city: string
  address: string
  email: string
  phone: string
  coordinates: [number, number]
  description: string
  target: string
  mainActivity: string
  otherActivities: string[]
  commercialActivities: string[]
  // Personal administrativo
  managerName: string
  managerPhone: string
  managerEmail: string
  // Personal técnico
  technicianInCharge: string
  technicianRole: string
  technicianPhone: string
  technicianEmail: string
  // Infraestructura
  capacity: number
  projectionEquipment: string[]
  soundEquipment: string[]
  screen: string[]
  // Servicios y operación
  boxofficeRegistration: string
  accessibilities: string[]
  services: string[]
  operatingHistory: string
  // Assets
  logoId: number
  photosId: number[]
  ciDocument: number
  rucDocument?: number
  managerDocument: number
  serviceBill: number
  operatingLicense: number
  contractId?: number
}

// Update Space DTO
export interface UpdateSpaceDto extends Partial<CreateSpaceDto> {
  status?: SpaceStatus
}

// Update Space Status DTO (solo admin)
export interface UpdateSpaceStatusDto {
  status: SpaceStatus
  rejectionReason?: string
}

// Query Spaces DTO
export interface QuerySpacesDto {
  type?: SpaceType
  province?: string
  city?: string
  status?: SpaceStatus
  page?: number
  limit?: number
}

// Review Types (Admin reviews)
export interface Issue {
  field: string
  comment: string
}

export interface ReviewForm {
  decision: "approve" | "request_changes" | "reject"
  generalComment?: string
  issues?: Issue[]
}

export interface SpaceReview {
  id: number
  spaceId: number
  reviewerUserId: number
  decision: "approve" | "request_changes" | "reject"
  generalComment?: string
  issues: Issue[]
  createdAt: Date
  updatedAt: Date
}
