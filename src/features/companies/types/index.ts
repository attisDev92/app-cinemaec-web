// Company Types
export interface Company {
  id: number
  name: string
  ruc: string | null
  representative?: string | null
  representativeDniNumber?: string | null
  phone?: string | null
  mobile?: string | null
  website?: string | null
  instagram?: string | null
  linkedin?: string | null
  ownerId?: number | null
  isActive: boolean
  status: string
  createdAt: string
  updatedAt: string | null
}

export interface CompanyListItem {
  id: number
  name: string
  ruc: string | null
}

export interface CreateCompanyData {
  name: string
  ruc?: string | null
}

export interface UpdateCompanyData extends Partial<CreateCompanyData> {
  representative?: string
  representativeDniNumber?: string
  phone?: string
  mobile?: string
  website?: string
  instagram?: string
  linkedin?: string
  isActive?: boolean
}
