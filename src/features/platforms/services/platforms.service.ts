import { apiClient } from "@/lib/api-client"
import type { PlatformListItem, CreatePlatformData } from "../types"

export const platformsService = {
  async getAll(): Promise<PlatformListItem[]> {
    return apiClient.get<PlatformListItem[]>("/platforms")
  },

  async create(data: CreatePlatformData): Promise<PlatformListItem> {
    return apiClient.post<PlatformListItem>("/platforms", {
      name: data.name,
      type: data.type,
    })
  },
}
