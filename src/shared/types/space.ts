import {
  SpaceReviewDecisionEnum,
  SpaceStatusEnum,
  SpaceTypeEnum,
} from "./enums"

export { SpaceTypeEnum as SpaceType, SpaceStatusEnum as SpaceStatus, SpaceReviewDecisionEnum }

// Space Entity
export interface Space {
  id: number
  userId: number
  // Información básica
  name: string
  type: SpaceTypeEnum
  province: string
  city: string
  address: string
  email: string
  phone: string
  ruc: string
  coordinates: [number, number]
  description: string
  target: string[]
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
  // Assets (IDs legacy - mantener por compatibilidad)
  logoId: number
  photosId: number[]
  ciDocument: number
  rucDocument?: number | null
  managerDocument: number
  serviceBill: number
  operatingLicense: number
  contractId?: number | null
  // Assets embebidos (nuevo formato del backend)
  assets?: {
    logo: {
      id: number
      url: string
      documentType: string
      ownerType: string
      createdAt: string
    } | null
    photos: Array<{
      id: number
      url: string
      documentType: string
      ownerType: string
      createdAt: string
    }>
    documents: {
      ci: {
        id: number
        url: string
        documentType: string
        createdAt: string
      } | null
      ruc: {
        id: number
        url: string
        documentType: string
        createdAt: string
      } | null
      manager: {
        id: number
        url: string
        documentType: string
        createdAt: string
      } | null
      serviceBill: {
        id: number
        url: string
        documentType: string
        createdAt: string
      } | null
      operatingLicense: {
        id: number
        url: string
        documentType: string
        createdAt: string
      } | null
    }
  }
  // Estado
  status: SpaceStatusEnum
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
  type: SpaceTypeEnum
  province: string
  city: string
  address: string
  email: string
  phone: string
  ruc: string
  coordinates: [number, number]
  description: string
  target: string[]
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
  status?: SpaceStatusEnum
}

// Update Space Status DTO (solo admin)
export interface UpdateSpaceStatusDto {
  status: SpaceStatusEnum
  rejectionReason?: string
}

// Query Spaces DTO
export interface QuerySpacesDto {
  type?: SpaceTypeEnum
  province?: string
  city?: string
  status?: SpaceStatusEnum
  page?: number
  limit?: number
}

// Review Types (Admin reviews)
export interface Issue {
  field: string
  comment: string
  severity?: "low" | "medium" | "high"
}

export interface ReviewForm {
  decision: SpaceReviewDecisionEnum
  generalComment?: string
  issues?: Issue[]
}

export interface SpaceReview {
  id: number
  spaceId: number
  reviewerUserId: number
  decision: SpaceReviewDecisionEnum
  generalComment?: string
  issues?: Issue[] | null
  createdAt: Date
}
