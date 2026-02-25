export interface Country {
  id: number
  code: string
  name: string
}

export interface Language {
  id: number
  code: string
  name: string
}

export interface SubGenre {
  id: number
  name: string
}

export interface CinematicRole {
  id: number
  name: string
  nameEn?: string
  idRoleCategory?: number
  roleCategory?: {
    id: number
    name: string
    nameEn: string
  }
}

export interface RoleCategory {
  id: number
  name: string
  nameEn: string
}

export interface City {
  id: number
  name: string
}
