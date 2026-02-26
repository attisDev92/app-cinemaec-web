"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form } from "formik"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { Navbar } from "@/shared/components/Navbar"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import { ProvinceSelector } from "@/shared/components/ProvinceSelector"
import { CitySelector } from "@/shared/components/CitySelector"
import { LegalStatus } from "@/features/profile/types"
import {
  professionalsService,
  type ProfessionalClaimCheckResponse,
} from "@/features/professionals"
import { UserRole } from "@/shared/types/auth"
import styles from "./page.module.css"

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const {
    profile,
    isLoading: profileLoading,
    loadProfile,
    updateProfile,
  } = useProfile()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState("")
  const [professionalClaim, setProfessionalClaim] =
    useState<ProfessionalClaimCheckResponse | null>(null)
  const [isCheckingProfessionalClaim, setIsCheckingProfessionalClaim] =
    useState(false)
  const [isClaimingProfessional, setIsClaimingProfessional] = useState(false)
  const [professionalClaimMessage, setProfessionalClaimMessage] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    } else if (!authLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    } else if (
      !authLoading &&
      user &&
      user.hasProfile &&
      !user.hasUploadedAgreement
    ) {
      router.push("/media-agreement")
    } else if (!authLoading && user && user.hasProfile) {
      loadProfile()
    }
  }, [isAuthenticated, authLoading, user, router, loadProfile])

  useEffect(() => {
    const checkProfessionalClaim = async () => {
      if (!user || !profile) return
      if (profile.legalStatus === LegalStatus.LEGAL_ENTITY) return

      try {
        setIsCheckingProfessionalClaim(true)
        const response = await professionalsService.checkClaimByCedula()
        setProfessionalClaim(response)
      } catch {
        setProfessionalClaim(null)
      } finally {
        setIsCheckingProfessionalClaim(false)
      }
    }

    checkProfessionalClaim()
  }, [user, profile])

  const handleClaimProfessionalProfile = async () => {
    try {
      setIsClaimingProfessional(true)
      const response = await professionalsService.claimRegisteredProfile()
      setProfessionalClaimMessage(response.message)
      setProfessionalClaim((prev) =>
        prev
          ? {
              ...prev,
              canClaim: false,
              alreadyClaimedByYou: true,
              claimedByAnotherUser: false,
            }
          : prev,
      )
    } catch (err) {
      setProfessionalClaimMessage(
        err instanceof Error ? err.message : "No se pudo reclamar el perfil",
      )
    } finally {
      setIsClaimingProfessional(false)
    }
  }

  const handleSubmit = async (
    values: {
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
      setStatus: (status: { error?: string; success?: string }) => void
    },
  ) => {
    try {
      const updateData: Record<string, string> = {
        fullName: values.fullName.trim(),
        province: values.province.trim(),
        city: values.city.trim(),
        address: values.address.trim(),
        phone: values.phone.trim(),
      }

      if (profile?.legalStatus === LegalStatus.LEGAL_ENTITY) {
        updateData.legalName = values.legalName.trim()
        updateData.tradeName = values.tradeName.trim()
      } else if (values.birthdate) {
        updateData.birthdate = values.birthdate
      }

      await updateProfile(updateData)
      setIsEditing(false)
      setStatus({ success: "Perfil actualizado correctamente" })
    } catch (err) {
      setStatus({
        error:
          err instanceof Error ? err.message : "Error al actualizar el perfil",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando...</div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  const isLegalEntity = profile.legalStatus === LegalStatus.LEGAL_ENTITY

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mi Perfil</h1>
          {!isEditing && (
            <Button onClick={() => setIsEditing(true)}>Editar Perfil</Button>
          )}
        </div>

        {error && !isEditing && <div className={styles.error}>{error}</div>}

        {!isCheckingProfessionalClaim &&
          (professionalClaim?.canClaim || professionalClaimMessage) && (
          <Card className={styles.claimCard}>
            <h3 className={styles.claimTitle}>Reclamar perfil registrado</h3>
            <p className={styles.claimText}>
              Tu perfil fue registrado en el antiguo portal del
              Listado Ecuatoriano Audiovisual - LEA, si este es tu perfil
              puedes reclamarlo, editarlo y completarlo.
            </p>
            {professionalClaim?.canClaim && (
              <div className={styles.claimActions}>
                <Button
                  onClick={handleClaimProfessionalProfile}
                  isLoading={isClaimingProfessional}
                >
                  Aceptar
                </Button>
              </div>
            )}
            {professionalClaimMessage && (
              <div className={styles.success}>{professionalClaimMessage}</div>
            )}
          </Card>
          )}

        <Card>
          {isEditing ? (
            <Formik
              initialValues={{
                fullName: profile.fullName,
                legalName: profile.legalName || "",
                tradeName: profile.tradeName || "",
                birthdate: profile.birthdate
                  ? profile.birthdate instanceof Date
                    ? profile.birthdate.toISOString().split("T")[0]
                    : profile.birthdate
                  : "",
                province: profile.province || "",
                city: profile.city || "",
                address: profile.address || "",
                phone: profile.phone || "",
              }}
              onSubmit={handleSubmit}
            >
              {({
                values,
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
                  {status?.success && (
                    <div className={styles.success}>{status.success}</div>
                  )}

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Tipo de persona</label>
                    <p className={styles.readOnlyValue}>
                      {isLegalEntity ? "Persona Jurídica" : "Persona Natural"}
                    </p>
                    <small className={styles.helpText}>
                      Este campo no se puede modificar
                    </small>
                  </div>

                  <Input
                    label={
                      isLegalEntity
                        ? "Nombre y apellido representante legal"
                        : "Nombres y apellidos"
                    }
                    type="text"
                    name="fullName"
                    value={values.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />

                  {isLegalEntity && (
                    <>
                      <Input
                        label="Razón social"
                        type="text"
                        name="legalName"
                        value={values.legalName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />

                      <Input
                        label="Nombre comercial"
                        type="text"
                        name="tradeName"
                        value={values.tradeName}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        required
                      />
                    </>
                  )}

                  {!isLegalEntity && (
                    <Input
                      label="Fecha de nacimiento"
                      type="date"
                      name="birthdate"
                      value={values.birthdate}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  )}

                  <ProvinceSelector
                    label="Provincia"
                    name="province"
                    value={values.province}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    required
                  />

                  <CitySelector
                    label="Ciudad"
                    name="city"
                    value={values.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
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
                    required
                  />

                  <div className={styles.buttonGroup}>
                    <Button type="submit" isLoading={isSubmitting}>
                      Guardar Cambios
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false)
                        setError("")
                      }}
                    >
                      Cancelar
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className={styles.profileView}>
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Información Personal</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <strong>Tipo de persona:</strong>
                    <span>
                      {isLegalEntity ? "Persona Jurídica" : "Persona Natural"}
                    </span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>
                      {isLegalEntity
                        ? "Representante legal:"
                        : "Nombre completo:"}
                    </strong>
                    <span>{profile.fullName}</span>
                  </div>
                  {isLegalEntity && (
                    <>
                      <div className={styles.infoItem}>
                        <strong>Razón social:</strong>
                        <span>{profile.legalName}</span>
                      </div>
                      <div className={styles.infoItem}>
                        <strong>Nombre comercial:</strong>
                        <span>{profile.tradeName}</span>
                      </div>
                    </>
                  )}
                  {!isLegalEntity && profile.birthdate && (
                    <div className={styles.infoItem}>
                      <strong>Fecha de nacimiento:</strong>
                      <span>
                        {new Date(profile.birthdate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Ubicación y Contacto</h3>
                <div className={styles.infoGrid}>
                  <div className={styles.infoItem}>
                    <strong>Provincia:</strong>
                    <span>{profile.province}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Ciudad:</strong>
                    <span>{profile.city}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Dirección:</strong>
                    <span>{profile.address}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <strong>Teléfono:</strong>
                    <span>{profile.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className={styles.infoCard}>
          <h3 className={styles.infoTitle}>Información de la Cuenta</h3>
          <div className={styles.infoContent}>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
            <p>
              <strong>Cédula:</strong> {user.cedula}
            </p>
            <p>
              <strong>Tipo de cuenta:</strong>{" "}
              {user.role === UserRole.ADMIN
                ? "Administrador"
                : user.role === UserRole.EDITOR
                  ? "Editor"
                  : "Usuario"}
            </p>
            <p>
              <strong>Fecha de registro:</strong>{" "}
              {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className={styles.buttonGroup}>
            <Button
              variant="secondary"
              onClick={() => router.push("/profile/change-password")}
            >
              Cambiar Contraseña
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
