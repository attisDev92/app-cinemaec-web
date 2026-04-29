"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Movie } from "../types"
import styles from "./MovieCard.module.css"

interface MovieCardProps {
  movie: Movie
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  desarrollo: {
    color: "#FF9500",
    label: "Desarrollo",
  },
  produccion: {
    color: "#007AFF",
    label: "Producción",
  },
  postproduccion: {
    color: "#5856D6",
    label: "Postproducción",
  },
  distribucion: {
    color: "#34C759",
    label: "Distribución",
  },
  finalizado: {
    color: "#00B894",
    label: "Finalizado",
  },
}

export function MovieCard({ movie }: MovieCardProps) {
  const [posterError, setPosterError] = useState(false)
  const statusConfig =
    STATUS_CONFIG[movie.projectStatus as keyof typeof STATUS_CONFIG] ||
    STATUS_CONFIG.desarrollo

  const hasPoster = Boolean(movie.posterAsset?.url) && !posterError

  return (
    <Link href={`/public/movies/${movie.id}`} className={styles.cardLink}>
      <div className={styles.card}>
        {/* Poster */}
        <div className={styles.posterContainer}>
          {hasPoster ? (
            <Image
              src={movie.posterAsset?.url || ""}
              alt={movie.title}
              fill
              className={styles.poster}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={() => setPosterError(true)}
            />
          ) : null}
          {!hasPoster && (
            <div className={styles.posterPlaceholder}>
              <span>🎬</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div
          className={styles.statusBadge}
          style={{ "--status-color": statusConfig.color } as React.CSSProperties}
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

          {/* Year */}
          <div className={styles.year}>{movie.releaseYear || "Año no disponible"}</div>
        </div>
      </div>
    </Link>
  )
}
