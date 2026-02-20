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

export type FundType =
  | "Fondo"
  | "Festival"
  | "Premio"
  | "Espacios de participación"

export type FinancialOrigin = "Público" | "Privado" | "Mixto" | "Desconocido"

export interface CreateFundData {
  name: string
  countryId: number
  type: FundType[]
  financialOrigin: FinancialOrigin
}
