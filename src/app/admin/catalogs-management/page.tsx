"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth, usePermissions } from "@/features/auth/hooks"
import { PermissionEnum, UserRole } from "@/shared/types"
import { adminCatalogService, AdminCatalog } from "@/features/admin-catalogs"
import { assetService } from "@/features/assets/services/asset.service"
import styles from "@/features/admin-catalogs/admin-catalogs.module.css"

export default function AdminCatalogsManagementPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  const { hasPermission } = usePermissions()
  const [catalogs, setCatalogs] = useState<AdminCatalog[]>([])
  const [loadingCatalogs, setLoadingCatalogs] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const hasCatalogPermission = hasPermission(PermissionEnum.ADMIN_CATALOGS)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push("/login")
      } else if (user && (user.role !== UserRole.ADMIN || !hasCatalogPermission)) {
        router.push("/home")
      } else {
        void loadCatalogs()
      }
    }
  }, [isAuthenticated, isLoading, user, hasCatalogPermission, router])

  const loadCatalogs = async () => {
    try {
      setLoadingCatalogs(true)
      setError(null)
      const data = await adminCatalogService.getAll()
      setCatalogs(data)
    } catch (err) {
      console.error("Error loading catalogs:", err)
      setError("No se pudieron cargar los catálogos")
    } finally {
      setLoadingCatalogs(false)
    }
  }

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("¿Eliminar este catálogo?")
    if (!confirmed) return

    try {
      await adminCatalogService.delete(id)
      setCatalogs((prev) => prev.filter((item) => item.id !== id))
    } catch (err) {
      console.error("Error deleting catalog:", err)
      setError("No se pudo eliminar el catálogo")
    }
  }

  const handleToggleActive = async (catalog: AdminCatalog) => {
    try {
      const updated = await adminCatalogService.toggleActive(catalog.id, !catalog.isActive)
      setCatalogs((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      )
    } catch (err) {
      console.error("Error toggling catalog active state:", err)
      setError("No se pudo cambiar el estado del catálogo")
    }
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loadingMessage}>Cargando...</div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated || (user && (user.role !== UserRole.ADMIN || !hasCatalogPermission))) {
    return null
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Gestión de Catálogos</h1>
            <p className={styles.subtitle}>Crea y administra catálogos para el panel administrativo.</p>
          </div>
          <button
            className={`${styles.button} ${styles.primary}`}
            onClick={() => router.push("/admin/catalogs/new")}
          >
            Crear Catálogo
          </button>
        </div>

        <section className={styles.card}>
          {error && <p className={styles.error}>{error}</p>}

          {loadingCatalogs ? (
            <div className={styles.loadingMessage}>Cargando catálogos...</div>
          ) : catalogs.length === 0 ? (
            <div className={styles.emptyMessage}>Aún no hay catálogos registrados.</div>
          ) : (
            <div className={styles.grid}>
              {catalogs.map((catalog) => {
                const imageUrl = catalog.imageAsset?.url
                  ? assetService.getPublicAssetUrl(catalog.imageAsset)
                  : null

                return (
                  <article key={catalog.id} className={styles.catalogItem}>
                    {imageUrl ? (
                      <img src={imageUrl} alt={catalog.name} className={styles.thumb} />
                    ) : (
                      <div className={styles.placeholder}>Sin imagen</div>
                    )}
                    <h2 className={styles.itemTitle}>{catalog.name}</h2>
                    <p className={styles.itemMeta}>Año: {catalog.year}</p>
                    <p className={styles.itemMeta}>Image ID: {catalog.imageId}</p>
                    {catalog.description ? (
                      <p className={styles.itemMeta}>{catalog.description}</p>
                    ) : null}
                    <p className={styles.itemMeta}>
                      Estado:{" "}
                      <strong style={{ color: catalog.isActive ? "#0a7d4f" : "#b4233d" }}>
                        {catalog.isActive ? "Activo" : "Inactivo"}
                      </strong>
                    </p>

                    <div className={styles.actions}>
                      <button
                        className={`${styles.button} ${styles.secondary}`}
                        onClick={() => router.push(`/admin/catalogs/edit/${catalog.id}`)}
                      >
                        Editar
                      </button>
                      <button
                        className={`${styles.button}`}
                        style={{
                          background: catalog.isActive ? "#fff3cd" : "#d4edda",
                          color: catalog.isActive ? "#856404" : "#155724",
                        }}
                        onClick={() => void handleToggleActive(catalog)}
                      >
                        {catalog.isActive ? "Desactivar" : "Activar"}
                      </button>
                      <button
                        className={`${styles.button} ${styles.danger}`}
                        onClick={() => void handleDelete(catalog.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}
