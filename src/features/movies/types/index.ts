export type MovieType = "cortometraje" | "mediometraje" | "largometraje"

export type MovieGenre =
  | "animacion"
  | "antropologico"
  | "aventura"
  | "biografico"
  | "ciencia_ficcion"
  | "cine_guerrilla"
  | "comedia"
  | "deportivo"
  | "drama"
  | "etnografico"
  | "experimental"
  | "familiar"
  | "fantastico"
  | "genero"
  | "historico"
  | "infantil"
  | "medioambiente"
  | "musical"
  | "policial"
  | "religioso"
  | "resistencia"
  | "romance"
  | "suspenso"
  | "terror"
  | "thriller"
  | "vida_rural"
  | "western"
  | "otros"

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
  | "post_produccion"
  | "distribucion"
  | "finalizado"

export type MovieStatus =
  | "draft"
  | "in_review"
  | "approved"
  | "rejected"
  | "archived"

export interface CreateMoviePayload {
  title: string
  titleEn?: string
  durationMinutes: number
  type: MovieType
  genres: MovieGenre[]
  languages: string[]
  countryCode: string
  provinces: string[]
  cities: string[]
  releaseYear: number
  synopsis: string
  synopsisEn?: string
  logLine?: string
  logLineEn?: string
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
