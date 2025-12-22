import { apiClient } from "@/lib/api-client"
import { Location, CreateLocationDto, UpdateLocationDto } from "@/shared/types"

export const locationService = {
  // Crear una nueva ubicación
  async createLocation(data: CreateLocationDto): Promise<Location> {
    return apiClient.post<Location>("/locations", data)
  },

  // Obtener ubicación por ID
  async getLocationById(id: number): Promise<Location> {
    return apiClient.get<Location>(`/locations/${id}`)
  },

  // Actualizar ubicación
  async updateLocation(id: number, data: UpdateLocationDto): Promise<Location> {
    return apiClient.put<Location>(`/locations/${id}`, data)
  },

  // Eliminar ubicación
  async deleteLocation(id: number): Promise<void> {
    return apiClient.delete(`/locations/${id}`)
  },

  // Obtener ubicaciones del usuario autenticado
  async getMyLocations(): Promise<Location[]> {
    return apiClient.get<Location[]>("/locations/my-locations")
  },
}
