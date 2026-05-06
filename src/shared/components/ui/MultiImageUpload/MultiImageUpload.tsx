"use client"

import { useEffect, useState } from "react"
import { ImageUpload } from "../ImageUpload"
import { assetService } from "@/features/assets/services/asset.service"
import { AssetTypeEnum, AssetOwnerEnum } from "@/shared/types"
import styles from "./multi-image-upload.module.css"

interface ImageData {
  id: number
  url: string
  localId: string
}

interface MultiImageUploadProps {
  onImagesChange: (imageIds: number[]) => void
  currentImages?: ImageData[]
  documentType: AssetTypeEnum
  ownerType: AssetOwnerEnum
  ownerId?: number
  maxImages?: number
  label?: string
  deleteAssetOnRemove?: boolean
}

export function MultiImageUpload({
  onImagesChange,
  currentImages,
  documentType,
  ownerType,
  ownerId,
  maxImages = 10,
  label = "Fotos del espacio",
  deleteAssetOnRemove = false,
}: MultiImageUploadProps) {
  const [images, setImages] = useState<ImageData[]>(currentImages ?? [])
  const [isRemoving, setIsRemoving] = useState(false)

  useEffect(() => {
    if (!currentImages) {
      return
    }

    setImages(currentImages)
  }, [currentImages])

  const handleUploadComplete = (id: number, url: string) => {
    const newImage: ImageData = {
      id,
      url,
      localId: Date.now().toString(),
    }
    const updatedImages = [...images, newImage]
    setImages(updatedImages)
    onImagesChange(updatedImages.map((img) => img.id))
  }

  const handleRemoveImage = async (localId: string) => {
    const imageToRemove = images.find((img) => img.localId === localId)
    if (!imageToRemove) {
      return
    }

    if (deleteAssetOnRemove) {
      try {
        setIsRemoving(true)
        await assetService.deleteAsset(imageToRemove.id)
      } catch (error) {
        console.error("No se pudo eliminar la imagen", error)
        return
      } finally {
        setIsRemoving(false)
      }
    }

    const updatedImages = images.filter((img) => img.localId !== localId)
    setImages(updatedImages)
    onImagesChange(updatedImages.map((img) => img.id))
  }

  const canAddMore = images.length < maxImages

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.label}>{label}</h3>
        <span className={styles.count}>
          {images.length} / {maxImages}
        </span>
      </div>

      <div className={styles.grid}>
        {images.map((image) => (
          <div key={image.localId} className={styles.imageWrapper}>
            <img src={image.url} alt="" className={styles.image} />
            <button
              type="button"
              onClick={() => handleRemoveImage(image.localId)}
              className={styles.removeButton}
              disabled={isRemoving}
            >
              ✕
            </button>
          </div>
        ))}

        {canAddMore && (
          <div className={styles.uploadWrapper}>
            <ImageUpload
              documentType={documentType}
              ownerType={ownerType}
              ownerId={ownerId}
              onUploadComplete={handleUploadComplete}
              label="Agregar foto"
              resetAfterUpload={true}
            />
          </div>
        )}
      </div>

      {!canAddMore && (
        <p className={styles.maxReached}>
          Has alcanzado el límite de {maxImages} imágenes
        </p>
      )}
    </div>
  )
}
