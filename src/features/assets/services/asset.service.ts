import { apiClient } from "@/lib/api-client"
import { environment } from "@/config/environment"
import { AssetTypeEnum, AssetOwnerEnum } from "@/shared/types"

const API_URL = environment.apiUrl

export interface UploadAssetResponse {
  id: number
  url: string
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
}

export const assetService = {
  /**
   * Subir un asset (imagen) al servidor
   */
  async uploadAsset(
    file: File,
    documentType: AssetTypeEnum,
    ownerType: AssetOwnerEnum,
    ownerId?: number,
  ): Promise<UploadAssetResponse> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("documentType", documentType)
    formData.append("ownerType", ownerType)
    // ownerId es opcional - el backend lo actualizará automáticamente al crear el espacio
    if (ownerId !== undefined && ownerId !== null) {
      formData.append("ownerId", ownerId.toString())
    }

    const token = localStorage.getItem("token")
    const response = await fetch(`${API_URL}/assets/upload`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: "Error al subir archivo",
      }))
      throw new Error(error.message || "Error al subir archivo")
    }

    return response.json()
  },

  /**
   * Eliminar un asset
   */
  async deleteAsset(id: number): Promise<void> {
    await apiClient.delete(`/assets/${id}`)
  },
}
