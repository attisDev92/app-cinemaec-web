"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { Space, SpaceStatus } from "@/shared/types"
import { spaceService } from "@/features/spaces/services/space.service"
import { RegisterSpaceForm } from "@/features/spaces/components/RegisterSpaceForm"
import type { SpaceReview } from "@/features/spaces/types/space"
import styles from "./edit-space.module.css"

export default function EditSpacePage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading } = useAuth()
  const spaceId = Number(params?.id)

  const [space, setSpace] = useState<Space | null>(null)
  const [reviews, setReviews] = useState<SpaceReview[]>([])
  const [loading, setLoading] = useState(true)

  // Cargar espacio y reviews
  useEffect(() => {
    if (!user || !spaceId) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const [spaceData, reviewsData] = await Promise.all([
          spaceService.getSpaceById(spaceId),
          spaceService.getReviews(spaceId),
        ])

        // Validar que el espacio pertenece al usuario
        if (spaceData.userId !== user.id) {
          router.push("/rea-spaces")
          return
        }

        setSpace(spaceData)
        setReviews(reviewsData)
      } catch (error) {
        console.error("Error al cargar datos:", error)
        router.push("/rea-spaces")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, spaceId, router])

  if (isLoading || loading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>Cargando espacio...</div>
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

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <button className={styles.backButton} onClick={() => router.back()}>
            ← Volver
          </button>
          <h1 className={styles.title}>Editar Espacio REA</h1>
        </div>

        <div className={styles.info}>
          <p>
            Puedes actualizar tu espacio en cualquier momento. Si editas, el
            estado cambiará a &quot;Bajo revisión&quot; hasta que el equipo
            verifique los nuevos cambios.
          </p>
        </div>

        <RegisterSpaceForm
          spaceToEdit={space}
          observedIssues={
            reviews.filter((r) => !r.resolved).pop()?.issues || []
          }
        />
      </div>
    </>
  )
}
