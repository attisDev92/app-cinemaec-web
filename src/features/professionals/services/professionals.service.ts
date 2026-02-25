import { apiClient } from "@/lib/api-client"
import type {
  CreateProfessionalPayload,
  Professional,
  ProfessionalClaimCheckResponse,
  ProfessionalClaimResponse,
} from "../types"

export const professionalsService = {
  async getAll(): Promise<Professional[]> {
    return apiClient.get<Professional[]>("/professionals")
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
}
