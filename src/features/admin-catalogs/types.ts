import { Asset } from "@/shared/types"

export interface CatalogMovie {
  id: number
  title: string
  releaseYear?: number | null
  projectStatus?: string | null
  country?: { name?: string | null } | null
  posterAsset?: Asset | null
}

export interface CatalogFestival {
  id: number
  name: string
  firstEditionYear?: number | null
  type?: string | null
  description?: string | null
  poster?: Asset | null
}

export interface CatalogProfessional {
  id: number
  name: string
  bio?: string | null
  isPublic?: boolean
  profilePhotoAsset?: Asset | null
}

export interface AdminCatalog {
  id: number
  name: string
  year: number
  imageId: number
  description: string | null
  isActive: boolean
  createdById: number | null
  updatedById: number | null
  createdAt: string
  updatedAt: string
  imageAsset?: Asset
  movies?: CatalogMovie[]
  festivals?: CatalogFestival[]
  professionals?: CatalogProfessional[]
}

export interface CreateAdminCatalogPayload {
  name: string
  year: number
  imageId: number
  description?: string
  movieIds?: number[]
  festivalIds?: number[]
  professionalIds?: number[]
}

export type UpdateAdminCatalogPayload = Partial<CreateAdminCatalogPayload> & {
  isActive?: boolean
}
