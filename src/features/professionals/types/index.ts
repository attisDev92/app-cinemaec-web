export interface Professional {
  id: number
  name: string
  dniNumber?: string | null
  phone?: string | null
  mobile?: string | null
  website?: string | null
  linkedin?: string | null
  ownerId?: number | null
}

export interface CreateProfessionalPayload {
  name: string
  dniNumber?: string | null
  phone?: string | null
  mobile?: string | null
  website?: string | null
  linkedin?: string | null
}

export interface ProfessionalClaimCheckResponse {
  hasMatch: boolean
  canClaim: boolean
  alreadyClaimedByYou: boolean
  claimedByAnotherUser: boolean
  professionalId: number | null
  professionalName: string | null
  dniNumber: string | null
  requiresSelection?: boolean
  nameMatches?: ProfessionalNameMatch[]
}

export interface ProfessionalNameMatch {
  id: number
  name: string
}

export interface ProfessionalClaimResponse {
  message: string
  professionalId: number
  ownerId: number | null
}
