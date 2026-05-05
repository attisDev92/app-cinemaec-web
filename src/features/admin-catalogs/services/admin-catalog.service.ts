import { apiClient } from "@/lib/api-client"
import {
  AdminCatalog,
  CreateAdminCatalogPayload,
  UpdateAdminCatalogPayload,
} from "../types"

export const adminCatalogService = {
  async getPublicActive(): Promise<AdminCatalog[]> {
    return apiClient.get<AdminCatalog[]>("/admin-catalogs/public", false)
  },

  async getPublicById(id: number): Promise<AdminCatalog> {
    return apiClient.get<AdminCatalog>(`/admin-catalogs/public/${id}`, false)
  },

  async getAll(): Promise<AdminCatalog[]> {
    return apiClient.get<AdminCatalog[]>("/admin-catalogs")
  },

  async getById(id: number): Promise<AdminCatalog> {
    return apiClient.get<AdminCatalog>(`/admin-catalogs/${id}`)
  },

  async create(payload: CreateAdminCatalogPayload): Promise<AdminCatalog> {
    return apiClient.post<AdminCatalog>("/admin-catalogs", payload)
  },

  async update(
    id: number,
    payload: UpdateAdminCatalogPayload,
  ): Promise<AdminCatalog> {
    return apiClient.put<AdminCatalog>(`/admin-catalogs/${id}`, payload)
  },

  async toggleActive(id: number, isActive: boolean): Promise<AdminCatalog> {
    return apiClient.put<AdminCatalog>(`/admin-catalogs/${id}`, { isActive })
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete<void>(`/admin-catalogs/${id}`)
  },
}
