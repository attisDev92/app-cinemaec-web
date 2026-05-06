"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import { MovieCard } from "@/features/movies/components/MovieCard"
import type { Movie } from "@/features/movies/types"
import { assetService } from "@/features/assets/services/asset.service"
import {
  adminCatalogService,
} from "@/features/admin-catalogs/services/admin-catalog.service"
import type {
  AdminCatalog,
  CatalogFestival,
  CatalogMovie,
  CatalogProfessional,
} from "@/features/admin-catalogs/types"
import styles from "./page.module.css"

type CatalogTab = "movies" | "festivals" | "professionals"

const getAssetUrl = (asset?: { url?: string | null; id?: number | null } | null) => {
  if (!asset?.url) return null
  return assetService.getPublicAssetUrl({
    id: asset.id ?? 0,
    url: asset.url,
  } as Parameters<typeof assetService.getPublicAssetUrl>[0])
}

const initials = (value: string) =>
  value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("") || "--"

export default function PublicAdminCatalogDetailPage() {
  const params = useParams<{ id: string }>()
  const catalogId = Number(params.id)

  const [catalog, setCatalog] = useState<AdminCatalog | null>(null)
  const [activeTab, setActiveTab] = useState<CatalogTab>("movies")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCatalog = async () => {
      if (!Number.isFinite(catalogId)) {
        setError("ID de catálogo inválido")
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)
        const data = await adminCatalogService.getPublicById(catalogId)
        setCatalog(data)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo cargar el catálogo solicitado",
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadCatalog()
  }, [catalogId])

  const movies = useMemo(() => catalog?.movies || [], [catalog])
  const sortedMovies = useMemo(() => {
    const typeOrder: Record<string, number> = {
      largometraje: 0,
      cortometraje: 1,
    }

    const statusOrder: Record<string, number> = {
      desarrollo: 0,
      produccion: 1,
      postproduccion: 2,
      distribucion: 3,
    }

    const genreOrder: Record<string, number> = {
      documental: 0,
      ficcion: 1,
    }

    const normalize = (value?: string | null) =>
      String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()

    return [...movies].sort((a, b) => {
      const aType = typeOrder[normalize(a.type)] ?? Number.MAX_SAFE_INTEGER
      const bType = typeOrder[normalize(b.type)] ?? Number.MAX_SAFE_INTEGER
      if (aType !== bType) return aType - bType

      const aStatus =
        statusOrder[normalize(a.projectStatus)] ?? Number.MAX_SAFE_INTEGER
      const bStatus =
        statusOrder[normalize(b.projectStatus)] ?? Number.MAX_SAFE_INTEGER
      if (aStatus !== bStatus) return aStatus - bStatus

      const aGenre = genreOrder[normalize(a.genre)] ?? Number.MAX_SAFE_INTEGER
      const bGenre = genreOrder[normalize(b.genre)] ?? Number.MAX_SAFE_INTEGER
      if (aGenre !== bGenre) return aGenre - bGenre

      return (a.title || "").localeCompare(b.title || "", "es", {
        sensitivity: "base",
      })
    })
  }, [movies])
  const festivals = useMemo(() => catalog?.festivals || [], [catalog])
  const professionals = useMemo(() => catalog?.professionals || [], [catalog])

  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

      <main className={styles.main}>
        <Link href="/" className={styles.backLink}>
          ← Volver al inicio
        </Link>

        {isLoading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>
            <p>Cargando catálogo...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <p>⚠️ {error}</p>
          </div>
        )}

        {!isLoading && !error && catalog && (
          <>
            <header
              className={styles.header}
              style={
                getAssetUrl(catalog.imageAsset)
                  ? { backgroundImage: `url(${getAssetUrl(catalog.imageAsset)})` }
                  : undefined
              }
            >
              <div className={styles.headerOverlay}></div>
              <div className={styles.headerContent}>
                <h1 className={styles.title}>{catalog.name}</h1>
                <p className={styles.year}>{catalog.year}</p>
                {catalog.description && (
                  <p className={styles.description}>{catalog.description}</p>
                )}
              </div>
            </header>

            <nav className={styles.tabs}>
              <button
                className={`${styles.tab} ${
                  activeTab === "movies" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("movies")}
              >
                Películas ({movies.length})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "festivals" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("festivals")}
              >
                Festivales y muestras ({festivals.length})
              </button>
              <button
                className={`${styles.tab} ${
                  activeTab === "professionals" ? styles.tabActive : ""
                }`}
                onClick={() => setActiveTab("professionals")}
              >
                Profesionales ({professionals.length})
              </button>
            </nav>

            {activeTab === "movies" && (
              <section>
                {movies.length === 0 ? (
                  <div className={styles.emptyBox}>No hay películas relacionadas en este catálogo.</div>
                ) : (
                  <div className={styles.moviesGallery}>
                    {sortedMovies.map((movie) => (
                      <MovieCard key={movie.id} movie={movie as unknown as Movie} />
                    ))}
                  </div>
                )}
              </section>
            )}

            {activeTab === "festivals" && (
              <section>
                {festivals.length === 0 ? (
                  <div className={styles.emptyBox}>No hay festivales o muestras relacionados en este catálogo.</div>
                ) : (
                  <div className={styles.cardsGrid}>
                    {festivals.map((festival: CatalogFestival) => {
                      const posterUrl = getAssetUrl(festival.poster)
                      return (
                        <Link
                          key={festival.id}
                          href={`/public/festivals/${festival.id}`}
                          className={styles.entityCardLink}
                        >
                          <article className={styles.entityCard}>
                            <div className={styles.entityMedia}>
                              {posterUrl ? (
                                <img src={posterUrl} alt={festival.name} className={styles.entityImage} />
                              ) : (
                                <div className={styles.placeholder}>🎭</div>
                              )}
                            </div>
                            <div className={styles.entityBody}>
                              <h3>{festival.name}</h3>
                              {festival.firstEditionYear && (
                                <p className={styles.meta}>Desde {festival.firstEditionYear}</p>
                              )}
                              {festival.description && (
                                <p className={styles.snippet}>{festival.description}</p>
                              )}
                            </div>
                          </article>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            )}

            {activeTab === "professionals" && (
              <section>
                {professionals.length === 0 ? (
                  <div className={styles.emptyBox}>No hay profesionales relacionados en este catálogo.</div>
                ) : (
                  <div className={styles.cardsGrid}>
                    {professionals.map((professional: CatalogProfessional) => {
                      const photoUrl = getAssetUrl(professional.profilePhotoAsset)

                      return (
                        <Link
                          key={professional.id}
                          href={`/public/professionals/${professional.id}`}
                          className={styles.entityCardLink}
                        >
                          <article className={`${styles.entityCard} ${styles.professionalCard}`}>
                            <div className={`${styles.entityMedia} ${styles.professionalMedia}`}>
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={professional.name}
                                  className={`${styles.entityImage} ${styles.professionalImage}`}
                                />
                              ) : (
                                <div className={styles.placeholder}>{initials(professional.name)}</div>
                              )}
                            </div>
                            <div className={styles.entityBody}>
                              <h3>{professional.name}</h3>
                              {professional.bio && (
                                <p className={styles.snippet}>{professional.bio}</p>
                              )}
                            </div>
                          </article>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}
