import { apiClient } from "@/lib/api-client"
import type { Professional } from "../types"

export const professionalsService = {
  async getAll(): Promise<Professional[]> {
    return apiClient.get<Professional[]>("/professionals")
  },
}
