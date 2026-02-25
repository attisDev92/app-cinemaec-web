import { useState, useEffect } from "react"
import { catalogService } from "../services/catalog.service"
import type { RoleCategory } from "@/features/catalog"

export function useRoleCategories() {
  const [categories, setCategories] = useState<RoleCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        const data = await catalogService.getRoleCategories()
        setCategories(data)
      } catch (err) {
        setError("Error al cargar las categorías de roles")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
