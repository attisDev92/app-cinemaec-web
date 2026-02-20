"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { platformsService } from "@/features/platforms"
import type {
  CreatePlatformData,
  PlatformListItem,
  PlatformType,
} from "@/features/platforms"
import { Button, Input, Select } from "@/shared/components/ui"
import styles from "./AddPlatformModal.module.css"

interface AddPlatformModalProps {
  isOpen: boolean
  onClose: () => void
  onPlatformCreated: (platform: PlatformListItem) => void
  isLoading?: boolean
}

const PLATFORM_TYPE_OPTIONS: { value: PlatformType; label: string }[] = [
  { value: "Nacional" as PlatformType, label: "Nacional" },
  { value: "Internacional" as PlatformType, label: "Internacional" },
]

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  type: Yup.string().required("El tipo es obligatorio"),
})

const initialValues: CreatePlatformData = {
  name: "",
  type: "Nacional" as PlatformType,
}

export function AddPlatformModal({
  isOpen,
  onClose,
  onPlatformCreated,
  isLoading = false,
}: AddPlatformModalProps) {
  const [error, setError] = useState<string | null>(null)

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      try {
        const newPlatform = await platformsService.create({
          name: values.name.trim(),
          type: values.type,
        })

        onPlatformCreated(newPlatform)
        formik.resetForm()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido")
      }
    },
  })

  if (!isOpen) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Crear Nueva Plataforma</h2>
          <button
            className={styles.closeButton}
            onClick={onClose}
            type="button"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} className={styles.form}>
          <div className={styles.content}>
            <Input
              label="Nombre *"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ej: Netflix"
              error={
                formik.touched.name && formik.errors.name
                  ? String(formik.errors.name)
                  : undefined
              }
            />

            <Select
              label="Tipo *"
              name="type"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.type && formik.errors.type
                  ? String(formik.errors.type)
                  : undefined
              }
            >
              {PLATFORM_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>

          <div className={styles.footer}>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={formik.isSubmitting || isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={formik.isSubmitting || isLoading || !formik.isValid}
            >
              {formik.isSubmitting || isLoading ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
