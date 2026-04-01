"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card } from "@/shared/components/ui"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { UserRole } from "@/shared/types"
import { movieService } from "@/features/movies/services/movie.service"
import type { Movie } from "@/features/movies/types"
import styles from "./page.module.css"

type MovieProfessionalRelation = {
  cinematicRole?: { id?: number }
  professional?: { name?: string }
}

type MovieWithRelations = Movie & {
  professionals?: MovieProfessionalRelation[]
  contacts?: Array<{ name?: string; role?: string }>
}

export default function ContentBankCatalogPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [movies, setMovies] = useState<MovieWithRelations[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    } else if (!isLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    } else if (
      !isLoading &&
      user &&
      user.hasProfile &&
      !user.hasUploadedAgreement
    ) {
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
        setError(null)
        const allMovies = (await movieService.getAll()) as MovieWithRelations[]
        setMovies(Array.isArray(allMovies) ? allMovies : [])
      } catch {
        setMovies([])
        setError("No se pudo cargar el catálogo de películas.")
      } finally {
        setLoadingMovies(false)
      }
    }

    if (!isLoading && user) {
      fetchMovies()
    }
  }, [user, isLoading])

  const publishedMovies = useMemo(
    () => movies.filter((movie) => movie?.isPublishedToCatalog === true),
    [movies],
  )

  const getDirectorNames = (movie: MovieWithRelations) => {
    const roleDirectors =
      movie.professionals
        ?.filter((entry) => entry?.cinematicRole?.id === 1)
        .map((entry) => entry?.professional?.fullName)
        .filter(Boolean) || []

    const contactDirectors =
      movie.contacts
        ?.filter((contact) =>
          (contact?.role || "").toLowerCase().includes("director"),
        )
        .map((contact) => contact?.name)
        .filter(Boolean) || []

    const merged = Array.from(new Set([...roleDirectors, ...contactDirectors]))
    return merged.length ? merged.join(", ") : "No disponible"
  }

  const getProducerNames = (movie: MovieWithRelations) => {
    const roleProducers =
      movie.professionals
        ?.filter((entry) => entry?.cinematicRole?.id === 2)
        .map((entry) => entry?.professional?.fullName)
        .filter(Boolean) || []

    const contactProducers =
      movie.contacts
        ?.filter((contact) =>
          (contact?.role || "").toLowerCase().includes("productor"),
        )
        .map((contact) => contact?.name)
        .filter(Boolean) || []

    const merged = Array.from(new Set([...roleProducers, ...contactProducers]))
    return merged.length ? merged.join(", ") : "No disponible"
  }

  if (isLoading || !user) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>Catálogo de Películas</h1>
          <p className={styles.subtitle}>
            Explora el Banco de Contenidos y revisa información básica de cada
            obra.
          </p>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.actions}>
          <Button variant="secondary" onClick={() => router.push("/content-bank")}>
            ← Volver a Banco de Contenidos
          </Button>
        </div>

        {loadingMovies ? (
          <Card>
            <p className={styles.stateText}>Cargando películas...</p>
          </Card>
        ) : error ? (
          <Card>
            <p className={styles.errorText}>{error}</p>
          </Card>
        ) : publishedMovies.length === 0 ? (
          <Card>
            <p className={styles.stateText}>No hay películas disponibles en el catálogo.</p>
          </Card>
        ) : (
          <div className={styles.galleryGrid}>
            {publishedMovies.map((movie) => (
              <article key={movie.id} className={styles.movieCard}>
                <h2 className={styles.movieTitle}>{movie.title || "Sin título"}</h2>

                <div className={styles.metaList}>
                  <p>
                    <strong>Director:</strong> {getDirectorNames(movie)}
                  </p>
                  <p>
                    <strong>Productor:</strong> {getProducerNames(movie)}
                  </p>
                  <p>
                    <strong>Título:</strong> {movie.title || "No disponible"}
                  </p>
                </div>

                <p className={styles.synopsis}>
                  <strong>Sinópsis:</strong> {movie.synopsis || "No disponible"}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
