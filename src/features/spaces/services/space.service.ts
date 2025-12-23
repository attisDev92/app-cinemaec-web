import { apiClient } from "@/lib/api-client"
import {
  Space,
  CreateSpaceDto,
  UpdateSpaceDto,
  QuerySpacesDto,
  UpdateSpaceStatusDto,
} from "@/shared/types"
import type { ReviewForm, SpaceReview } from "@/features/spaces/types/space"

export interface SpacesResponse {
  data: Space[]
  total: number
  page: number
  limit: number
}

export const spaceService = {
  /**
   * Crear un nuevo espacio REA
   */
  async createSpace(data: CreateSpaceDto): Promise<Space> {
    return apiClient.post<Space>("/spaces", data)
  },

  /**
   * Obtener lista de espacios con filtros y paginación
   */
  async getSpaces(query?: QuerySpacesDto): Promise<SpacesResponse> {
    const params = new URLSearchParams()
    if (query) {
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/spaces?${queryString}` : "/spaces"

    return apiClient.get<SpacesResponse>(endpoint)
  },

  /**
   * Obtener espacios del usuario autenticado
   */
  async getMySpaces(): Promise<Space[]> {
    const response = await apiClient.get<Space[] | { data: Space[] }>(
      "/spaces/my-spaces",
    )
    // El backend puede retornar un array directo o un objeto con propiedad data
    return Array.isArray(response) ? response : response.data || []
  },

  /**
   * Obtener un espacio por ID
   */
  async getSpaceById(id: number): Promise<Space> {
    return apiClient.get<Space>(`/spaces/${id}`)
  },

  // Actualizar un espacio (solo propietario)
  async updateSpace(id: number, data: UpdateSpaceDto): Promise<Space> {
    return apiClient.put<Space>(`/spaces/${id}`, data)
  },

  /**
   * Eliminar un espacio (solo propietario)
   */
  async deleteSpace(id: number): Promise<void> {
    return apiClient.delete(`/spaces/${id}`)
  },

  /**
   * Actualizar estado de aprobación (solo admin)
   */
  async updateSpaceStatus(
    id: number,
    data: UpdateSpaceStatusDto,
  ): Promise<Space> {
    return apiClient.put<Space>(`/spaces/${id}/status`, data)
  },

  /**
   * Enviar revisión de espacio (solo admin con permiso ADMIN_SPACES)
   */
  async submitReview(id: number, review: ReviewForm): Promise<SpaceReview> {
    return apiClient.post<SpaceReview>(`/spaces/${id}/review`, review)
  },

  /**
   * Obtener historial de revisiones de un espacio
   */
  async getReviews(id: number): Promise<SpaceReview[]> {
    return apiClient.get<SpaceReview[]>(`/spaces/${id}/reviews`)
  },
}
