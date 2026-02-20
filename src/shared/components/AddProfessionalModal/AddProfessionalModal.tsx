import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { professionalsService, type Professional } from "@/features/professionals"
import { Button, Input } from "@/shared/components/ui"
import styles from "./AddProfessionalModal.module.css"

interface AddProfessionalModalProps {
  isOpen: boolean
  onClose: () => void
  onProfessionalCreated: (professional: Professional) => void
  isLoading?: boolean
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  dniNumber: Yup.string()
    .optional()
    .max(20, "La cédula no puede exceder 20 caracteres"),
})

const initialValues = {
  name: "",
  dniNumber: "",
}

export function AddProfessionalModal({
  isOpen,
  onClose,
  onProfessionalCreated,
  isLoading = false,
}: AddProfessionalModalProps) {
  const [error, setError] = useState<string | null>(null)

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      try {
        const newProfessional = await professionalsService.create({
          name: values.name,
          dniNumber: values.dniNumber || null,
        }) as Professional

        onProfessionalCreated(newProfessional)
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
          <h2 className={styles.title}>Crear Nuevo Profesional</h2>
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
              placeholder="Ej: Juan García López"
              error={
                formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : undefined
              }
            />

            <Input
              label="Cédula"
              name="dniNumber"
              value={formik.values.dniNumber}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ej: 1234567890"
              error={
                formik.touched.dniNumber && formik.errors.dniNumber
                  ? formik.errors.dniNumber
                  : undefined
              }
            />

            {error && <div className={styles.error}>{error}</div>}
          </div>

          <div className={styles.footer}>
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <Button
              type="submit"
              disabled={isLoading || !formik.isValid}
            >
              {isLoading ? "Creando..." : "Crear Profesional"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
