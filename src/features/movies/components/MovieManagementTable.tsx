"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Movie, MovieStatus } from "../types"
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

const MOVIE_STATUS_LABELS: Record<MovieStatus, string> = {
  draft: "Borrador",
  in_review: "En Revisión",
  approved: "Aprobado",
  rejected: "Rechazado",
  archived: "Archivado",
}

const MOVIE_STATUS_COLORS: Record<MovieStatus, string> = {
  draft: "draft",
  in_review: "in-review",
  approved: "approved",
  rejected: "rejected",
  archived: "archived",
}

const MOVIE_TYPE_LABELS: Record<string, string> = {
  cortometraje: "Cortometraje",
  mediometraje: "Mediometraje",
  largometraje: "Largometraje",
}

export function MovieManagementTable({
  movies,
  isLoading,
  onRefresh,
  onDelete,
}: MovieManagementTableProps) {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())

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
            <th>Estado de Revisión</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {movies.map((movie) => (
            <tr
              key={movie.id}
              className={!movie.isActive ? styles.inactive : ""}
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
                <span
                  className={`${styles.status} ${styles[MOVIE_STATUS_COLORS[movie.status]]}`}
                >
                  {MOVIE_STATUS_LABELS[movie.status]}
                </span>
              </td>
              <td>
                <span
                  className={movie.isActive ? styles.active : styles.inactive}
                >
                  {movie.isActive ? "Sí" : "No"}
                </span>
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
