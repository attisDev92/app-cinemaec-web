import { apiClient } from "@/lib/api-client"
import { assetService } from "@/features/assets/services/asset.service"
import { AssetTypeEnum, AssetOwnerEnum } from "@/shared/types"

export interface UploadAgreementDto {
  agreementDocumentId: number
}

export interface UploadAgreementResponse {
  message: string
  profileId: number
}

export const profileService = {
  /**
   * Subir el acuerdo de responsabilidad de medios electrónicos
   * Este método maneja el proceso de dos pasos:
   * 1. Sube el archivo a /assets/upload
   * 2. Registra el acuerdo en /profiles/upload-agreement
   */
  async uploadAgreement(file: File): Promise<UploadAgreementResponse> {
    try {
      // Paso 1: Subir el archivo usando el servicio de assets
      const uploadedAsset = await assetService.uploadAsset(
        file,
        AssetTypeEnum.DOCUMENT,
        AssetOwnerEnum.USER_AGREEMENT,
      )

      // Paso 2: Registrar el acuerdo en el perfil
      const response = await apiClient.post<UploadAgreementResponse>(
        "/profiles/upload-agreement",
        {
          agreementDocumentId: uploadedAsset.id,
        },
      )

      return response
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al subir el acuerdo: ${error.message}`)
      }
      throw new Error("Error desconocido al subir el acuerdo")
    }
  },
}
