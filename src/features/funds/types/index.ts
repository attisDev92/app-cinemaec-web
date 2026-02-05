export interface FundCountry {
  id?: number
  name: string
  code?: string
}

export interface FundListItem {
  id: number
  name: string
  country?: FundCountry
}
