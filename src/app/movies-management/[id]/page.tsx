"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { Button, Card } from "@/shared/components/ui"
import { movieService } from "@/features/movies/services/movie.service"
import styles from "./page.module.css"

type MovieProfessionalRelation = {
  cinematicRole?: { id?: number }
  professional?: { name?: string }
}

type MovieCompanyRelation = {
  companyId?: number
  participation?: string
  company?: { name?: string }
}

type MovieProfileDetail = {
  id: number
  title?: string
  titleEn?: string | null
  type?: string
  genre?: string
  releaseYear?: number | null
  synopsis?: string
  durationMinutes?: number
  classification?: string
  projectStatus?: string
  status?: string
  country?: { name?: string }
  languages?: Array<{ name?: string }>
  professionals?: MovieProfessionalRelation[]
  companies?: MovieCompanyRelation[]
}

export default function MovieProjectProfilePage() {
  const params = useParams()
  const router = useRouter()
  const movieId = Number(Array.isArray(params?.id) ? params.id[0] : params?.id)
  const [movie, setMovie] = useState<MovieProfileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!movieId) {
      return
    }

    movieService
      .getById(movieId)
      .then((data) => setMovie(data as unknown as MovieProfileDetail))
      .catch(() => setError("No se pudo cargar la información del proyecto"))
      .finally(() => setLoading(false))
  }, [movieId])

  if (!movieId) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.content}>
            <Card>
              <p className={styles.error}>ID de película inválido</p>
            </Card>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.header}>
            <h1 className={styles.title}>Perfil del proyecto</h1>
            <Button type="button" variant="secondary" onClick={() => router.push("/movies-management")}>
              Volver
            </Button>
          </div>

          {loading ? (
            <Card>
              <p className={styles.text}>Cargando información del proyecto...</p>
            </Card>
          ) : error ? (
            <Card>
              <p className={styles.error}>{error}</p>
            </Card>
          ) : (
            <>
              <Card>
                <h2 className={styles.sectionTitle}>Información básica</h2>
                <p className={styles.text}><strong>Título:</strong> {movie?.title || "-"}</p>
                <p className={styles.text}><strong>Título en inglés:</strong> {movie?.titleEn || "-"}</p>
                <p className={styles.text}><strong>Tipo:</strong> {movie?.type || "-"}</p>
                <p className={styles.text}><strong>Género:</strong> {movie?.genre || "-"}</p>
                <p className={styles.text}><strong>Año:</strong> {movie?.releaseYear || "-"}</p>
                <p className={styles.text}><strong>Sinopsis:</strong> {movie?.synopsis || "-"}</p>
              </Card>

              <Card>
                <h2 className={styles.sectionTitle}>Dirección y Producción</h2>
                <p className={styles.text}>
                  <strong>Director(es):</strong>{" "}
                  {movie?.professionals
                    ?.filter((entry) => entry?.cinematicRole?.id === 1)
                    ?.map((entry) => entry?.professional?.name)
                    ?.filter(Boolean)
                    ?.join(", ") || "-"}
                </p>
                <p className={styles.text}>
                  <strong>Productor(es):</strong>{" "}
                  {movie?.professionals
                    ?.filter((entry) => entry?.cinematicRole?.id === 2)
                    ?.map((entry) => entry?.professional?.name)
                    ?.filter(Boolean)
                    ?.join(", ") || "-"}
                </p>
              </Card>

              <Card>
                <h2 className={styles.sectionTitle}>Empresas</h2>
                {movie?.companies?.length ? (
                  movie.companies.map((entry) => (
                    <p key={`${entry.companyId}-${entry.participation}`} className={styles.text}>
                      {entry?.company?.name || "Empresa"} ({entry?.participation || "participación"})
                    </p>
                  ))
                ) : (
                  <p className={styles.text}>No hay empresas registradas.</p>
                )}
              </Card>

              <Card>
                <h2 className={styles.sectionTitle}>Ficha técnica</h2>
                <p className={styles.text}><strong>Duración:</strong> {movie?.durationMinutes || "-"} min</p>
                <p className={styles.text}><strong>Clasificación:</strong> {movie?.classification || "-"}</p>
                <p className={styles.text}><strong>Estado del proyecto:</strong> {movie?.projectStatus || "-"}</p>
                <p className={styles.text}><strong>Estado enum:</strong> {movie?.status || "-"}</p>
                <p className={styles.text}><strong>País:</strong> {movie?.country?.name || "-"}</p>
                <p className={styles.text}>
                  <strong>Idiomas:</strong>{" "}
                  {movie?.languages?.map((language) => language?.name).filter(Boolean).join(", ") || "-"}
                </p>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}
