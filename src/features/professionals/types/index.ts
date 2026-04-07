export interface ProfessionalAsset {
  id?: number
  url?: string | null
}

export interface ProfessionalRoleCategory {
  id: number
  name: string
  nameEn?: string | null
}

export interface ProfessionalRoleSummary {
  id: number
  name: string
  nameEn?: string | null
  category?: ProfessionalRoleCategory | null
}

export interface PublicProfessionalMovieParticipation {
  id: number
  movieId: number
  movieTitle: string
  movieTitleEn?: string | null
  releaseYear?: number | null
  cinematicRoleId: number
  cinematicRole?: ProfessionalRoleSummary | null
  posterAsset?: ProfessionalAsset | null
}

export interface Professional {
  id: number
  name: string
  nickName?: string | null
  email?: string | null
  dniNumber?: string | null
  phone?: string | null
  mobile?: string | null
  website?: string | null
  linkedin?: string | null
  rrss?: string | null
  bio?: string | null
  bioEn?: string | null
  profilePhotoAssetId?: number | null
  profilePhotoAsset?: ProfessionalAsset | null
  reelLink?: string | null
  companyNameCEO?: string | null
  primaryActivityRoleId1?: number | null
  primaryActivityRoleId2?: number | null
  secondaryActivityRoleId1?: number | null
  secondaryActivityRoleId2?: number | null
  primaryActivityRoles?: ProfessionalRoleSummary[]
  secondaryActivityRoles?: ProfessionalRoleSummary[]
  portfolioImages?: ProfessionalAsset[]
  movieParticipations?: PublicProfessionalMovieParticipation[]
  portfolioImageAssetIds?: number[]
  ownerId?: number | null
  isPublic?: boolean
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
  isPublic?: boolean
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
