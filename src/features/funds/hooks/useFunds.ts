import { useEffect, useState } from "react"
import { fundsService } from "@/features/funds"
import type { FundListItem } from "@/features/funds"

export function useFunds() {
  const [funds, setFunds] = useState<FundListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFunds = async () => {
      try {
        setIsLoading(true)
        const data = await fundsService.getAll()
        setFunds(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar los fondos"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFunds()
  }, [])

  return { funds, isLoading, error }
}
