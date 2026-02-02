"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { movieService, MovieManagementTable } from "@/features/movies"
import { Navbar } from "@/shared/components/Navbar"
import { UserRole } from "@/shared/types"
import { Movie } from "@/features/movies/types"
import styles from "./page.module.css"

export default function MoviesAdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [movies, setMovies] = useState<Movie[]>([])
  const [moviesLoading, setMoviesLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"list" | "create">("list")

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && user.role !== UserRole.ADMIN) {
        router.push("/home")
      } else {
        loadMovies()
      }
    }
  }, [isAuthenticated, isLoading, user, router])

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

  const handleDeleteMovie = async (id: number) => {
    try {
      await movieService.delete(id)
    } catch (err) {
      console.error("Error deleting movie:", err)
      throw err
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

  if (!isAuthenticated || (user && user.role !== UserRole.ADMIN)) {
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
            className={styles.tab}
            onClick={() => router.push("/admin/movies")}
          >
            Crear Nueva Película
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.tabContent}>
          <MovieManagementTable
            movies={movies}
            isLoading={moviesLoading}
            onRefresh={loadMovies}
            onDelete={handleDeleteMovie}
          />
        </div>
      </div>
    </div>
  )
}
