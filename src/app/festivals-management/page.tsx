"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { UserRole } from "@/shared/types"
import { festivalService } from "@/features/festivals/services/festival.service"
import type { Festival } from "@/features/festivals/types"
import styles from "./page.module.css"

export default function FestivalsManagementPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [festivals, setFestivals] = useState<Festival[]>([])
  const [loadingFestivals, setLoadingFestivals] = useState(true)
  const [activeTab, setActiveTab] = useState<"festivals" | "claims">("festivals")

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    } else if (!isLoading && user && user.hasProfile && !user.hasUploadedAgreement) {
      router.push("/media-agreement")
    } else if (
      !isLoading &&
      user &&
      user.role !== UserRole.USER &&
      user.role !== UserRole.EDITOR
    ) {
      router.push("/admin")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    const fetchFestivals = async () => {
      if (!user) return
      try {
        setLoadingFestivals(true)
        const allFestivals = await festivalService.getAll()
        // TODO: filter by user if needed
        setFestivals(allFestivals)
      } catch {
        setFestivals([])
      } finally {
        setLoadingFestivals(false)
      }
    }
    if (!isLoading && user) {
      fetchFestivals()
    }
  }, [user, isLoading])

  if (isLoading) return null
  if (user && user.role !== UserRole.USER && user.role !== UserRole.EDITOR) return null

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              Gestión de Festivales, Muestras y Proyectos
            </h1>
            <p className={styles.subtitle}>
              Consulta tus festivales registrados y su estado dentro del sistema.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.createButton}
              onClick={() => router.push("/festivals-management/edit/new")}
            >
              + Agregar nuevo festival
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "festivals" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("festivals")}
            >
              Mis festivales
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${activeTab === "claims" ? styles.tabButtonActive : ""}`}
              onClick={() => setActiveTab("claims")}
            >
              Solicitudes
            </button>
          </div>

          {activeTab === "festivals" ? (
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{festivals.length}</span>
                <span className={styles.statLabel}>Total de festivales</span>
              </div>
            </div>
          ) : (
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>0</span>
                <span className={styles.statLabel}>Total de solicitudes</span>
              </div>
            </div>
          )}

          {activeTab === "festivals" ? (
            <div className={styles.festivalsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>🎪</span>
                  Mis festivales registrados
                </h2>
                <div className={styles.festivalsCount}>
                  {festivals.length} {festivals.length === 1 ? "festival" : "festivales"}
                </div>
              </div>
              {loadingFestivals ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>⏳</div>
                  <h3 className={styles.emptyTitle}>Cargando festivales...</h3>
                </div>
              ) : festivals.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎪</div>
                  <h3 className={styles.emptyTitle}>No tienes festivales registrados</h3>
                  <p className={styles.emptyText}>
                    Tus próximos festivales aparecerán aquí cuando se asignen a tu usuario.
                  </p>
                </div>
              ) : (
                <div className={styles.festivalsGrid}>
                  {festivals.map((festival) => (
                    <article key={festival.id} className={styles.festivalCard}>
                      <h3 className={styles.cardTitle}>{festival.name}</h3>
                      <p className={styles.cardDescription}>
                        {festival.description || "Sin descripción"}
                      </p>
                      <div className={styles.cardInfo}>
                        <span>{festival.type}</span>
                        <span>{festival.firstEditionYear || "Sin año"}</span>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          onClick={() => router.push(`/public/festivals/${festival.id}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          onClick={() => router.push(`/festivals-management/edit/${festival.id}`)}
                        >
                          Editar
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.festivalsSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>📩</span>
                  Mis solicitudes
                </h2>
                <div className={styles.festivalsCount}>0 solicitudes</div>
              </div>
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>📝</div>
                <h3 className={styles.emptyTitle}>No tienes solicitudes</h3>
                <p className={styles.emptyText}>
                  Cuando reclames un festival, su estado aparecerá aquí.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
