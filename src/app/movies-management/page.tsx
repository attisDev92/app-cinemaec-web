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
import { assetService } from "@/features/assets/services/asset.service"
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

      const paintPageBackground = () => {
        pdf.setFillColor(255, 255, 255)
        pdf.rect(0, 0, pageWidth, pageHeight, "F")
      }

      paintPageBackground()

      const loadImageAsDataUrl = async (src: string): Promise<string | null> => {
        try {
          const response = await fetch(src)
          if (!response.ok) return null
          const blob = await response.blob()
          return await new Promise((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve((reader.result as string) || null)
            reader.onerror = () => resolve(null)
            reader.readAsDataURL(blob)
          })
        } catch {
          return null
        }
      }

      const loadImageWithSize = async (
        src: string,
      ): Promise<{ dataUrl: string; width: number; height: number } | null> => {
        try {
          return await new Promise((resolve) => {
            const image = new window.Image()
            image.onload = () => {
              const canvas = document.createElement("canvas")
              canvas.width = image.width
              canvas.height = image.height
              const context = canvas.getContext("2d")

              if (!context) {
                resolve(null)
                return
              }

              context.drawImage(image, 0, 0)
              resolve({
                dataUrl: canvas.toDataURL("image/png"),
                width: image.width,
                height: image.height,
              })
            }
            image.onerror = () => resolve(null)
            image.src = src
          })
        } catch {
          return null
        }
      }

      const toProxyImageUrl = (url: string) =>
        `/api/image-proxy?url=${encodeURIComponent(url)}`

      const ensureSpace = (neededHeight: number) => {
        if (cursorY + neededHeight > pageHeight - 16) {
          pdf.addPage()
          paintPageBackground()
          cursorY = 18
        }
      }

      const addHeader = async () => {
        const [hazBlueR, hazBlueG, hazBlueB] = [15, 53, 84]
        const [hazVioletR, hazVioletG, hazVioletB] = [109, 45, 143]

        pdf.setFillColor(248, 250, 252)
        pdf.rect(0, 0, pageWidth, 40, "F")
        pdf.setFillColor(hazBlueR, hazBlueG, hazBlueB)
        pdf.rect(0, 0, pageWidth, 7, "F")
        pdf.setFillColor(hazVioletR, hazVioletG, hazVioletB)
        pdf.rect(0, 33, pageWidth, 7, "F")

        const iccaLogo = await loadImageWithSize("/images/logos/logo icca.png")
        const hazLogo = await loadImageWithSize(
          "/images/logos/hazcine-horizontal-oscuro1.png",
        )

        if (iccaLogo) {
          const maxW = 52
          const maxH = 20
          const ratio = iccaLogo.width / iccaLogo.height
          let w = maxW
          let h = w / ratio
          if (h > maxH) {
            h = maxH
            w = h * ratio
          }
          pdf.addImage(iccaLogo.dataUrl, "PNG", marginX, 10 + (maxH - h) / 2, w, h)
        }

        if (hazLogo) {
          const maxW = 54
          const maxH = 22
          const ratio = hazLogo.width / hazLogo.height
          let w = maxW
          let h = w / ratio
          if (h > maxH) {
            h = maxH
            w = h * ratio
          }
          pdf.addImage(
            hazLogo.dataUrl,
            "PNG",
            pageWidth - marginX - w,
            9 + (maxH - h) / 2,
            w,
            h,
          )
        }

        pdf.setTextColor(hazBlueR, hazBlueG, hazBlueB)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(18)
        pdf.text(movie.title || "Ficha técnica del proyecto", marginX, 50)

        pdf.setTextColor(107, 114, 128)
        pdf.setFont("helvetica", "normal")
        pdf.setFontSize(10)
        pdf.text(`Generado: ${new Date().toLocaleDateString("es-EC")}`, marginX, 56)

        cursorY = 64
      }

      const addSectionTitle = (title: string) => {
        ensureSpace(12)
        pdf.setTextColor(109, 45, 143)
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(12)
        pdf.text(title, marginX, cursorY)
        cursorY += 7
      }

      const addField = (
        label: string,
        value?: string | number | null,
        options?: { maxLines?: number },
      ) => {
        const printable =
          value === null || value === undefined || String(value).trim() === ""
            ? "-"
            : String(value)

        pdf.setFont("helvetica", "bold")
        pdf.setTextColor(17, 24, 39)
        pdf.setFontSize(10)
        const labelText = `${label}:`
        const labelWidth = pdf.getTextWidth(labelText)

        let wrapped = pdf.splitTextToSize(
          printable,
          contentWidth - labelWidth - 4,
        ) as string[]

        if (options?.maxLines && wrapped.length > options.maxLines) {
          wrapped = wrapped.slice(0, options.maxLines)
          const last = wrapped[wrapped.length - 1] || ""
          wrapped[wrapped.length - 1] = `${last.slice(0, Math.max(0, last.length - 3))}...`
        }

        ensureSpace(Math.max(6, wrapped.length * 5 + 1))
        pdf.text(labelText, marginX, cursorY)

        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(55, 65, 81)
        pdf.text(wrapped, marginX + labelWidth + 4, cursorY)
        cursorY += Math.max(6, wrapped.length * 5 + 1)
      }

      const addCard = (title: string, renderContent: () => void) => {
        ensureSpace(20)
        const startY = cursorY
        cursorY += 1
        addSectionTitle(title)
        renderContent()
        const cardHeight = Math.max(16, cursorY - startY + 3)

        pdf.setDrawColor(229, 231, 235)
        pdf.roundedRect(marginX - 2, startY - 2, contentWidth + 4, cardHeight, 2, 2, "S")
        cursorY += 3
      }

      await addHeader()

      let posterUrl: string | null = null
      if (movie.posterAssetId) {
        try {
          const posterAsset = await assetService.getAsset(movie.posterAssetId)
          const publicPosterUrl = assetService.getPublicAssetUrl(posterAsset)
          posterUrl = toProxyImageUrl(publicPosterUrl)
        } catch {
          posterUrl = null
        }
      }

      const posterDataUrl = posterUrl ? await loadImageAsDataUrl(posterUrl) : null

      const posterX = marginX
      const posterY = cursorY
      const posterW = 48
      const posterH = 62

      pdf.setDrawColor(209, 213, 219)
      pdf.roundedRect(posterX, posterY, posterW, posterH, 2, 2, "S")
      if (posterDataUrl) {
        const imageMeta = await loadImageWithSize(posterDataUrl)
        if (imageMeta) {
          const ratio = imageMeta.width / imageMeta.height
          let drawW = posterW - 2
          let drawH = drawW / ratio
          if (drawH > posterH - 2) {
            drawH = posterH - 2
            drawW = drawH * ratio
          }
          pdf.addImage(
            imageMeta.dataUrl,
            "PNG",
            posterX + (posterW - drawW) / 2,
            posterY + (posterH - drawH) / 2,
            drawW,
            drawH,
          )
        }
      } else {
        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(9)
        pdf.setTextColor(107, 114, 128)
        pdf.text("SIN AFICHE", posterX + posterW / 2, posterY + posterH / 2, {
          align: "center",
        })
      }

      const summaryX = posterX + posterW + 8
      const summaryW = pageWidth - marginX - summaryX
      let summaryY = posterY + 3

      const addSummaryLine = (label: string, value?: string | number | null) => {
        const printable =
          value === null || value === undefined || String(value).trim() === ""
            ? "-"
            : String(value)

        pdf.setFont("helvetica", "bold")
        pdf.setFontSize(10)
        pdf.setTextColor(17, 24, 39)
        pdf.text(`${label}:`, summaryX, summaryY)

        const labelWidth = pdf.getTextWidth(`${label}:`)
        const wrapped = pdf.splitTextToSize(printable, summaryW - labelWidth - 4)
        pdf.setFont("helvetica", "normal")
        pdf.setTextColor(55, 65, 81)
        pdf.text(wrapped, summaryX + labelWidth + 4, summaryY)
        summaryY += Math.max(6, wrapped.length * 4.5)
      }

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

      const contactDirectors =
        (movie as unknown as { contacts?: Array<{ name?: string; role?: string }> })
          .contacts
          ?.filter((contact) =>
            (contact.role || "").toLowerCase().includes("director"),
          )
          .map((contact) => contact.name)
          .filter(Boolean) || []

      const contactProducers =
        (movie as unknown as { contacts?: Array<{ name?: string; role?: string }> })
          .contacts
          ?.filter((contact) =>
            (contact.role || "").toLowerCase().includes("productor"),
          )
          .map((contact) => contact.name)
          .filter(Boolean) || []

      const mergedDirectors = Array.from(new Set([...directors, ...contactDirectors]))
      const mergedProducers = Array.from(new Set([...producers, ...contactProducers]))

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

      addSummaryLine("Director", mergedDirectors.join(", ") || "-")
      addSummaryLine("Productor", mergedProducers.join(", ") || "-")
      addSummaryLine("Empresa productora", companies.join(", ") || "-")
      addSummaryLine("Duración", `${movie.durationMinutes || "-"} min`)
      addSummaryLine("Tipo", movie.type)
      addSummaryLine("Género", movie.genre)
      addSummaryLine("Año", movie.releaseYear)

      cursorY = Math.max(posterY + posterH + 8, summaryY + 2)

      addCard("Proyecto", () => {
        addField("Clasificación", movie.classification)
        addField("Estado del proyecto", movie.projectStatus)
        addField("Estado de registro", movie.status)
        addField("País", movie.country?.name)
        addField("Idiomas", normalizedLanguages || "-")
      })

      addCard("Sinopsis y necesidades", () => {
        addField("Sinopsis", movie.synopsis, { maxLines: 4 })
        addField("Sinopsis (inglés)", movie.synopsisEn, { maxLines: 4 })
        addField("¿Qué necesita el proyecto?", movie.projectNeed, { maxLines: 3 })
        addField("Project needs (EN)", movie.projectNeedEn, { maxLines: 3 })
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
