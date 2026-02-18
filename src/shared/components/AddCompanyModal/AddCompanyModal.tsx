"use client"

import { useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { companiesService } from "@/features/companies"
import { Button, Input, Select } from "@/shared/components/ui"
import styles from "./AddCompanyModal.module.css"

interface AddCompanyModalProps {
  isOpen: boolean
  onClose: () => void
  onCompanyCreated: (companyId: number, companyName: string) => void
  isLoading?: boolean
}

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre comercial es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  ruc: Yup.string()
    .required("El RUC es obligatorio")
    .min(5, "El RUC debe tener al menos 5 caracteres")
    .max(20, "El RUC no puede exceder 20 caracteres"),
  businessType: Yup.string()
    .required("Selecciona un tipo de negocio")
    .oneOf(
      ["production", "distribution", "exhibition", "cultural", "educational", "other"],
      "Tipo de negocio inválido"
    ),
})

const initialValues = {
  name: "",
  ruc: "",
  businessType: "production",
}

const BUSINESS_TYPE_OPTIONS = [
  { value: "production", label: "Producción" },
  { value: "distribution", label: "Distribución" },
  { value: "exhibition", label: "Exhibición" },
  { value: "cultural", label: "Cultural" },
  { value: "educational", label: "Educacional" },
  { value: "other", label: "Otro" },
]

export function AddCompanyModal({
  isOpen,
  onClose,
  onCompanyCreated,
  isLoading = false,
}: AddCompanyModalProps) {
  const [error, setError] = useState<string | null>(null)

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values) => {
      setError(null)
      try {
        const newCompany = await companiesService.create({
          name: values.name,
          legalName: values.name,
          ruc: values.ruc,
          businessType: values.businessType,
          address: "-",
          city: "-",
          province: "-",
          country: "Ecuador",
          phone: "-",
          email: "-",
          legalRepresentative: "-",
          legalRepresentativeId: "-",
        })

        onCompanyCreated(newCompany.id, newCompany.name)
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
          <h2 className={styles.title}>Crear Nueva Empresa</h2>
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
              label="Nombre Comercial *"
              name="name"
              value={formik.values.name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ej: Productora Ecuatoriana"
              error={
                formik.touched.name && formik.errors.name
                  ? formik.errors.name
                  : undefined
              }
            />

            <Input
              label="RUC *"
              name="ruc"
              value={formik.values.ruc}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Ej: 1790123456"
              error={
                formik.touched.ruc && formik.errors.ruc
                  ? formik.errors.ruc
                  : undefined
              }
            />

            <Select
              label="Tipo de Negocio *"
              name="businessType"
              value={formik.values.businessType}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.businessType && formik.errors.businessType
                  ? formik.errors.businessType
                  : undefined
              }
            >
              {BUSINESS_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

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
              {isLoading ? "Creando..." : "Crear Empresa"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
