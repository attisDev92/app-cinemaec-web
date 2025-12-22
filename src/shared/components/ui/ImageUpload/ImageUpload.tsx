"use client"

import { useState, useRef } from "react"
import { assetService } from "@/features/assets/services/asset.service"
import { AssetTypeEnum, AssetOwnerEnum } from "@/shared/types"
import styles from "./image-upload.module.css"

interface ImageUploadProps {
  onUploadComplete: (id: number, url: string) => void
  onRemove?: () => void
  currentImageUrl?: string
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId?: number
  label?: string
  accept?: string
  maxSize?: number // en MB
  resetAfterUpload?: boolean // Para resetear después de subir (modo multi)
}

export function ImageUpload({
  onUploadComplete,
  onRemove,
  currentImageUrl,
  documentType,
  ownerType,
  ownerId,
  label = "Subir imagen",
  accept = "image/jpeg,image/png,image/webp",
  maxSize = 5,
  resetAfterUpload = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentImageUrl || null,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validar tamaño
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxSize) {
      setError(`El archivo debe ser menor a ${maxSize}MB`)
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setError("Solo se permiten imágenes")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      // Crear preview local
      const localPreview = URL.createObjectURL(file)
      setPreviewUrl(localPreview)

      // Subir al servidor
      const response = await assetService.uploadAsset(
        file,
        documentType,
        ownerType,
        ownerId,
      )

      // Liberar el preview local
      URL.revokeObjectURL(localPreview)

      // En modo multi-upload, resetear el componente
      if (resetAfterUpload) {
        setPreviewUrl(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        // Actualizar con la URL del servidor
        setPreviewUrl(response.url)
      }

      onUploadComplete(response.id, response.url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = () => {
    setPreviewUrl(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove?.()
  }

  return (
    <div className={styles.container}>
      {previewUrl ? (
        <div className={styles.preview}>
          <img src={previewUrl} alt="Preview" className={styles.image} />
          <button
            type="button"
            onClick={handleRemove}
            className={styles.removeButton}
            disabled={isUploading}
          >
            ✕
          </button>
        </div>
      ) : (
        <label className={styles.uploadArea}>
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            className={styles.fileInput}
            disabled={isUploading}
          />
          <div className={styles.uploadContent}>
            <svg
              className={styles.uploadIcon}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className={styles.uploadText}>
              {isUploading ? "Subiendo..." : label}
            </span>
            <span className={styles.uploadHint}>
              Máx. {maxSize}MB - JPG, PNG, WEBP
            </span>
          </div>
        </label>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
