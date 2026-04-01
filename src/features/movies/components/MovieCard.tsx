"use client"

import Link from "next/link"
import Image from "next/image"
import { Movie } from "../types"
import styles from "./MovieCard.module.css"

interface MovieCardProps {
  movie: Movie
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  desarrollo: {
    color: "#3b82f6",
    label: "En Desarrollo",
  },
  produccion: {
    color: "#f59e0b",
    label: "En Producción",
  },
  postproduccion: {
    color: "#8b5cf6",
    label: "Post-Producción",
  },
  distribucion: {
    color: "#06b6d4",
    label: "Distribución",
  },
  finalizado: {
    color: "#10b981",
    label: "Finalizado",
  },
}

export function MovieCard({ movie }: MovieCardProps) {
  const statusConfig =
    STATUS_CONFIG[movie.projectStatus as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.desarrollo

  // Obtener directores y productores
  const directors =
    (movie.professionals?.length ?? 0) > 0
      ? movie.professionals
          ?.filter((p) => p.cinematicRoleId === 1)
          ?.map((p) => p.professional?.fullName || "Desconocido")
          ?.slice(0, 2)
      : []

  const producers =
    (movie.professionals?.length ?? 0) > 0
      ? movie.professionals
          ?.filter((p) => p.cinematicRoleId === 2)
          ?.map((p) => p.professional?.fullName || "Desconocido")
          ?.slice(0, 2)
      : []

  return (
    <Link href={`/public/catalog/${movie.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        {/* Poster */}
        <div className={styles.posterContainer}>
          {movie.posterAsset?.url ? (
            <Image
              src={movie.posterAsset.url}
              alt={movie.title}
              fill
              className={styles.poster}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                const img = e.target as HTMLImageElement
                img.style.display = "none"
              }}
            />
          ) : null}
          <div className={styles.posterPlaceholder}>
            <span>🎬</span>
          </div>
        </div>

        {/* Status Badge */}
        <div
          className={styles.statusBadge}
          style={{ backgroundColor: statusConfig.color }}
        >
          {statusConfig.label}
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>{movie.title}</h3>

          {/* Country */}
          <p className={styles.country}>
            {movie.country?.name || "País desconocido"}
          </p>

          {/* Directors */}
          {directors && directors.length > 0 && (
            <div className={styles.info}>
              <span className={styles.label}>Director/a:</span>
              <p className={styles.value}>{directors.join(", ")}</p>
            </div>
          )}

          {/* Producers */}
          {producers && producers.length > 0 && (
            <div className={styles.info}>
              <span className={styles.label}>Productor/a:</span>
              <p className={styles.value}>{producers.join(", ")}</p>
            </div>
          )}

          {/* Year */}
          {movie.releaseYear && (
            <div className={styles.year}>{movie.releaseYear}</div>
          )}
        </div>
      </div>
    </Link>
  )
}
