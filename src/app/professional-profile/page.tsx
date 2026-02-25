"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { LegalStatus } from "@/features/profile/types"
import {
  professionalsService,
  type ProfessionalClaimCheckResponse,
} from "@/features/professionals"
import { Navbar } from "@/shared/components/Navbar"
import { Card, Button, Input } from "@/shared/components/ui"
import styles from "./page.module.css"

export default function ProfessionalProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const { profile, loadProfile } = useProfile()
  const [claimData, setClaimData] = useState<ProfessionalClaimCheckResponse | null>(
    null,
  )
  const [isChecking, setIsChecking] = useState(true)
  const [isClaiming, setIsClaiming] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [showClaimSuccess, setShowClaimSuccess] = useState(false)
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    number | null
  >(null)
  const [phone, setPhone] = useState("")
  const [mobile, setMobile] = useState("")
  const [website, setWebsite] = useState("")
  const [linkedin, setLinkedin] = useState("")

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setMessage("")
      setShowClaimSuccess(false)
      router.push("/login")
      return
    }
  }, [authLoading, isAuthenticated, router])

  useEffect(() => {
    // Reset success message when user changes (logout/login)
    setMessage("")
    setShowClaimSuccess(false)
  }, [user?.id])

  useEffect(() => {
    // Reset form fields when profile changes
    setPhone(profile?.phone || "")
    setMobile("")
    setWebsite("")
    setLinkedin("")
  }, [profile?.id, profile?.phone])

  useEffect(() => {
    const runCheck = async () => {
      // Solo ejecutar si el usuario está autenticado
      if (!user || authLoading) {
        return
      }

      if (!profile) {
        await loadProfile()
      }

      // Si el usuario tiene perfil cargado, validar que sea persona natural
      if (profile && profile.legalStatus === LegalStatus.LEGAL_ENTITY) {
        setIsChecking(false)
        setError("Este módulo está disponible solo para persona natural")
        return
      }

      try {
        setIsChecking(true)
        const response = await professionalsService.checkClaimByCedula()
        setError("")
        setClaimData(response)
        setSelectedProfessionalId(null)
        setIsChecking(false)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo verificar el perfil profesional",
        )
        setIsChecking(false)
      }
    }

    runCheck()
  }, [user, profile, authLoading, loadProfile])

  const shouldShowClaimSection =
    isChecking ||
    !claimData ||
    (claimData.hasMatch && !claimData.alreadyClaimedByYou && !claimData.claimedByAnotherUser)

  const shouldShowVerificationError = claimData && !claimData.hasMatch
  const hasMultipleNameMatches = Boolean(
    claimData?.requiresSelection && claimData?.nameMatches?.length,
  )
  const canSubmitClaim = Boolean(
    claimData &&
      claimData.hasMatch &&
      (claimData.canClaim || claimData.requiresSelection) &&
      (!claimData.requiresSelection || selectedProfessionalId),
  )

  const handleClaim = async () => {
    try {
      if (claimData?.requiresSelection && !selectedProfessionalId) {
        setError("Selecciona un perfil para reclamar")
        return
      }
      setIsClaiming(true)
      setError("")
      const response = await professionalsService.claimRegisteredProfile(
        selectedProfessionalId || undefined,
      )
      setMessage(response.message)
      setShowClaimSuccess(true)
      // Actualizar claimData para reflejar que fue reclamado
      setClaimData((prev) =>
        prev
          ? {
              ...prev,
              canClaim: false,
              alreadyClaimedByYou: true,
              claimedByAnotherUser: false,
              professionalId: response.professionalId,
              professionalName:
                prev.professionalName ||
                prev.nameMatches?.find(
                  (match) => match.id === response.professionalId,
                )?.name ||
                null,
            }
          : prev,
      )
      // Pequeña pausa para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        setMessage("")
        setShowClaimSuccess(false)
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudo reclamar el perfil",
      )
    } finally {
      setIsClaiming(false)
    }
  }

  const handleCreateProfessional = async () => {
    if (!profile?.fullName || !user?.cedula) {
      setError("Completa tu perfil para registrar un profesional")
      return
    }

    try {
      setIsCreating(true)
      setError("")
      const response = await professionalsService.registerForCurrentUser({
        name: profile.fullName,
        dniNumber: user.cedula,
        phone: phone || null,
        mobile: mobile || null,
        website: website || null,
        linkedin: linkedin || null,
      })

      setMessage("Perfil profesional registrado exitosamente")
      setShowClaimSuccess(true)
      setClaimData({
        hasMatch: true,
        canClaim: false,
        alreadyClaimedByYou: true,
        claimedByAnotherUser: false,
        professionalId: response.id,
        professionalName: response.name,
        dniNumber: response.dniNumber || user.cedula,
        requiresSelection: false,
        nameMatches: [],
      })

      setTimeout(() => {
        setMessage("")
        setShowClaimSuccess(false)
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar el perfil profesional",
      )
    } finally {
      setIsCreating(false)
    }
  }

  if (authLoading || isChecking) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1 className={styles.title}>Perfil de Profesionales</h1>

        <Card>
          {error && shouldShowVerificationError && (
            <div className={styles.error}>{error}</div>
          )}
          {error && !shouldShowVerificationError && (
            <div className={styles.error}>{error}</div>
          )}
          {showClaimSuccess && message && (
            <div className={styles.success}>{message}</div>
          )}

          {/* Vista de Reclamación de Perfil */}
          {shouldShowClaimSection && (
            <>
              <h3 className={styles.claimTitle}>Reclamar perfil registrado</h3>
              <p className={styles.claimText}>
                Tu número de cédula fue registrado en el antiguo portal del
                Listado Ecuatoriano Audiovisual - LEA, si este es tu perfil
                puedes reclamarlo, editarlo y completarlo.
              </p>
              {hasMultipleNameMatches && (
                <div className={styles.matchList}>
                  <p className={styles.matchHint}>
                    Se encontraron varias coincidencias por nombre. Selecciona
                    tu perfil para continuar:
                  </p>
                  <div className={styles.matchOptions}>
                    {claimData?.nameMatches?.map((match) => (
                      <label key={match.id} className={styles.matchOption}>
                        <input
                          type="radio"
                          name="professionalMatch"
                          value={match.id}
                          checked={selectedProfessionalId === match.id}
                          onChange={() => setSelectedProfessionalId(match.id)}
                        />
                        <span>{match.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
              {claimData?.professionalName && (
                <div className={styles.claimDetails}>
                  <p className={styles.claimText}>
                    Perfil encontrado: <strong>{claimData.professionalName}</strong>
                  </p>
                  {claimData?.dniNumber && (
                    <p className={styles.claimText}>
                      Cédula: <strong>{claimData.dniNumber}</strong>
                    </p>
                  )}
                </div>
              )}
              {claimData && claimData.hasMatch && claimData.canClaim && (
                <Button
                  onClick={handleClaim}
                  isLoading={isClaiming}
                  disabled={!canSubmitClaim}
                >
                  Aceptar
                </Button>
              )}
              {claimData && claimData.hasMatch && claimData.requiresSelection && (
                <Button
                  onClick={handleClaim}
                  isLoading={isClaiming}
                  disabled={!canSubmitClaim}
                >
                  Aceptar
                </Button>
              )}
            </>
          )}

          {/* Vista de Perfil Reclamado */}
          {claimData &&
            !shouldShowClaimSection &&
            claimData.alreadyClaimedByYou &&
            claimData.hasMatch &&
            !showClaimSuccess && (
            <div className={styles.profileClaimedSection}>
              <div className={styles.successBadge}>
                <div className={styles.checkmark}>✓</div>
              </div>
              <h2 className={styles.profileTitle}>
                {claimData.professionalName}
              </h2>
              
              <div className={styles.profileDetails}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Identificación:</span>
                  <span className={styles.value}>{claimData.dniNumber}</span>
                </div>
                
                <div className={styles.detailItem}>
                  <span className={styles.label}>Estado:</span>
                  <span className={`${styles.value} ${styles.statusClaimed}`}>
                    Perfil Reclamado
                  </span>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>ID Profesional:</span>
                  <span className={styles.value}>{claimData.professionalId}</span>
                </div>
              </div>

              <div className={styles.profileActions}>
                <Button 
                  onClick={() => router.push("/professional-profile/edit")}
                  className={styles.editButton}
                >
                  Editar Perfil
                </Button>
              </div>

              <p className={styles.infoText}>
                Tu perfil profesional ha sido reclamado exitosamente. Ahora puedes
                editar tu información y completar tus datos profesionales.
              </p>
            </div>
          )}

          {claimData && !claimData.canClaim && claimData.claimedByAnotherUser && (
            <p className={styles.claimText}>
              {claimData.professionalName
                ? `El perfil profesional ${claimData.professionalName} asociado a tu número de cédula ya fue reclamado por otro usuario.`
                : "El perfil profesional asociado a tu número de cédula ya fue reclamado por otro usuario."}
            </p>
          )}

          {claimData && !claimData.hasMatch && (
            <div className={styles.createProfileSection}>
              <h3 className={styles.claimTitle}>Registrar nuevo perfil</h3>
              <p className={styles.claimText}>
                No se encontró un perfil profesional registrado con tu número de
                cédula. Puedes registrar uno nuevo con tus datos.
              </p>
              <div className={styles.formGrid}>
                <Input
                  label="Nombre completo"
                  value={profile?.fullName || ""}
                  disabled
                />
                <Input
                  label="Cédula"
                  value={user?.cedula || ""}
                  disabled
                />
                <Input
                  label="Teléfono"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="Ej: 02 234 5678"
                />
                <Input
                  label="Celular"
                  value={mobile}
                  onChange={(event) => setMobile(event.target.value)}
                  placeholder="Ej: 0999999999"
                />
                <Input
                  label="Sitio web"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                  placeholder="https://..."
                />
                <Input
                  label="LinkedIn"
                  value={linkedin}
                  onChange={(event) => setLinkedin(event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.formActions}>
                <Button
                  onClick={handleCreateProfessional}
                  isLoading={isCreating}
                  disabled={!profile?.fullName || !user?.cedula}
                >
                  Registrar perfil profesional
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
