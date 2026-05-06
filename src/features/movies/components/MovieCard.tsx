"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Movie } from "../types"
import styles from "./MovieCard.module.css"

interface MovieCardProps {
  movie: Movie
}

interface MovieProfessionalLike {
  professional?: {
    fullName?: string
    name?: string
  }
  cinematicRole?: {
    id?: number
    name?: string
  }
  cinematicRoleId?: number
}

const renderCredits = (names: string[]) => {
  if (!names.length) return "No registrado"

  return (
    <span className={styles.creditNames}>
      {names.map((name) => (
        <span key={name} className={styles.creditNameItem}>
          {name}
        </span>
      ))}
    </span>
  )
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

  const normalize = (value?: string | null) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()

  const movieProfessionals = (movie.professionals || []) as MovieProfessionalLike[]
  const isDirector = (item: MovieProfessionalLike) => {
    const roleId = item.cinematicRoleId ?? item.cinematicRole?.id
    if (roleId === 1) return true
    const roleName = normalize(item.cinematicRole?.name)
    return roleName.includes("director") || roleName.includes("direccion")
  }

  const isProducer = (item: MovieProfessionalLike) => {
    const roleId = item.cinematicRoleId ?? item.cinematicRole?.id
    if (roleId === 2) return true
    const roleName = normalize(item.cinematicRole?.name)
    return (
      roleName.includes("productor") ||
      roleName.includes("produccion") ||
      roleName.includes("producer")
    )
  }

  const uniqueNames = (items: MovieProfessionalLike[]) =>
    Array.from(
      new Set(
        items
          .map((item) => item.professional?.fullName || item.professional?.name || "")
          .map((name) => name.trim())
          .filter(Boolean),
      ),
    )

  const directors = uniqueNames(movieProfessionals.filter(isDirector))
  const producers = uniqueNames(movieProfessionals.filter(isProducer))
  const movieType = (movie.type || "Sin tipo").trim()
  const movieGenre = (movie.genre || "Sin género").trim()

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

          <p className={styles.metaRow}>
            {movieType} · {movieGenre}
          </p>

          <p className={styles.creditLine}>
            <span className={styles.creditLabel}>Prod:</span>{" "}
            {renderCredits(producers)}
          </p>

          <p className={styles.creditLine}>
            <span className={styles.creditLabel}>Dir:</span>{" "}
            {renderCredits(directors)}
          </p>

          {/* Year */}
          <div className={styles.year}>{movie.releaseYear || "Año no disponible"}</div>
        </div>
      </div>
    </Link>
  )
}
