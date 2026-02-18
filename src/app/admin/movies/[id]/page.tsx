"use client"

import { useEffect, useMemo, useState } from "react"
import type { ComponentProps } from "react"
import { useParams } from "next/navigation"
import { movieService } from "@/features/movies"
import { MovieForm } from "../page"

type MovieFormProps = ComponentProps<typeof MovieForm>

type MovieDetail = MovieFormProps["initialMovie"]

export default function EditMoviePage() {
  const params = useParams()
  const movieId = useMemo(() => {
    const raw = params?.id
    const value = Array.isArray(raw) ? raw[0] : raw
    if (!value) return null
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }, [params])
  const [movie, setMovie] = useState<MovieDetail | null>(null)
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
        setError("No se pudo cargar la pelicula")
      })
      .finally(() => {
        if (!isActive) return
        setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [movieId])

  if (movieId === null && !error) {
    return <div style={{ padding: "24px" }}>ID de pelicula no valido</div>
  }

  if (isLoading) {
    return <div style={{ padding: "24px" }}>Cargando pelicula...</div>
  }

  if (error) {
    return <div style={{ padding: "24px" }}>{error}</div>
  }

  return <MovieForm initialMovie={movie} movieId={movieId ?? undefined} />
}
