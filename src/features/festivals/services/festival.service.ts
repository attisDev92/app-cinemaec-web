import { apiClient } from "@/lib/api-client"
import {
  CreateFestivalPayload,
  Festival,
  UpdateFestivalPayload,
} from "../types"

export const festivalService = {
  async getAll(): Promise<Festival[]> {
    return apiClient.get<Festival[]>("/festivals")
  },

  async getPublicById(id: number): Promise<Festival> {
    return apiClient.get<Festival>(`/public/festivals/${id}`, false)
  },

  async getById(id: number): Promise<Festival> {
    return apiClient.get<Festival>(`/festivals/${id}`)
  },

  async create(payload: CreateFestivalPayload): Promise<Festival> {
    return apiClient.post<Festival>("/festivals", payload)
  },

  async update(id: number, payload: UpdateFestivalPayload): Promise<Festival> {
    return apiClient.put<Festival>(`/festivals/${id}`, payload)
  },

  async toggleActive(id: number, isActive: boolean): Promise<Festival> {
    return apiClient.put<Festival>(`/festivals/${id}`, { isActive })
  },

  async toggleCall(id: number, hasCall: boolean): Promise<Festival> {
    return apiClient.put<Festival>(`/festivals/${id}`, { hasCall })
  },

  async delete(id: number): Promise<void> {
    return apiClient.delete(`/festivals/${id}`)
  },
}
