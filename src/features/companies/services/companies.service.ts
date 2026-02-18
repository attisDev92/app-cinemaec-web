import { apiClient } from "@/lib/api-client"
import type { CompanyListItem, CreateCompanyData } from "../types"

export const companiesService = {
  async getAll(): Promise<CompanyListItem[]> {
    return apiClient.get<CompanyListItem[]>("/companies")
  },

  async create(payload: CreateCompanyData) {
    return apiClient.post("/companies", payload)
  },
}
