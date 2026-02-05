import { useEffect, useState } from "react"
import { platformsService } from "@/features/platforms"
import type { PlatformListItem } from "@/features/platforms"

export function usePlatforms() {
  const [platforms, setPlatforms] = useState<PlatformListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setIsLoading(true)
        const data = await platformsService.getAll()
        setPlatforms(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar las plataformas"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlatforms()
  }, [])

  return { platforms, isLoading, error }
}
