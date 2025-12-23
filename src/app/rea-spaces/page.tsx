"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button } from "@/shared/components/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { UserRole, Space, SpaceStatus } from "@/shared/types"
import { spaceService } from "@/features/spaces/services/space.service"
import styles from "./rea-spaces.module.css"

export default function REASpacesPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [spaces, setSpaces] = useState<Space[]>([])
  const [loadingSpaces, setLoadingSpaces] = useState(true)

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!isLoading && !user) {
      router.push("/login")
    }
    // Redirigir si no tiene perfil
    else if (!isLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    }
    // Redirigir si no ha subido el acuerdo
    else if (
      !isLoading &&
      user &&
      user.hasProfile &&
      !user.hasUploadedAgreement
    ) {
      router.push("/media-agreement")
    }
    // Redirigir si es admin
    else if (
      !isLoading &&
      user &&
      user.role !== UserRole.USER &&
      user.role !== UserRole.EDITOR
    ) {
      router.push("/admin")
    }
  }, [user, isLoading, router])

  // Cargar espacios del usuario
  useEffect(() => {
    const fetchSpaces = async () => {
      if (!user) return

      try {
        setLoadingSpaces(true)
        const userSpaces = await spaceService.getMySpaces()
        // Asegurarse de que sea un array
        if (Array.isArray(userSpaces)) {
          setSpaces(userSpaces)
        } else {
          console.error("La respuesta no es un array:", userSpaces)
          setSpaces([])
        }
      } catch (error) {
        console.error("Error al cargar espacios:", error)
        setSpaces([])
      } finally {
        setLoadingSpaces(false)
      }
    }

    if (!isLoading && user) {
      fetchSpaces()
    }
  }, [user, isLoading])

  const handleRegisterSpace = () => {
    // Por ahora solo navegamos a una página de registro (se creará después)
    router.push("/rea-spaces/register")
  }

  const handleViewDetails = (space: Space) => {
    // Si no tiene contrato, llevarlo a completar el acuerdo
    if (!space.contractId) {
      router.push(`/rea-spaces/agreement/${space.id}`)
      return
    }

    // Si está PENDING, mostrar observaciones y permitir editar
    if (space.status === SpaceStatus.PENDING) {
      router.push(`/rea-spaces/${space.id}/observations`)
      return
    }

    // Si está VERIFIED o REJECTED, ver detalles
    if (
      space.status === SpaceStatus.VERIFIED ||
      space.status === SpaceStatus.REJECTED
    ) {
      router.push(`/rea-spaces/${space.id}`)
      return
    }

    // Si está UNDER_REVIEW, el botón está deshabilitado, no hace nada
  }

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return null
  }

  // No mostrar nada si no tiene el role correcto (mientras redirige)
  if (user && user.role !== UserRole.USER && user.role !== UserRole.EDITOR) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>🎬</span>
              Espacios de la REA
            </h1>
            <p className={styles.subtitle}>
              Registra y gestiona tus espacios de exhibición cinematográfica.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.infoCard}>
            <div className={styles.infoText}>
              <h3 className={styles.infoTitle}>¿Qué es un Espacio REA?</h3>
              <p>
                Los Espacios de la Red Ecuatoriana Audiovisual (REA) son lugares
                físicos de exhibición cinematográfica alternativos a las salas
                de cine audiovisual. Ser parte de esta red re permite acceder al
                banco de contenidos para exhibir obras cinematográficas
                ecuatorianas.
              </p>
            </div>
          </div>

          <div className={styles.actionBar}>
            <Button
              variant="secondary"
              onClick={handleRegisterSpace}
              className={styles.registerButton}
            >
              <span className={styles.buttonIcon}>+</span>
              Registrar Nuevo Espacio
            </Button>
          </div>

          <div className={styles.spacesSection}>
            <div className={styles.sectionHeader}>
              <h2 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📍</span>
                Mis Espacios Registrados
              </h2>
              <div className={styles.spacesCount}>
                {spaces.length} {spaces.length === 1 ? "espacio" : "espacios"}
              </div>
            </div>

            {loadingSpaces ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>⏳</div>
                <h3 className={styles.emptyTitle}>Cargando espacios...</h3>
              </div>
            ) : spaces.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>🏢</div>
                <h3 className={styles.emptyTitle}>
                  No tienes espacios registrados
                </h3>
                <p className={styles.emptyText}>
                  Comienza a registrar tus espacios y accede a beneficios.
                </p>
                <Button
                  variant="secondary"
                  onClick={handleRegisterSpace}
                  className={styles.emptyButton}
                >
                  Registrar mi primer espacio
                </Button>
              </div>
            ) : (
              <div className={styles.spacesGrid}>
                {spaces.map((space) => (
                  <div key={space.id} className={styles.spaceCard}>
                    <div className={styles.cardHeader}>
                      <div className={styles.cardIcon}>🎥</div>
                      <div
                        className={`${styles.cardBadge} ${
                          space.status === SpaceStatus.VERIFIED
                            ? styles.approved
                            : space.status === SpaceStatus.UNDER_REVIEW
                              ? styles.underReview
                              : space.status === SpaceStatus.PENDING
                                ? styles.pending
                                : styles.rejected
                        }`}
                      >
                        {space.status === SpaceStatus.VERIFIED
                          ? "Aprobado"
                          : space.status === SpaceStatus.UNDER_REVIEW
                            ? "Bajo Revisión"
                            : space.status === SpaceStatus.PENDING
                              ? "Pendiente"
                              : "Rechazado"}
                      </div>
                    </div>
                    {!space.contractId && (
                      <div className={styles.warningBanner}>
                        ⚠️ Falta firma del acuerdo REA
                      </div>
                    )}
                    <h3 className={styles.cardTitle}>{space.name}</h3>
                    <p className={styles.cardDescription}>
                      {space.description || "Sin descripción"}
                    </p>
                    <div className={styles.cardInfo}>
                      <span>
                        📍 {space.city}, {space.province}
                      </span>
                      <span>👥 Capacidad: {space.capacity}</span>
                    </div>
                    <div className={styles.cardFooter}>
                      <Button
                        variant="primary"
                        className={styles.cardButton}
                        onClick={() => handleViewDetails(space)}
                        disabled={space.status === SpaceStatus.UNDER_REVIEW}
                      >
                        {!space.contractId
                          ? "Completar Registro"
                          : space.status === SpaceStatus.PENDING
                            ? "Ver Observaciones"
                            : "Ver detalles"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
