export enum PlatformType {
  NACIONAL = "Nacional",
  INTERNACIONAL = "Internacional",
}

export interface PlatformListItem {
  id: number
  name: string
  type?: string
}

export interface CreatePlatformData {
  name: string
  type: PlatformType
}
