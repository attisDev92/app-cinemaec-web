import { apiClient } from "@/lib/api-client"
import type {
  CreateProfessionalPayload,
  Professional,
  ProfessionalClaimCheckResponse,
  ProfessionalClaimResponse,
  ProfessionalMovieParticipation,
  ProfessionalMovieParticipationInput,
} from "../types"

export const professionalsService = {
  async getAll(): Promise<Professional[]> {
    return apiClient.get<Professional[]>("/professionals")
  },

  async getById(id: number): Promise<Professional> {
    return apiClient.get<Professional>(`/professionals/${id}`)
  },

  async create(payload: CreateProfessionalPayload): Promise<Professional> {
    return apiClient.post<Professional>("/professionals", payload)
  },

  async registerForCurrentUser(
    payload: CreateProfessionalPayload,
  ): Promise<Professional> {
    return apiClient.post<Professional>("/professionals/claim/register", payload)
  },

  async checkClaimByCedula(): Promise<ProfessionalClaimCheckResponse> {
    return apiClient.get<ProfessionalClaimCheckResponse>(
      "/professionals/claim/check",
    )
  },

  async claimRegisteredProfile(
    professionalId?: number,
  ): Promise<ProfessionalClaimResponse> {
    return apiClient.post<ProfessionalClaimResponse>("/professionals/claim", {
      professionalId,
    })
  },

  async getMovieParticipations(
    professionalId: number,
  ): Promise<ProfessionalMovieParticipation[]> {
    return apiClient.get<ProfessionalMovieParticipation[]>(
      `/professionals/${professionalId}/movie-participations`,
    )
  },

  async updateMovieParticipations(
    professionalId: number,
    movieParticipations: ProfessionalMovieParticipationInput[],
  ): Promise<{ message: string }> {
    return apiClient.put<{ message: string }>(
      `/professionals/${professionalId}/movie-participations`,
      { movieParticipations },
    )
  },

  async update(
    professionalId: number,
    payload: Partial<CreateProfessionalPayload>,
  ): Promise<Professional> {
    return apiClient.put<Professional>(`/professionals/${professionalId}`, payload)
  },
}
