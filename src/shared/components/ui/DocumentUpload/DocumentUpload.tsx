"use client"

import { useState, useRef } from "react"
import { assetService } from "@/features/assets/services/asset.service"
import { AssetTypeEnum, AssetOwnerEnum } from "@/shared/types"
import styles from "./document-upload.module.css"

interface DocumentUploadProps {
  onUploadComplete: (id: number, url: string) => void
  onRemove?: () => void
  currentDocumentUrl?: string
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId?: number
  label?: string
  maxSize?: number // en MB
}

export function DocumentUpload({
  onUploadComplete,
  onRemove,
  currentDocumentUrl,
  documentType,
  ownerType,
  ownerId,
  label = "Subir documento PDF",
  maxSize = 10,
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<{
    name: string
    url: string
  } | null>(
    currentDocumentUrl
      ? { name: "Documento actual", url: currentDocumentUrl }
      : null,
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

    // Validar tipo - solo PDF
    if (file.type !== "application/pdf") {
      setError("Solo se permiten archivos PDF")
      return
    }

    setError(null)
    setIsUploading(true)

    try {
      const response = await assetService.uploadAsset(
        file,
        documentType,
        ownerType,
        ownerId,
      )

      setUploadedFile({
        name: file.name,
        url: response.url,
      })
      onUploadComplete(response.id, response.url)
    } catch (err) {
      console.error("Error al subir documento:", err)
      setError(
        err instanceof Error
          ? err.message
          : "Error al subir el documento. Intenta nuevamente.",
      )
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = () => {
    setUploadedFile(null)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    onRemove?.()
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={styles.container}>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        onChange={handleFileSelect}
        className={styles.hiddenInput}
        disabled={isUploading}
      />

      {!uploadedFile ? (
        <button
          type="button"
          onClick={handleButtonClick}
          className={styles.uploadButton}
          disabled={isUploading}
        >
          {isUploading ? (
            <span className={styles.loading}>Subiendo...</span>
          ) : (
            <>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <span>{label}</span>
              <span className={styles.hint}>PDF - Máx. {maxSize}MB</span>
            </>
          )}
        </button>
      ) : (
        <div className={styles.previewContainer}>
          <div className={styles.documentInfo}>
            <svg
              className={styles.pdfIcon}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <div className={styles.documentDetails}>
              <span className={styles.documentName}>{uploadedFile.name}</span>
              <span className={styles.documentType}>PDF</span>
            </div>
          </div>
          <div className={styles.actions}>
            <a
              href={uploadedFile.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.viewButton}
            >
              Ver
            </a>
            <button
              type="button"
              onClick={handleRemove}
              className={styles.removeButton}
              disabled={isUploading}
            >
              Eliminar
            </button>
          </div>
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
