import { useEffect, useState } from "react"
import { catalogService } from "@/features/catalog"
import type { SubGenre } from "@/features/catalog"

export function useSubGenres() {
  const [subGenres, setSubGenres] = useState<SubGenre[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubGenres = async () => {
      try {
        setIsLoading(true)
        const data = await catalogService.getSubGenres()
        setSubGenres(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los subgéneros"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubGenres()
  }, [])

  return { subGenres, isLoading, error }
}
