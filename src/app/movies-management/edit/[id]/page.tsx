"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { movieService } from "@/features/movies"
import { MovieForm } from "@/app/admin/movies/MovieForm"

type MovieDetail = Parameters<typeof MovieForm>[0]["initialMovie"]

export default function UserEditMoviePage() {
  const params = useParams()
  const movieId = useMemo(() => {
    const raw = params?.id
    const value = Array.isArray(raw) ? raw[0] : raw
    if (!value) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }, [params])

  const [movie, setMovie] = useState<MovieDetail>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (movieId === null) {
      return
    }

    let isActive = true

    movieService
      .getById(movieId)
      .then((data) => {
        if (!isActive) return
        setMovie(data as MovieDetail)
      })
      .catch(() => {
        if (!isActive) return
        setError("No se pudo cargar la película")
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [movieId])

  if (movieId === null) {
    return <div style={{ padding: "24px" }}>ID de película no válido</div>
  }

  if (isLoading) {
    return <div style={{ padding: "24px" }}>Cargando película...</div>
  }

  if (error) {
    return <div style={{ padding: "24px" }}>{error}</div>
  }

  return <MovieForm initialMovie={movie} movieId={movieId ?? undefined} mode="user" />
}
