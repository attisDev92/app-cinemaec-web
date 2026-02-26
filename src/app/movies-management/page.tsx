"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { UserRole } from "@/shared/types"
import {
  movieService,
  type MovieClaimRequestUserItem,
} from "@/features/movies/services/movie.service"
import type { Movie } from "@/features/movies/types"
import styles from "./page.module.css"

type MovieProfessionalRelation = {
  cinematicRole?: { id?: number }
  professional?: { name?: string }
}

type MovieCompanyRelation = {
  company?: { name?: string }
  participation?: string
}

type MovieLanguageRelation = {
  name?: string
}

type MovieCountryRelation = {
  name?: string
}

type MovieWithRelations = Movie & {
  professionals?: MovieProfessionalRelation[]
  companies?: MovieCompanyRelation[]
  languages?: Array<MovieLanguageRelation | string>
  country?: MovieCountryRelation
}

export default function MoviesManagementPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [movies, setMovies] = useState<Movie[]>([])
  const [claimRequests, setClaimRequests] = useState<MovieClaimRequestUserItem[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [loadingClaims, setLoadingClaims] = useState(true)
  const [activeTab, setActiveTab] = useState<"movies" | "claims">("movies")

  const claimStatusLabels: Record<
    MovieClaimRequestUserItem["status"],
    string
  > = {
    pending: "Pendiente",
    approved: "Aprobada",
    rejected: "Rechazada",
  }

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
    const fetchMovies = async () => {
      if (!user) {
        return
      }

      try {
        setLoadingMovies(true)
        const allMovies = await movieService.getAll()
        const myMovies = allMovies.filter((movie) => movie.ownerId === user.id)
        setMovies(myMovies)
      } catch {
        setMovies([])
      } finally {
        setLoadingMovies(false)
      }
    }

    const fetchClaimRequests = async () => {
      if (!user) {
        return
      }

      try {
        setLoadingClaims(true)
        const myClaimRequests = await movieService.getMyClaimRequests()
        setClaimRequests(myClaimRequests)
      } catch {
        setClaimRequests([])
      } finally {
        setLoadingClaims(false)
      }
    }

    if (!isLoading && user) {
      fetchMovies()
      fetchClaimRequests()
    }
  }, [user, isLoading])

  if (isLoading) {
    return null
  }

  if (user && user.role !== UserRole.USER && user.role !== UserRole.EDITOR) {
    return null
  }

  const handleDownloadTechnicalSheet = async (movieId: number) => {
    try {
      const movie =
        (await movieService.getById(movieId)) as unknown as MovieWithRelations
      const jsPdfModule = await import("jspdf")
      const jsPDF = jsPdfModule.jsPDF
      const pdf = new jsPDF()

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const marginX = 14
      const contentWidth = pageWidth - marginX * 2
      let cursorY = 18

      const ensureSpace = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - 16) {
          pdf.addPage()
          cursorY = 18
        }
      }

      const addHeader = () => {
        pdf.setFillColor(235, 0, 69)
        pdf.rect(0, 0, pageWidth, 30, "F")

        pdf.setTextColor(255, 255, 255)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(18)
        pdf.text("Ficha técnica del proyecto", marginX, 14)

        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        const generatedAt = new Date().toLocaleDateString("es-EC")
        pdf.text(`Generado: ${generatedAt}`, marginX, 22)

        cursorY = 38
      }

      const addSectionTitle = (title: string) => {
        ensureSpace(12)
        pdf.setTextColor(235, 0, 69)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text(title, marginX, cursorY)
        cursorY += 7
      }

      const addField = (label: string, value?: string | number | null) => {
        const printable =
          value === null || value === undefined || String(value).trim() === ""
            ? "-"
            : String(value)

        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(17, 24, 39)
        pdf.setFontSize(10)
        const labelText = `${label}:`
        const labelWidth = pdf.getTextWidth(labelText)

        const wrapped = pdf.splitTextToSize(
          printable,
          contentWidth - labelWidth - 4,
        ) as string[]

        ensureSpace(Math.max(6, wrapped.length * 5 + 1))
        pdf.text(labelText, marginX, cursorY)

        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(55, 65, 81)
        pdf.text(wrapped, marginX + labelWidth + 4, cursorY)
        cursorY += Math.max(6, wrapped.length * 5 + 1)
      }

      const addCard = (title: string, renderContent: () => void) => {
        ensureSpace(24)
        const startY = cursorY
        cursorY += 1
        addSectionTitle(title)
        renderContent()
        const cardHeight = Math.max(18, cursorY - startY + 4)

        pdf.setDrawColor(229, 231, 235)
        pdf.roundedRect(marginX - 2, startY - 2, contentWidth + 4, cardHeight, 2, 2, "S")
        cursorY += 4
      }

      addHeader()

      const directors =
        movie.professionals
          ?.filter((entry) => entry.cinematicRole?.id === 1)
          .map((entry) => entry.professional?.name)
          .filter(Boolean) || []

      const producers =
        movie.professionals
          ?.filter((entry) => entry.cinematicRole?.id === 2)
          .map((entry) => entry.professional?.name)
          .filter(Boolean) || []

      const companies =
        movie.companies
          ?.map((entry) => {
            const companyName = entry.company?.name || "Empresa"
            const participation = entry.participation || "participación"
            return `${companyName} (${participation})`
          })
          .filter(Boolean) || []

      const normalizedLanguages = (
        ((movie as unknown as { languages?: unknown[] }).languages ?? [])
          .map((language) =>
            typeof language === "string"
              ? language
              : (language as { name?: string })?.name || "",
          )
          .filter(Boolean)
      ).join(", ")

      addCard("Información general", () => {
        addField("Título", movie.title)
        addField("Título en inglés", movie.titleEn)
        addField("Tipo", movie.type)
        addField("Género", movie.genre)
        addField("Año", movie.releaseYear)
        addField("Duración", `${movie.durationMinutes || "-"} min`)
      })

      addCard("Clasificación y estado", () => {
        addField("Clasificación", movie.classification)
        addField("Estado del proyecto", movie.projectStatus)
        addField("Estado de registro", movie.status)
      })

      addCard("Equipo principal", () => {
        addField("Director(es)", directors.join(", ") || "-")
        addField("Productor(es)", producers.join(", ") || "-")
        addField("Empresas", companies.join(", ") || "-")
      })

      addCard("Datos complementarios", () => {
        addField("País", movie.country?.name)
        addField("Idiomas", normalizedLanguages || "-")
        addField("Sinopsis", movie.synopsis)
      })

      const footerText = `CINEMAEC • ${new Date().getFullYear()}`
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(9)
      pdf.setTextColor(107, 114, 128)
      pdf.text(footerText, marginX, pageHeight - 8)

      pdf.save(`ficha-tecnica-${movie.title || movie.id}.pdf`)
    } catch {
      alert("No se pudo generar la ficha técnica")
    }
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>
              <span className={styles.titleIcon}>🎬</span>
              Gestión de Películas
            </h1>
            <p className={styles.subtitle}>
              Consulta tus películas registradas y su estado dentro del sistema.
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.actionBar}>
            <button
              type="button"
              className={styles.createButton}
              onClick={() => router.push("/movies-management/new")}
            >
              + Agregar nueva película
            </button>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "movies" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("movies")}
            >
              Mis películas
            </button>
            <button
              type="button"
              className={`${styles.tabButton} ${
                activeTab === "claims" ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab("claims")}
            >
              Solicitudes
            </button>
          </div>

          {activeTab === "movies" ? (
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{movies.length}</span>
                <span className={styles.statLabel}>Total de películas</span>
              </div>
            </div>
          ) : (
            <div className={styles.statsRow}>
              <div className={styles.statCard}>
                <span className={styles.statValue}>{claimRequests.length}</span>
                <span className={styles.statLabel}>Total de solicitudes</span>
              </div>
            </div>
          )}

          {activeTab === "movies" ? (
            <div className={styles.moviesSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>🎞️</span>
                  Mis películas registradas
                </h2>
                <div className={styles.moviesCount}>
                  {movies.length} {movies.length === 1 ? "película" : "películas"}
                </div>
              </div>

              {loadingMovies ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>⏳</div>
                  <h3 className={styles.emptyTitle}>Cargando películas...</h3>
                </div>
              ) : movies.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>🎥</div>
                  <h3 className={styles.emptyTitle}>No tienes películas registradas</h3>
                  <p className={styles.emptyText}>
                    Tus próximas películas aparecerán aquí cuando se asignen a tu usuario.
                  </p>
                </div>
              ) : (
                <div className={styles.moviesGrid}>
                  {movies.map((movie) => (
                    <article key={movie.id} className={styles.movieCard}>
                      <h3 className={styles.cardTitle}>{movie.title}</h3>
                      <p className={styles.cardDescription}>
                        {movie.synopsis || "Sin sinopsis"}
                      </p>

                      <div className={styles.cardInfo}>
                        <span>{movie.type}</span>
                        <span>{movie.genre}</span>
                        <span>{movie.releaseYear || "Sin año"}</span>
                      </div>

                      <div className={styles.cardActions}>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          onClick={() => router.push(`/movies-management/${movie.id}`)}
                        >
                          Ver
                        </button>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          onClick={() =>
                            router.push(`/movies-management/edit/${movie.id}`)
                          }
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className={styles.cardActionButton}
                          onClick={() => handleDownloadTechnicalSheet(movie.id)}
                        >
                          Imprimir ficha técnica
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.moviesSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>📩</span>
                  Mis solicitudes
                </h2>
                <div className={styles.moviesCount}>
                  {claimRequests.length} {claimRequests.length === 1 ? "solicitud" : "solicitudes"}
                </div>
              </div>

              {loadingClaims ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>⏳</div>
                  <h3 className={styles.emptyTitle}>Cargando solicitudes...</h3>
                </div>
              ) : claimRequests.length === 0 ? (
                <div className={styles.emptyState}>
                  <div className={styles.emptyIcon}>📝</div>
                  <h3 className={styles.emptyTitle}>No tienes solicitudes</h3>
                  <p className={styles.emptyText}>
                    Cuando reclames una película, su estado aparecerá aquí.
                  </p>
                </div>
              ) : (
                <div className={styles.moviesGrid}>
                  {claimRequests.map((claimRequest) => (
                    <article key={claimRequest.id} className={styles.movieCard}>
                      <div className={styles.cardHeader}>
                        <span
                          className={`${styles.cardBadge} ${
                            claimRequest.status === "approved"
                              ? styles.approved
                              : claimRequest.status === "pending"
                                ? styles.pending
                                : styles.rejected
                          }`}
                        >
                          {claimStatusLabels[claimRequest.status]}
                        </span>
                      </div>

                      <h3 className={styles.cardTitle}>{claimRequest.movie.title}</h3>
                      <div className={styles.cardInfo}>
                        <span>{claimRequest.movie.type}</span>
                        <span>{claimRequest.movie.genre}</span>
                        <span>{claimRequest.movie.releaseYear || "Sin año"}</span>
                        <span>{new Date(claimRequest.createdAt).toLocaleDateString("es-EC")}</span>
                      </div>

                      {claimRequest.observation && (
                        <p className={styles.claimObservation}>
                          Observación: {claimRequest.observation}
                        </p>
                      )}

                      <a
                        href={claimRequest.supportDocument.url}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.documentLink}
                      >
                        Ver documento enviado
                      </a>
                    </article>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
