import { apiClient } from "@/lib/api-client"

export interface CreateContractDto {
  adminName: string
  spaceId: number
  contractType: "space"
  documentUrl: string
  startDate?: string
  expirationDate?: string
}

export interface Contract {
  id: number
  userId: number
  adminId: number
  spaceId: number
  contractType: string
  documentUrl: string
  startDate: string | null
  expirationDate: string | null
  createdAt: string
  updatedAt: string
}

export const contractService = {
  /**
   * Crear un nuevo contrato
   */
  async createContract(data: CreateContractDto): Promise<Contract> {
    return apiClient.post<Contract>("/contracts", data)
  },

  /**
   * Obtener contrato por ID
   */
  async getContractById(id: number): Promise<Contract> {
    return apiClient.get<Contract>(`/contracts/${id}`)
  },

  /**
   * Obtener contratos de un espacio
   */
  async getContractsBySpace(spaceId: number): Promise<Contract[]> {
    return apiClient.get<Contract[]>(`/contracts/space/${spaceId}`)
  },
}
