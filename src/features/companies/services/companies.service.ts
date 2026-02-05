import { apiClient } from "@/lib/api-client"
import type { CompanyListItem } from "../types"

export const companiesService = {
  async getAll(): Promise<CompanyListItem[]> {
    return apiClient.get<CompanyListItem[]>("/companies")
  },
}
