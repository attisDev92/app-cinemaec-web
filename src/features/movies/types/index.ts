export type MovieType = "Cortometraje" | "Mediometraje" | "Largometraje"

export type MovieGenre =
  | "Ficción"
  | "Documental"
  | "Docu-ficción"
  | "Falso Documental"

export type MovieClassification =
  | "todo_publico"
  | "recomendado_0_6"
  | "recomendado_6_12"
  | "menores_12_supervision"
  | "mayores_12"
  | "mayores_15"
  | "solo_mayores_18"

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
  | "Director"
  | "Productora"
  | "Agente de ventas"
  | "Distribuidor"

export type ExhibitionWindow = "Nacional" | "Internacional" | "VOD"

export interface CreateMoviePayload {
  title: string
  titleEn?: string
  durationMinutes: number
  type: MovieType
  genre: MovieGenre
  subGenreIds?: number[]
  languages: string[]
  countryCode: string
  provinces: string[]
  cities: string[]
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
  internationalCoProducer?: string
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
  contact?: {
    name: string
    position: ContactPosition
    phone: string
    email: string
  }
  contentBank?: {
    licensingStartDate: string
    licensingEndDate: string
    subtitles: string[]
    exhibitionWindow: ExhibitionWindow[]
    geolocationRestrictionCountryIds?: number[]
  }
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
