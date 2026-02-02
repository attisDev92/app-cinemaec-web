// Company Types
export interface Company {
  id: string
  userId: string
  name: string
  legalName: string
  ruc: string // RUC o identificación fiscal
  address: string
  city: string
  province: string
  country: string
  phone: string
  email: string
  website?: string
  description?: string
  legalRepresentative: string
  legalRepresentativeId: string
  businessType:
    | "production"
    | "distribution"
    | "exhibition"
    | "cultural"
    | "educational"
    | "other"
  isActive: boolean
  documents?: string[] // URLs de documentos legales
  createdAt: string
  updatedAt: string
}

export interface CreateCompanyData {
  name: string
  legalName: string
  ruc: string
  address: string
  city: string
  province: string
  country: string
  phone: string
  email: string
  website?: string
  description?: string
  legalRepresentative: string
  legalRepresentativeId: string
  businessType:
    | "production"
    | "distribution"
    | "exhibition"
    | "cultural"
    | "educational"
    | "other"
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  isActive?: boolean
}
