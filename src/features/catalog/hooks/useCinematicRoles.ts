import { useEffect, useState } from "react"
import { catalogService } from "@/features/catalog"
import type { CinematicRole } from "@/features/catalog"

export function useCinematicRoles() {
  const [roles, setRoles] = useState<CinematicRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setIsLoading(true)
        const data = await catalogService.getCinematicRoles()
        setRoles(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los roles"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRoles()
  }, [])

  return { roles, isLoading, error }
}
