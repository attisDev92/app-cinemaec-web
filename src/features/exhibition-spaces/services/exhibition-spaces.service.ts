import { apiClient } from "@/lib/api-client"
import type {
  ExhibitionSpaceListItem,
  CreateExhibitionSpaceData,
} from "../types"

export const exhibitionSpacesService = {
  async getAll(): Promise<ExhibitionSpaceListItem[]> {
    return apiClient.get<ExhibitionSpaceListItem[]>("/exhibition-spaces")
  },

  async create(
    data: CreateExhibitionSpaceData,
  ): Promise<ExhibitionSpaceListItem> {
    return apiClient.post<ExhibitionSpaceListItem>("/exhibition-spaces", {
      name: data.name,
      countryId: data.countryId,
    })
  },
}
