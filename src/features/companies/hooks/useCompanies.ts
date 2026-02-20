import { useEffect, useState, useCallback } from "react"
import { companiesService } from "@/features/companies"
import type { CompanyListItem } from "@/features/companies"

export function useCompanies() {
  const [companies, setCompanies] = useState<CompanyListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setIsLoading(true)
        const data = await companiesService.getAll()
        setCompanies(data)
        setError(null)
      } catch (err) {
        const message =
          (err as { message?: string })?.message ||
          "No se pudieron cargar las empresas"
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  const addCompany = useCallback((newCompany: CompanyListItem) => {
    setCompanies(prev => [...prev, newCompany])
  }, [])

  return { companies, isLoading, error, addCompany }
}
