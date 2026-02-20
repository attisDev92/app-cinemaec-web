import { useEffect, useState, useCallback } from "react"
import { exhibitionSpacesService } from "@/features/exhibition-spaces"
import type { ExhibitionSpaceListItem } from "@/features/exhibition-spaces"

export function useExhibitionSpaces() {
  const [spaces, setSpaces] = useState<ExhibitionSpaceListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpaces = async () => {
      try {
        setIsLoading(true)
        const data = await exhibitionSpacesService.getAll()
        setSpaces(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los espacios de exhibición"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSpaces()
  }, [])

  const addSpace = useCallback((newSpace: ExhibitionSpaceListItem) => {
    setSpaces((prev) => [...prev, newSpace])
  }, [])

  return { spaces, isLoading, error, addSpace }
}
