import { apiClient } from "@/lib/api-client"
import type { ExhibitionSpaceListItem } from "../types"

export const exhibitionSpacesService = {
  async getAll(): Promise<ExhibitionSpaceListItem[]> {
    return apiClient.get<ExhibitionSpaceListItem[]>("/exhibition-spaces")
  },
}
