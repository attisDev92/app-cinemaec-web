import { apiClient } from "@/lib/api-client"
import { environment } from "@/config/environment"
import { AssetTypeEnum, AssetOwnerEnum, Asset } from "@/shared/types"

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
   * Obtener un asset individual por ID
   */
  async getAsset(id: number): Promise<Asset> {
    const response = await apiClient.get<{ data: Asset }>(`/assets/${id}`)
    return response.data
  },

  /**
   * Construir una URL pública para un asset
   * Si la URL es relativa, la completa con el API_URL
   */
  getPublicAssetUrl(asset: Asset): string {
    if (asset.url.startsWith("http://") || asset.url.startsWith("https://")) {
      return asset.url
    }
    // Si es una URL relativa, construir la URL completa
    return `${API_URL}${asset.url.startsWith("/") ? asset.url : "/" + asset.url}`
  },

  /**
   * Eliminar un asset
   */
  async deleteAsset(id: number): Promise<void> {
    await apiClient.delete(`/assets/${id}`)
  },
}
