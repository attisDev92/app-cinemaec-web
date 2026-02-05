import { useEffect, useState } from "react"
import { catalogService } from "@/features/catalog"
import type { Language } from "@/features/catalog"

export function useLanguages() {
  const [languages, setLanguages] = useState<Language[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setIsLoading(true)
        const data = await catalogService.getLanguages()
        setLanguages(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los idiomas"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLanguages()
  }, [])

  return { languages, isLoading, error }
}
