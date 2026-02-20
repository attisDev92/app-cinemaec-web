export interface ExhibitionSpaceListItem {
  id: number
  name: string
  country?: {
    id: number
    name: string
    code?: string
  }
}

export interface CreateExhibitionSpaceData {
  name: string
  countryId: number
}
