import { apiClient } from "@/lib/api-client"
import type { FundListItem } from "../types"

export const fundsService = {
  async getAll(): Promise<FundListItem[]> {
    return apiClient.get<FundListItem[]>("/funds")
  },
}
