"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import {
  movieService,
  MovieManagementTable,
  type MovieClaimRequestAdminItem,
} from "@/features/movies"
import { Navbar } from "@/shared/components/Navbar"
import { PermissionEnum, UserRole } from "@/shared/types"
import { Movie } from "@/features/movies/types"
import styles from "./page.module.css"

export default function MoviesAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [claimRequests, setClaimRequests] = useState<MovieClaimRequestAdminItem[]>([])
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [claimsLoading, setClaimsLoading] = useState(true)
  const [claimDecisionLoadingId, setClaimDecisionLoadingId] = useState<number | null>(null)
  const [claimObservations, setClaimObservations] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "claims" | "create">("list")

  const hasMoviesAdminPermission = hasPermission(PermissionEnum.ADMIN_MOVIES)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && (user.role !== UserRole.ADMIN || !hasMoviesAdminPermission)) {
        router.push("/home")
      } else {
        loadMovies()
        loadClaimRequests()
      }
    }
  }, [isAuthenticated, isLoading, user, router, hasMoviesAdminPermission])

  const loadMovies = async () => {
    try {
      setMoviesLoading(true)
      setError(null)
      const data = await movieService.getAll()
      setMovies(data)
    } catch (err) {
      console.error("Error loading movies:", err)
      setError("Error al cargar las películas")
    } finally {
      setMoviesLoading(false)
    }
  }

  const loadClaimRequests = async () => {
    try {
      setClaimsLoading(true)
      setError(null)
      const data = await movieService.getAdminClaimRequests()
      setClaimRequests(data)
    } catch (err) {
      console.error("Error loading claim requests:", err)
      setError("Error al cargar las solicitudes de reclamo")
    } finally {
      setClaimsLoading(false)
    }
  }

  const handleDeleteMovie = async (id: number) => {
    try {
      await movieService.delete(id)
    } catch (err) {
      console.error("Error deleting movie:", err)
      throw err
    }
  }

  const handleReviewClaimRequest = async (
    claimRequestId: number,
    status: "approved" | "rejected",
  ) => {
    try {
      setClaimDecisionLoadingId(claimRequestId)
      setError(null)
      const observation = claimObservations[claimRequestId]?.trim() || undefined

      await movieService.reviewClaimRequest(claimRequestId, {
        status,
        observation,
      })

      await loadClaimRequests()
    } catch (err) {
      console.error("Error reviewing claim request:", err)
      setError("Error al procesar la solicitud")
    } finally {
      setClaimDecisionLoadingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.loadingMessage}>Cargando...</div>
        </div>
      </div>
    )
  }

  if (
    !isAuthenticated ||
    (user && (user.role !== UserRole.ADMIN || !hasMoviesAdminPermission))
  ) {
    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.main}>
          <div className={styles.errorMessage}>
            No tienes permiso para acceder a esta página
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.header}>
          <h1>Administración de Películas</h1>
          <p>Gestiona todas las películas registradas en el sistema</p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === "list" ? styles.active : ""}`}
            onClick={() => setActiveTab("list")}
          >
            Lista de Películas ({movies.length})
          </button>
          <button
            className={`${styles.tab} ${activeTab === "claims" ? styles.active : ""}`}
            onClick={() => setActiveTab("claims")}
          >
            Solicitudes ({claimRequests.length})
          </button>
          <button
            className={styles.tab}
            onClick={() => router.push("/admin/movies")}
          >
            Crear Nueva Película
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.tabContent}>
          {activeTab === "list" && (
            <MovieManagementTable
              movies={movies}
              isLoading={moviesLoading}
              onRefresh={loadMovies}
              onDelete={handleDeleteMovie}
            />
          )}

          {activeTab === "claims" && (
            <div>
              {claimsLoading ? (
                <div className={styles.loadingMessage}>Cargando solicitudes...</div>
              ) : claimRequests.length === 0 ? (
                <div className={styles.emptyClaims}>No hay solicitudes de reclamo</div>
              ) : (
                <div className={styles.claimsTableWrapper}>
                  <table className={styles.claimsTable}>
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Película</th>
                        <th>Año</th>
                        <th>Solicitante</th>
                        <th>Estado</th>
                        <th>Documento</th>
                        <th>Observación</th>
                        <th>Acciones</th>
                        <th>Fecha</th>
                        <th>Revisado por</th>
                        <th>Fecha revisión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimRequests.map((claim) => (
                        <tr key={claim.id}>
                          <td>#{claim.id}</td>
                          <td>
                            <div className={styles.movieTitle}>{claim.movie.title}</div>
                            <div className={styles.movieMeta}>ID película: {claim.movie.id}</div>
                          </td>
                          <td>{claim.movie.releaseYear || "-"}</td>
                          <td>
                            <div className={styles.claimantEmail}>{claim.claimant.email}</div>
                            <div className={styles.movieMeta}>CI: {claim.claimant.cedula}</div>
                          </td>
                          <td>
                            <span className={`${styles.statusBadge} ${styles[`status_${claim.status}`]}`}>
                              {claim.status}
                            </span>
                          </td>
                          <td>
                            <a
                              href={claim.supportDocument.url}
                              target="_blank"
                              rel="noreferrer"
                              className={styles.documentLink}
                            >
                              Ver documento
                            </a>
                          </td>
                          <td>
                            <textarea
                              className={styles.observationInput}
                              value={claimObservations[claim.id] ?? claim.observation ?? ""}
                              onChange={(event) =>
                                setClaimObservations((prev) => ({
                                  ...prev,
                                  [claim.id]: event.target.value,
                                }))
                              }
                              placeholder="Agregar observación"
                              disabled={claim.status !== "pending" || claimDecisionLoadingId === claim.id}
                            />
                          </td>
                          <td>
                            {claim.status === "pending" ? (
                              <div className={styles.actionsCell}>
                                <button
                                  className={styles.approveButton}
                                  onClick={() =>
                                    handleReviewClaimRequest(claim.id, "approved")
                                  }
                                  disabled={claimDecisionLoadingId === claim.id}
                                >
                                  Aceptar
                                </button>
                                <button
                                  className={styles.rejectButton}
                                  onClick={() =>
                                    handleReviewClaimRequest(claim.id, "rejected")
                                  }
                                  disabled={claimDecisionLoadingId === claim.id}
                                >
                                  Rechazar
                                </button>
                              </div>
                            ) : (
                              <span className={styles.reviewedText}>Revisada</span>
                            )}
                          </td>
                          <td>{new Date(claim.createdAt).toLocaleDateString("es-EC")}</td>
                          <td>
                            {claim.reviewedByUser?.email || "-"}
                          </td>
                          <td>
                            {claim.reviewedAt
                              ? new Date(claim.reviewedAt).toLocaleDateString("es-EC")
                              : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
