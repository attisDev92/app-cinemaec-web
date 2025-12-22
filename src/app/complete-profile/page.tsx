"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form } from "formik"
import { useAuth } from "@/features/auth/hooks"
import { authService } from "@/features/auth/services/auth.service"
import { LegalStatus } from "@/features/profile/types"
import { completeProfileValidationSchema } from "@/features/profile/lib/validations/complete-profile-schema.yup"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import { ProvinceSelector } from "@/shared/components/ProvinceSelector"
import { CitySelector } from "@/shared/components/CitySelector"
import styles from "./page.module.css"

export default function CompleteProfilePage() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    updateUser,
  } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
    // Si el perfil ya está completado, verificar si tiene el acuerdo
    else if (!authLoading && user?.hasProfile) {
      // Si no tiene el acuerdo, ir a media-agreement
      if (!user.hasUploadedAgreement) {
        router.push("/media-agreement")
      } else {
        // Si ya tiene el acuerdo, ir al home
        router.push("/home")
      }
    }
    // Verificar que el usuario esté activo (email verificado)
    else if (!authLoading && user && !user.isActive) {
      router.push("/verify-email?email=" + encodeURIComponent(user.email))
    }
  }, [isAuthenticated, authLoading, user, router])

  const handleSubmit = async (
    values: {
      legalStatus: LegalStatus
      fullName: string
      legalName: string
      tradeName: string
      birthdate: string
      province: string
      city: string
      address: string
      phone: string
    },
    {
      setSubmitting,
      setStatus,
    }: {
      setSubmitting: (isSubmitting: boolean) => void
      setStatus: (status: { error?: string }) => void
    },
  ) => {
    try {
      const profileData = {
        fullName: values.fullName.trim(),
        legalStatus: values.legalStatus,
        province: values.province.trim(),
        city: values.city.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
        ...(values.legalStatus === LegalStatus.LEGAL_ENTITY && {
          legalName: values.legalName.trim(),
          tradeName: values.tradeName.trim(),
        }),
        ...(values.legalStatus === LegalStatus.NATURAL_PERSON &&
          values.birthdate && {
            birthdate: values.birthdate,
          }),
      }

      const updatedUser = await authService.completeProfile(profileData)
      updateUser(updatedUser)
      router.push("/media-agreement")
    } catch (err) {
      setStatus({
        error:
          err instanceof Error ? err.message : "Error al completar el perfil",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <Card>
            <div className={styles.header}>
              <p className={styles.subtitle}>Cargando...</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.header}>
            <h2 className={styles.title}>Completa tu Perfil</h2>
            <p className={styles.subtitle}>
              Por favor, completa tu información para continuar
            </p>
          </div>

          <Formik
            initialValues={{
              legalStatus: LegalStatus.NATURAL_PERSON,
              fullName: "",
              legalName: "",
              tradeName: "",
              birthdate: "",
              province: "",
              city: "",
              address: "",
              phone: "",
            }}
            validationSchema={completeProfileValidationSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              setFieldValue,
              isSubmitting,
              status,
            }) => (
              <Form className={styles.form}>
                {status?.error && (
                  <div className={styles.error}>{status.error}</div>
                )}

                {/* Tipo de persona */}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Tipo de persona *</label>
                  <div className={styles.radioGroup}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="legalStatus"
                        value={LegalStatus.NATURAL_PERSON}
                        checked={
                          values.legalStatus === LegalStatus.NATURAL_PERSON
                        }
                        onChange={() =>
                          setFieldValue(
                            "legalStatus",
                            LegalStatus.NATURAL_PERSON,
                          )
                        }
                        onBlur={handleBlur}
                      />
                      <span>Persona Natural</span>
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name="legalStatus"
                        value={LegalStatus.LEGAL_ENTITY}
                        checked={
                          values.legalStatus === LegalStatus.LEGAL_ENTITY
                        }
                        onChange={() =>
                          setFieldValue("legalStatus", LegalStatus.LEGAL_ENTITY)
                        }
                        onBlur={handleBlur}
                      />
                      <span>Persona Jurídica</span>
                    </label>
                  </div>
                  {touched.legalStatus && errors.legalStatus && (
                    <div className={styles.fieldError}>
                      {errors.legalStatus}
                    </div>
                  )}
                </div>

                <Input
                  label={
                    values.legalStatus === LegalStatus.LEGAL_ENTITY
                      ? "Nombre y apellido representante legal"
                      : "Nombres y apellidos"
                  }
                  type="text"
                  name="fullName"
                  value={values.fullName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder={
                    values.legalStatus === LegalStatus.LEGAL_ENTITY
                      ? "Juan Pérez (Representante Legal)"
                      : "Juan Pérez"
                  }
                  error={touched.fullName ? errors.fullName : undefined}
                  required
                />

                {values.legalStatus === LegalStatus.LEGAL_ENTITY && (
                  <>
                    <Input
                      label="Razón social"
                      type="text"
                      name="legalName"
                      value={values.legalName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Empresa S.A."
                      error={touched.legalName ? errors.legalName : undefined}
                      required
                    />

                    <Input
                      label="Nombre comercial"
                      type="text"
                      name="tradeName"
                      value={values.tradeName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Mi Negocio"
                      error={touched.tradeName ? errors.tradeName : undefined}
                      required
                    />
                  </>
                )}

                {values.legalStatus === LegalStatus.NATURAL_PERSON && (
                  <Input
                    label="Fecha de nacimiento"
                    type="date"
                    name="birthdate"
                    value={values.birthdate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.birthdate ? errors.birthdate : undefined}
                  />
                )}

                <ProvinceSelector
                  label="Provincia"
                  name="province"
                  value={values.province}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.province ? errors.province : undefined}
                  required
                />

                <CitySelector
                  label="Ciudad"
                  name="city"
                  value={values.city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.city ? errors.city : undefined}
                  province={values.province}
                  onProvinceChange={() => setFieldValue("city", "")}
                  required
                />

                <Input
                  label="Dirección"
                  type="text"
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Av. Principal N-123"
                  error={touched.address ? errors.address : undefined}
                  required
                />

                <Input
                  label="Teléfono celular"
                  type="tel"
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="0987654321"
                  error={touched.phone ? errors.phone : undefined}
                  required
                />

                <Button
                  type="submit"
                  style={{ width: "100%" }}
                  isLoading={isSubmitting}
                >
                  Completar Perfil
                </Button>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </div>
  )
}
