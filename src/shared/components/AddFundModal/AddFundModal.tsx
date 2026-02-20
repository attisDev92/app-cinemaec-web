"use client"

import { useMemo, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { fundsService } from "@/features/funds"
import type { CreateFundData, FinancialOrigin, FundListItem, FundType } from "@/features/funds"
import { Button, Checkbox, Input, Select } from "@/shared/components/ui"
import styles from "./AddFundModal.module.css"

interface AddFundModalProps {
  isOpen: boolean
  onClose: () => void
  onFundCreated: (fund: FundListItem) => void
  countries: Array<{ id: number; name: string }>
  isLoading?: boolean
}

const FUND_TYPE_OPTIONS: FundType[] = [
  "Fondo",
  "Festival",
  "Premio",
  "Espacios de participación",
]

const FINANCIAL_ORIGIN_OPTIONS: FinancialOrigin[] = [
  "Público",
  "Privado",
  "Mixto",
  "Desconocido",
]

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required("El nombre es obligatorio")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  countryId: Yup.number()
    .typeError("Selecciona un país")
    .required("El país es obligatorio"),
  type: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos un tipo")
    .required("Selecciona al menos un tipo"),
  financialOrigin: Yup.string().required("Selecciona el origen financiero"),
})

const initialValues: CreateFundData = {
  name: "",
  countryId: 0,
  type: [],
  financialOrigin: "Desconocido",
}

export function AddFundModal({
  isOpen,
  onClose,
  onFundCreated,
  countries,
  isLoading = false,
}: AddFundModalProps) {
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
        const newFund = await fundsService.create({
          name: values.name.trim(),
          countryId: Number(values.countryId),
          type: values.type,
          financialOrigin: values.financialOrigin as FinancialOrigin,
        })

        onFundCreated(newFund)
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
          <h2 className={styles.title}>Crear Nuevo Fondo, Festival o Espacio de Participación</h2>
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
              placeholder="Ej: Fondo de Cine"
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

            <div className={styles.fieldGroup}>
              <p className={styles.groupLabel}>Tipo *</p>
              <div className={styles.optionGrid}>
                {FUND_TYPE_OPTIONS.map((option) => (
                  <Checkbox
                    key={option}
                    label={option}
                    variant="pill"
                    checked={formik.values.type.includes(option)}
                    onChange={() => {
                      const current = formik.values.type
                      const next = current.includes(option)
                        ? current.filter((value) => value !== option)
                        : [...current, option]
                      formik.setFieldValue("type", next)
                    }}
                  />
                ))}
              </div>
              {formik.touched.type && formik.errors.type && (
                <p className={styles.fieldError}>{String(formik.errors.type)}</p>
              )}
            </div>

            <Select
              label="Origen financiero *"
              name="financialOrigin"
              value={formik.values.financialOrigin}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={
                formik.touched.financialOrigin && formik.errors.financialOrigin
                  ? String(formik.errors.financialOrigin)
                  : undefined
              }
            >
              <option value="">Selecciona un origen</option>
              {FINANCIAL_ORIGIN_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
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
            <Button type="submit" disabled={isLoading || !formik.isValid}>
              {isLoading ? "Creando..." : "Crear Fondo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
