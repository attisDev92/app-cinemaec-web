export interface Professional {
  id: number
  name: string
  nickName?: string | null
  dniNumber?: string | null
  phone?: string | null
  mobile?: string | null
  website?: string | null
  linkedin?: string | null
  rrss?: string | null
  bio?: string | null
  bioEn?: string | null
  profilePhotoAssetId?: number | null
  reelLink?: string | null
  companyNameCEO?: string | null
  primaryActivityRoleId1?: number | null
  primaryActivityRoleId2?: number | null
  secondaryActivityRoleId1?: number | null
  secondaryActivityRoleId2?: number | null
  portfolioImageAssetIds?: number[]
  ownerId?: number | null
}

export interface CreateProfessionalPayload {
  name: string
  nickName?: string | null
  dniNumber?: string | null
  phone?: string | null
  mobile?: string | null
  website?: string | null
  linkedin?: string | null
  rrss?: string | null
  bio?: string | null
  bioEn?: string | null
  profilePhotoAssetId?: number | null
  reelLink?: string | null
  companyNameCEO?: string | null
  primaryActivityRoleId1?: number | null
  primaryActivityRoleId2?: number | null
  secondaryActivityRoleId1?: number | null
  secondaryActivityRoleId2?: number | null
  portfolioImageAssetIds?: number[]
  movieParticipations?: ProfessionalMovieParticipationInput[]
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

export interface ProfessionalMovieParticipationInput {
  movieId: number
  cinematicRoleId: number
}

export interface ProfessionalMovieParticipation extends ProfessionalMovieParticipationInput {
  id: number
  movieTitle: string
  cinematicRoleName: string
}
