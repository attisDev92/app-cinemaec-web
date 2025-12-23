"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button } from "@/shared/components/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Space, SpaceStatus } from "@/shared/types"
import { spaceService } from "@/features/spaces/services/space.service"
import { getFieldLabel } from "@/features/spaces/lib/fieldLabels"
import type { SpaceReview } from "@/features/spaces/types/space"
import styles from "./observations.module.css"

export default function SpaceObservationsPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  const spaceId = Number(params?.id)

  const [space, setSpace] = useState<Space | null>(null)
  const [reviews, setReviews] = useState<SpaceReview[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar espacio y revisiones
  useEffect(() => {
    if (!user || !spaceId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [spaceData, reviewsData] = await Promise.all([
          spaceService.getSpaceById(spaceId),
          spaceService.getReviews(spaceId),
        ])

        setSpace(spaceData)
        setReviews(reviewsData)

        // Redirigir si el espacio no está PENDING
        if (spaceData.status !== SpaceStatus.PENDING) {
          router.push(`/rea-spaces/${spaceId}`)
        }
      } catch (error) {
        console.error("Error al cargar datos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, spaceId, router])

  const handleEditSpace = () => {
    router.push(`/rea-spaces/${spaceId}/edit`)
  }

  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Cargando...</div>
        </div>
      </>
    )
  }

  if (!space) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>Espacio no encontrado</div>
        </div>
      </>
    )
  }

  const lastReview = reviews.length > 0 ? reviews[reviews.length - 1] : null
  const fieldIssues = lastReview?.issues || []

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Volver
          </button>
          <h1 className={styles.title}>{space.name}</h1>
          <div className={styles.statusBadge}>Pendiente de Cambios</div>
        </div>

        <div className={styles.content}>
          {/* Mensaje principal */}
          <div className={styles.alertBox}>
            <div className={styles.alertIcon}>📋</div>
            <div className={styles.alertContent}>
              <h2>Cambios Solicitados</h2>
              <p>
                El administrador ha solicitado cambios en tu espacio. Revisa las
                observaciones a continuación y edita los campos indicados.
              </p>
            </div>
          </div>

          {/* Observaciones */}
          {lastReview && (
            <div className={styles.reviewSection}>
              <h2 className={styles.sectionTitle}>Observaciones del Admin</h2>

              {/* Comentario general */}
              {lastReview.generalComment && (
                <div className={styles.generalCommentBox}>
                  <h3>Comentario General</h3>
                  <p>{lastReview.generalComment}</p>
                </div>
              )}

              {/* Observaciones por campo */}
              {fieldIssues.length > 0 ? (
                <div className={styles.issuesContainer}>
                  <h3>Campos a Corregir ({fieldIssues.length})</h3>
                  <div className={styles.issuesList}>
                    {fieldIssues.map((issue, index) => (
                      <div key={index} className={styles.issueItem}>
                        <div className={styles.issueIndicator}>⚠️</div>
                        <div className={styles.issueContent}>
                          <h4 className={styles.issueField}>
                            {getFieldLabel(issue.field)}
                          </h4>
                          <p className={styles.issueComment}>{issue.comment}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.noIssues}>
                  <p>No hay observaciones específicas de campos.</p>
                </div>
              )}

              <div className={styles.reviewFooter}>
                <p className={styles.reviewDate}>
                  Revisión del{" "}
                  {new Date(lastReview.createdAt).toLocaleDateString("es-EC", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
          )}

          {/* Botón de acción */}
          <div className={styles.actions}>
            <Button variant="primary" onClick={handleEditSpace}>
              ✏️ Editar Espacio
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
