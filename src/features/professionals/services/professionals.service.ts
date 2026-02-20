import { apiClient } from "@/lib/api-client"
import type { Professional } from "../types"

export const professionalsService = {
  async getAll(): Promise<Professional[]> {
    return apiClient.get<Professional[]>("/professionals")
  },

  async create(payload: { name: string; dniNumber?: string | null }) {
    return apiClient.post("/professionals", payload)
  },
}
