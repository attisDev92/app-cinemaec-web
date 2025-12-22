import { AssetTypeEnum, AssetOwnerEnum } from "./enums"

// Asset Entity
export interface Asset {
  id: number
  userId: number
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId: number | null
  url: string
  firebasePath: string | null
  createdAt: Date
  updatedAt: Date
}

// Upload Asset DTO (FormData)
export interface UploadAssetDto {
  file: File
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId?: number
}

// Query Assets DTO
export interface QueryAssetsDto {
  documentType?: AssetTypeEnum
  ownerType?: AssetOwnerEnum
  ownerId?: number
}
