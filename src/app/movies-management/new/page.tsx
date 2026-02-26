"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { movieService } from "@/features/movies/services/movie.service"
import type { Movie } from "@/features/movies/types"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card, DocumentUpload, Input } from "@/shared/components/ui"
import { AssetOwnerEnum, AssetTypeEnum, UserRole } from "@/shared/types"
import styles from "./page.module.css"

export default function NewMovieGatePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  const [movies, setMovies] = useState<Movie[]>([])
  const [loadingMovies, setLoadingMovies] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null)
  const [supportDocumentAssetId, setSupportDocumentAssetId] = useState<number | null>(
    null,
  )
  const [supportDocumentUrl, setSupportDocumentUrl] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

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
      try {
        setLoadingMovies(true)
        const response = await movieService.getAll()
        setMovies(response)
      } catch {
        setMovies([])
      } finally {
        setLoadingMovies(false)
      }
    }

    fetchMovies()
  }, [])

  const filteredMovies = useMemo(() => {
    const normalized = searchTerm.trim().toLowerCase()
    if (!normalized) {
      return []
    }

    return movies
      .filter((movie) =>
        [movie.title, movie.titleEn, movie.synopsis]
          .filter(Boolean)
          .some((value) => value!.toLowerCase().includes(normalized)),
      )
      .slice(0, 12)
  }, [movies, searchTerm])

  const handleContinue = async () => {
    setError("")

    if (selectedMovie && !supportDocumentAssetId) {
      setError(
        "Debes subir un documento de respaldo para solicitar modificación de esta película.",
      )
      return
    }

    const query = new URLSearchParams()
    if (selectedMovie) {
      const supportDocId = supportDocumentAssetId
      if (!supportDocId) {
        setError(
          "Debes subir un documento de respaldo para solicitar modificación de esta película.",
        )
        return
      }

      try {
        setIsSubmitting(true)
        const claimRequest = await movieService.createClaimRequest({
          movieId: selectedMovie.id,
          supportDocumentAssetId: supportDocId,
        })

        query.set("existingMovieId", String(selectedMovie.id))
        query.set("supportDocumentAssetId", String(supportDocId))
        query.set("claimRequestId", String(claimRequest.id))
        query.set("requestSubmitted", "1")
      } catch (err) {
        const message =
          typeof err === "object" && err && "message" in err
            ? String((err as { message: string }).message)
            : "No se pudo registrar la solicitud de reclamo"
        setError(message)
        setIsSubmitting(false)
        return
      } finally {
        setIsSubmitting(false)
      }
    }

    const queryString = query.toString()
    router.push(
      queryString
        ? `/movies-management/new/register?${queryString}`
        : "/movies-management/new/register",
    )
  }

  if (isLoading) {
    return null
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.content}>
          <h1 className={styles.title}>Nueva película</h1>
          <p className={styles.subtitle}>
            Antes de registrar una película nueva, verifica si ya existe en el
            catálogo.
          </p>

          {error && <div className={styles.error}>{error}</div>}

          <Card>
            <h2 className={styles.sectionTitle}>1. Buscar película existente</h2>
            <Input
              label="Buscar por título"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Escribe el nombre de la película"
            />

            {loadingMovies ? (
              <p className={styles.helperText}>Cargando películas...</p>
            ) : !searchTerm.trim() ? null : filteredMovies.length === 0 ? (
              <p className={styles.helperText}>No se encontraron resultados.</p>
            ) : (
              <div className={styles.moviesList}>
                {filteredMovies.map((movie) => (
                  <button
                    key={movie.id}
                    type="button"
                    className={`${styles.movieItem} ${
                      selectedMovie?.id === movie.id ? styles.movieItemSelected : ""
                    }`}
                    onClick={() => {
                      setSelectedMovie(movie)
                      setSupportDocumentAssetId(null)
                      setSupportDocumentUrl(null)
                      setError("")
                    }}
                  >
                    <span className={styles.movieTitle}>{movie.title}</span>
                    <span className={styles.movieMeta}>
                      {movie.releaseYear || "Sin año"} • {movie.genre}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className={styles.noMatchBlock}>
              <Button
                type="button"
                variant="primary"
                onClick={() => router.push("/movies-management/new/register")}
              >
                Mi película no está registrada
              </Button>
            </div>
          </Card>

          {selectedMovie && (
            <Card>
              <h2 className={styles.sectionTitle}>2. Documento de respaldo</h2>
              <p className={styles.helperText}>
                Seleccionaste: <strong>{selectedMovie.title}</strong>. Para solicitar
                edición, sube un PDF que respalde que puedes modificar esta película.
              </p>

              <DocumentUpload
                label="Subir documento de respaldo (PDF)"
                documentType={AssetTypeEnum.DOCUMENT}
                ownerType={AssetOwnerEnum.MOVIE_DOSSIER}
                ownerId={selectedMovie.id}
                currentDocumentUrl={supportDocumentUrl || undefined}
                onUploadComplete={(id, url) => {
                  setSupportDocumentAssetId(id)
                  setSupportDocumentUrl(url)
                  setError("")
                }}
                onRemove={() => {
                  setSupportDocumentAssetId(null)
                  setSupportDocumentUrl(null)
                }}
              />
            </Card>
          )}

          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={() => router.push("/movies-management")}>
              Volver
            </Button>
            <Button type="button" onClick={handleContinue} isLoading={isSubmitting}>
              Continuar al formulario
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
