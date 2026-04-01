"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/shared/components/Navbar"
import { PublicMenu } from "@/shared/components/PublicMenu"
import { MovieCard } from "@/features/movies/components/MovieCard"
import { publicMovieService } from "@/features/movies/services/movie.service"
import { Movie } from "@/features/movies/types"
import styles from "./page.module.css"

export default function CatalogPage() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const data = await publicMovieService.getPublicCatalog()
        setMovies(data)
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar películas"
        )
        console.error("Error loading public catalog:", err)
      } finally {
        setIsLoading(false)
      }
    }

    loadMovies()
  }, [])

  return (
    <div className={styles.container}>
      <Navbar />
      <PublicMenu />

      <main className={styles.main}>
        <div className={styles.header}>
          <Link href="/" className={styles.backLink}>
            ← Volver al inicio
          </Link>
          <h1 className={styles.title}>Catálogo de Proyectos</h1>
          <p className={styles.subtitle}>
            Descubre todos los proyectos audiovisuales ecuatorianos en desarrollo
          </p>
        </div>

        {isLoading && (
          <div className={styles.loadingBox}>
            <div className={styles.spinner}></div>
            <p>Cargando películas...</p>
          </div>
        )}

        {error && (
          <div className={styles.errorBox}>
            <p className={styles.errorText}>⚠️ {error}</p>
          </div>
        )}

        {!isLoading && !error && movies.length === 0 && (
          <div className={styles.emptyBox}>
            <p className={styles.emptyText}>
              No hay películas publicadas en el catálogo en este momento.
            </p>
            <p className={styles.emptySubtext}>
              Vuelve pronto para ver nuevo contenido.
            </p>
          </div>
        )}

        {!isLoading && !error && movies.length > 0 && (
          <>
            <div className={styles.gallery}>
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}
