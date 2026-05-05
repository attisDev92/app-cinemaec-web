export interface FestivalSection {
  name: string
  competitive: boolean
}

export interface FestivalProfessionalObject {
  id: number
  name: string | null
  photoUrl: string | null
  filmography: string | null
}

export interface Festival {
  id: number
  name: string
  editionCount: number
  firstEditionYear: number
  type: string
  hostCities: number[]
  modality: string[]
  mainVenue: number
  website?: string | null
  theme: string
  producerCompanyIds: number[]
  description: string
  descriptionEn?: string | null
  directors: number[]
  producerIds: number[]
  programmers: number[]
  directorObjects?: FestivalProfessionalObject[]
  producerObjects?: FestivalProfessionalObject[]
  classification: string
  contactName: string
  contactEmail: string
  contactPhone: string
  posterId?: number | null
  posterUrl?: string | null
  trailer?: string | null
  stillsIds: number[]
  stillUrls?: string[]
  needs?: string | null
  needsEn?: string | null
  dossierEsId?: number | null
  dossierEsUrl?: string | null
  dossierEnId?: number | null
  dossierEnUrl?: string | null
  sections: FestivalSection[]
  hasCall: boolean
  callProcess?: string | null
  callLink?: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type CreateFestivalPayload = Omit<
  Festival,
  'id' | 'createdAt' | 'updatedAt'
>

export type UpdateFestivalPayload = Partial<CreateFestivalPayload>
