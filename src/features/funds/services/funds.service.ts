import { apiClient } from "@/lib/api-client"
import type { CreateFundData, FundListItem } from "../types"

export const fundsService = {
  async getAll(): Promise<FundListItem[]> {
    return apiClient.get<FundListItem[]>("/funds")
  },

  async create(payload: CreateFundData): Promise<FundListItem> {
    return apiClient.post<FundListItem>("/funds", {
      name: payload.name,
      countryId: payload.countryId,
      type: payload.type,
      financialOrigin: payload.financialOrigin,
    })
  },
}
