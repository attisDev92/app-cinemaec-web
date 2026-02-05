import { useEffect, useState } from "react"
import { catalogService } from "@/features/catalog"
import type { Country } from "@/features/catalog"

export function useCountries() {
  const [countries, setCountries] = useState<Country[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setIsLoading(true)
        const data = await catalogService.getCountries()
        setCountries(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los países"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCountries()
  }, [])

  return { countries, isLoading, error }
}
