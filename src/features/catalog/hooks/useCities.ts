import { useEffect, useState } from "react"
import { catalogService } from "@/features/catalog"
import type { City } from "@/features/catalog"

export function useCities() {
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setIsLoading(true)
        const data = await catalogService.getCities()
        setCities(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar las ciudades"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCities()
  }, [])

  return { cities, isLoading, error }
}
