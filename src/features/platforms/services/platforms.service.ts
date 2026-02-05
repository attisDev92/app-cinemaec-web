import { apiClient } from "@/lib/api-client"
import type { PlatformListItem } from "../types"

export const platformsService = {
  async getAll(): Promise<PlatformListItem[]> {
    return apiClient.get<PlatformListItem[]>("/platforms")
  },
}
