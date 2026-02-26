export type MovieType =
  | "Cortometraje"
  | "Mediometraje"
  | "Largometraje"
  | "Sin catalogar"

export type MovieGenre =
  | "Ficción"
  | "Documental"
  | "Docu-ficción"
  | "Falso Documental"
  | "Sin catalogar"

export type MovieClassification =
  | "todo_publico"
  | "recomendado_0_6"
  | "recomendado_6_12"
  | "menores_12_supervision"
  | "mayores_12"
  | "mayores_15"
  | "solo_mayores_18"
  | "no_especificada"

export type ProjectStatus =
  | "desarrollo"
  | "produccion"
  | "postproduccion"
  | "distribucion"
  | "finalizado"

export type MovieStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "archived"

export type MovieReleaseType =
  | "Comercial"
  | "Festival o muestra"
  | "Alternativo o itinerante"

export type FestivalNominationResult =
  | "Ganador"
  | "Nominado"
  | "Selección oficial"

export type ContactPosition =
  | "Director/a"
  | "Productor/a"
  | "Agente de ventas"
  | "Distribuidor/a"

export type ExhibitionWindow = "Nacional" | "Internacional" | "VOD"

export interface CreateMoviePayload {
  title: string
  titleEn?: string
  durationMinutes: number
  type: MovieType
  genre: MovieGenre
  subGenreIds?: number[]
  languages?: string[]
  subtitleLanguageIds?: number[]
  countryId: number
  releaseYear: number
  synopsis: string
  synopsisEn?: string
  logLine?: string
  logLineEn?: string
  projectNeed?: string
  projectNeedEn?: string
  directors?: number[]
  producers?: number[]
  mainActors?: number[]
  crew?: Array<{ cinematicRoleId: number; professionalId: number }>
  producerCompanyId?: number
  coProducerCompanyIds?: number[]
  internationalCoproductions?: Array<{
    companyName: string
    countryId: number
  }>
  totalBudget?: number
  economicRecovery?: number
  totalAudience?: number
  crewTotal?: number
  actorsTotal?: number
  funding?: Array<{
    fundId: number
    year: number
    amountGranted?: number
    fundingStage: ProjectStatus
  }>
  nationalReleases?: Array<{
    exhibitionSpaceId: number
    cityId: number
    year: number
    type: MovieReleaseType
  }>
  internationalReleases?: Array<{
    spaceName?: string
    countryId: number
    year: number
    type: MovieReleaseType
  }>
  festivalNominations?: Array<{
    fundId: number
    year: number
    category: string
    result: FestivalNominationResult
  }>
  platforms?: Array<{
    platformId: number
    link?: string
  }>
  contacts?: Array<{
    name: string
    role: ContactPosition
    phone?: string
    email?: string
  }>
  contentBank?: Array<{
    exhibitionWindow: ExhibitionWindow
    licensingStartDate: string
    licensingEndDate: string
    geolocationRestrictionCountryIds?: number[]
  }>
  posterAssetId?: number
  dossierAssetId?: number
  dossierEnAssetId?: number
  pedagogicalGuideAssetId?: number
  trailerLink?: string
  makingOfLink?: string
  stillAssetIds?: number[]
  filmingCitiesEc?: string[]
  filmingCountries?: string[]
  classification: MovieClassification
  projectStatus: ProjectStatus
}

export interface Movie extends CreateMoviePayload {
  id: number
  isActive: boolean
  status: MovieStatus
  createdAt: string
  updatedAt?: string | null
  ownerId?: number | null
}
