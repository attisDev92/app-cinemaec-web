"use client"

import { useState } from "react"
import Link from "next/link"
import { movieService } from "../services/movie.service"
import { Movie } from "../types"
import styles from "./MovieManagementTable.module.css"

interface MovieManagementTableProps {
  movies: Movie[]
  isLoading: boolean
  onRefresh: () => Promise<void>
  onDelete: (id: number) => Promise<void>
}

const PROJECT_STATUS_LABELS: Record<string, string> = {
  desarrollo: "Desarrollo",
  produccion: "Producción",
  post_produccion: "Post-Producción",
  distribucion: "Distribución",
  finalizado: "Finalizado",
}

const MOVIE_TYPE_LABELS: Record<string, string> = {
  Cortometraje: "Cortometraje",
  Mediometraje: "Mediometraje",
  Largometraje: "Largometraje",
  "Sin catalogar": "Sin catalogar",
}

export function MovieManagementTable({
  movies,
  isLoading,
  onRefresh,
  onDelete,
}: MovieManagementTableProps) {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta película?")) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(id))
    try {
      await onDelete(id)
      await onRefresh()
    } catch (error) {
      console.error("Error al eliminar película:", error)
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleToggleActive = async (id: number) => {
    setTogglingIds((prev) => new Set(prev).add(id))
    try {
      await movieService.toggleActive(id)
      await onRefresh()
    } catch (error) {
      console.error("Error al cambiar estado de película:", error)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando películas...</div>
  }

  if (movies.length === 0) {
    return <div className={styles.empty}>No hay películas registradas</div>
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Título</th>
            <th>Tipo</th>
            <th>Duración</th>
            <th>Estado de Proyecto</th>
            <th>Año de Lanzamiento</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie.id}
              className={!movie.isActive ? styles.inactiveRow : ""}
            >
              <td className={styles.title}>{movie.title}</td>
              <td>{MOVIE_TYPE_LABELS[movie.type] || movie.type}</td>
              <td>{movie.durationMinutes} min</td>
              <td>
                {PROJECT_STATUS_LABELS[movie.projectStatus] ||
                  movie.projectStatus}
              </td>
              <td>{movie.releaseYear}</td>
              <td>
                <button
                  onClick={() => handleToggleActive(movie.id)}
                  disabled={togglingIds.has(movie.id)}
                  className={`${styles.toggleBtn} ${
                    movie.isActive ? styles.active : styles.inactive
                  }`}
                >
                  {togglingIds.has(movie.id)
                    ? "..."
                    : movie.isActive
                      ? "Activo"
                      : "Desactivado"}
                </button>
              </td>
              <td className={styles.actions}>
                <Link
                  href={`/admin/movies/${movie.id}`}
                  className={styles.editBtn}
                >
                  Editar
                </Link>
                <button
                  onClick={() => handleDelete(movie.id)}
                  disabled={deletingIds.has(movie.id)}
                  className={styles.deleteBtn}
                >
                  {deletingIds.has(movie.id) ? "Eliminando..." : "Eliminar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
