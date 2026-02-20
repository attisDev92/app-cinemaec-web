"use client"

import { useMemo, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { exhibitionSpacesService } from "@/features/exhibition-spaces"
import type {
  CreateExhibitionSpaceData,
  ExhibitionSpaceListItem,
} from "@/features/exhibition-spaces"
import { Button, Input, Select } from "@/shared/components/ui"
import styles from "./AddExhibitionSpaceModal.module.css"

interface AddExhibitionSpaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSpaceCreated: (space: ExhibitionSpaceListItem) => void
  countries: Array<{ id: number; name: string }>
  isLoading?: boolean
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  countryId: Yup.number()
    .typeError("Selecciona un país")
    .required("El país es obligatorio"),
})

const initialValues: CreateExhibitionSpaceData = {
  name: "",
  countryId: 0,
}

export function AddExhibitionSpaceModal({
  isOpen,
  onClose,
  onSpaceCreated,
  countries,
  isLoading = false,
}: AddExhibitionSpaceModalProps) {
  const [error, setError] = useState<string | null>(null)

  const sortedCountries = useMemo(
    () => [...countries].sort((a, b) => a.name.localeCompare(b.name)),
    [countries],
  )

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      try {
        const newSpace = await exhibitionSpacesService.create({
          name: values.name.trim(),
          countryId: Number(values.countryId),
        })

        onSpaceCreated(newSpace)
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
          <h2 className={styles.title}>Crear Nuevo Espacio de Exhibición</h2>
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
              placeholder="Ej: Multicines"
              error={
                formik.touched.name && formik.errors.name
                  ? String(formik.errors.name)
                  : undefined
              }
            />

            <Select
              label="País *"
              name="countryId"
              value={formik.values.countryId || ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.countryId && formik.errors.countryId
                  ? String(formik.errors.countryId)
                  : undefined
              }
            >
              <option value="">Selecciona un país</option>
              {sortedCountries.map((country) => (
                <option key={country.id} value={country.id}>
                  {country.name}
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
