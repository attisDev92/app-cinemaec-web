import { useEffect, useState, useCallback } from "react"
import { professionalsService } from "@/features/professionals"
import type { Professional } from "@/features/professionals"

export function useProfessionals() {
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProfessionals = async () => {
      try {
        setIsLoading(true)
        const data = await professionalsService.getAll()
        setProfessionals(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los profesionales"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfessionals()
  }, [])

  const addProfessional = useCallback((newProfessional: Professional) => {
    setProfessionals(prev => [...prev, newProfessional])
  }, [])

  return { professionals, isLoading, error, addProfessional }
}
