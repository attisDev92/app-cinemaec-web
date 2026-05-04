"use client"

import { useState } from "react"
import Link from "next/link"
import { festivalService } from "../services/festival.service"
import { Festival } from "../types"
import styles from "./FestivalManagementTable.module.css"

interface FestivalManagementTableProps {
  festivals: Festival[]
  isLoading: boolean
  onRefresh: () => Promise<void>
  onDelete: (id: number) => Promise<void>
}

export function FestivalManagementTable({
  festivals,
  isLoading,
  onRefresh,
  onDelete,
}: FestivalManagementTableProps) {
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set())
  const [togglingActiveIds, setTogglingActiveIds] = useState<Set<number>>(new Set())

  const handleDelete = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este festival?")) {
      return
    }

    setDeletingIds((prev) => new Set(prev).add(id))
    try {
      await onDelete(id)
      await onRefresh()
    } catch (error) {
      console.error("Error al eliminar festival:", error)
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleToggleActive = async (festival: Festival) => {
    setTogglingActiveIds((prev) => new Set(prev).add(festival.id))
    try {
      await festivalService.toggleActive(festival.id, !festival.isActive)
      await onRefresh()
    } catch (error) {
      console.error("Error al cambiar estado del festival:", error)
    } finally {
      setTogglingActiveIds((prev) => {
        const next = new Set(prev)
        next.delete(festival.id)
        return next
      })
    }
  }

  if (isLoading) {
    return <div className={styles.loading}>Cargando festivales...</div>
  }

  if (festivals.length === 0) {
    return <div className={styles.empty}>No hay festivales registrados</div>
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Tipo</th>
            <th>Clasificación</th>
            <th>Primera Edición</th>
            <th>Activo</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {festivals.map((festival) => (
            <tr
              key={festival.id}
              className={!festival.isActive ? styles.inactiveRow : ""}
            >
              <td className={styles.title}>{festival.name}</td>
              <td>{festival.type || "-"}</td>
              <td>{festival.classification || "-"}</td>
              <td>{festival.firstEditionYear || "-"}</td>
              <td>
                <button
                  onClick={() => handleToggleActive(festival)}
                  disabled={togglingActiveIds.has(festival.id)}
                  className={`${styles.toggleBtn} ${
                    festival.isActive ? styles.active : styles.inactive
                  }`}
                >
                  {togglingActiveIds.has(festival.id)
                    ? "..."
                    : festival.isActive
                      ? "Activo"
                      : "Desactivado"}
                </button>
              </td>
              <td className={styles.actions}>
                <Link
                  href={`/admin/festivals/${festival.id}`}
                  className={styles.editBtn}
                >
                  Editar
                </Link>
                <Link
                  href={`/public/festivals/${festival.id}`}
                  className={styles.viewBtn}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver
                </Link>
                <button
                  onClick={() => handleDelete(festival.id)}
                  disabled={deletingIds.has(festival.id)}
                  className={styles.deleteBtn}
                >
                  {deletingIds.has(festival.id) ? "Eliminando..." : "Eliminar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
