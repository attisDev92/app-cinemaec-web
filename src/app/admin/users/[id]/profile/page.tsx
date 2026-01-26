"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Navbar } from "@/shared/components/Navbar"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { PermissionEnum, UserRole } from "@/shared/types"
import { UserListItem } from "@/shared/types/user"
import { Profile } from "@/shared/types/profile"
import styles from "../../users.module.css"

interface UserProfileData {
  user: UserListItem
  profile: Profile | null
}

export default function UserProfilePage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.id as string
  const { user: authUser, isLoading: authLoading } = useAuth()
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Función para eliminar acuerdo
  const handleRemoveAgreement = async () => {
    if (!userData?.profile) return

    if (!window.confirm("¿Está seguro que desea eliminar el acuerdo firmado?")) {
      return
    }

    try {
      setActionLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profiles/${userData.profile.id}/agreement`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response.ok) {
        throw new Error("No se pudo eliminar el acuerdo")
      }

      const result = await response.json()
      setUserData({
        ...userData,
        profile: result.profile,
      })
      alert("Acuerdo eliminado exitosamente")
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al eliminar el acuerdo")
    } finally {
      setActionLoading(false)
    }
  }

  // Función para desactivar usuario
  const handleToggleUserStatus = async () => {
    if (!userData?.user) return

    const newStatus = !userData.user.isActive
    const message = newStatus
      ? "¿Está seguro que desea activar este usuario?"
      : "¿Está seguro que desea desactivar este usuario?"

    if (!window.confirm(message)) {
      return
    }

    try {
      setActionLoading(true)
      const token = localStorage.getItem("token")
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${userData.user.id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: newStatus }),
        },
      )

      if (!response.ok) {
        throw new Error("No se pudo actualizar el estado del usuario")
      }

      const updatedUser = await response.json()
      setUserData({
        ...userData,
        user: updatedUser,
      })
      const statusText = newStatus ? "activado" : "desactivado"
      alert(`Usuario ${statusText} exitosamente`)
    } catch (err) {
      alert(err instanceof Error ? err.message : "Error al actualizar el usuario")
    } finally {
      setActionLoading(false)
    }
  }

  // Verificar permisos
  const hasAdminUsersPermission =
    authUser?.role === UserRole.ADMIN &&
    authUser?.permissions?.includes(PermissionEnum.ADMIN_USERS)

  // Redirigir si no tienes el permiso requerido
  useEffect(() => {
    if (!authLoading && authUser) {
      if (!hasAdminUsersPermission) {
        router.push("/admin")
      }
    }
  }, [authUser, authLoading, router, hasAdminUsersPermission])

  // Obtener información del usuario y su perfil
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem("token")

        // Obtener datos del usuario
        const userResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!userResponse.ok) {
          throw new Error("No se pudo obtener los datos del usuario")
        }

        const user = await userResponse.json()

        // Obtener perfil si existe
        let profile = null
        if (user.profileId) {
          const profileResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/profiles/${user.profileId}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          if (profileResponse.ok) {
            profile = await profileResponse.json()
          }
        }

        setUserData({ user, profile })
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Error al cargar los datos",
        )
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading && hasAdminUsersPermission) {
      fetchUserData()
    }
  }, [userId, authLoading, hasAdminUsersPermission])

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando...</p>
          </div>
        </div>
      </>
    )
  }

  if (!authUser || !hasAdminUsersPermission) {
    return (
      <>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.error}>
            <h2>Acceso denegado</h2>
            <p>No tienes permisos para acceder a esta sección</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Perfil de Usuario</h1>
            <p className={styles.subtitle}>
              Visualiza los detalles del perfil del usuario
            </p>
          </div>
          <button
            className={styles.backBtn}
            onClick={() => router.push("/admin/users")}
          >
            ← Volver a Usuarios
          </button>
        </header>

        {error && (
          <div className={styles.alert} data-type="error">
            <span className={styles.alertIcon}>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Cargando perfil...</p>
          </div>
        ) : userData ? (
          <div className={styles.profileContainer}>
            {/* Información del Usuario */}
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>Información de la Cuenta</h2>
              <div className={styles.profileGrid}>
                <div className={styles.profileField}>
                  <label>ID</label>
                  <span>{userData.user.id}</span>
                </div>
                <div className={styles.profileField}>
                  <label>Email</label>
                  <span>{userData.user.email}</span>
                </div>
                <div className={styles.profileField}>
                  <label>Cédula</label>
                  <span>{userData.user.cedula}</span>
                </div>
                <div className={styles.profileField}>
                  <label>Estado</label>
                  <span
                    className={`${styles.statusBadge} ${
                      userData.user.isActive
                        ? styles.active
                        : styles.inactive
                    }`}
                  >
                    {userData.user.isActive ? "Activo" : "Inactivo"}
                  </span>
                </div>
                <div className={styles.profileField}>
                  <label>Rol</label>
                  <span>{userData.user.role}</span>
                </div>
                <div className={styles.profileField}>
                  <label>Último Acceso</label>
                  <span className={styles.date}>
                    {userData.user.lastLogin
                      ? new Date(userData.user.lastLogin).toLocaleDateString(
                          "es-EC",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          },
                        )
                      : "Nunca"}
                  </span>
                </div>
                <div className={styles.profileField}>
                  <label>Fecha de Registro</label>
                  <span className={styles.date}>
                    {new Date(userData.user.createdAt).toLocaleDateString(
                      "es-EC",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      },
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Información del Perfil */}
            {userData.profile ? (
              <div className={styles.profileSection}>
                <h2 className={styles.sectionTitle}>Información del Perfil</h2>
                <div className={styles.profileGrid}>
                  <div className={styles.profileField}>
                    <label>Nombre Completo</label>
                    <span>{userData.profile.fullName}</span>
                  </div>
                  {userData.profile.legalName && (
                    <div className={styles.profileField}>
                      <label>Nombre Legal</label>
                      <span>{userData.profile.legalName}</span>
                    </div>
                  )}
                  {userData.profile.tradeName && (
                    <div className={styles.profileField}>
                      <label>Nombre Comercial</label>
                      <span>{userData.profile.tradeName}</span>
                    </div>
                  )}
                  <div className={styles.profileField}>
                    <label>Estado Legal</label>
                    <span>{userData.profile.legalStatus}</span>
                  </div>
                  {userData.profile.birthdate && (
                    <div className={styles.profileField}>
                      <label>Fecha de Nacimiento</label>
                      <span className={styles.date}>
                        {new Date(userData.profile.birthdate).toLocaleDateString(
                          "es-EC",
                          {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  )}
                  {userData.profile.phone && (
                    <div className={styles.profileField}>
                      <label>Teléfono</label>
                      <span>{userData.profile.phone}</span>
                    </div>
                  )}
                  {userData.profile.province && (
                    <div className={styles.profileField}>
                      <label>Provincia</label>
                      <span>{userData.profile.province}</span>
                    </div>
                  )}
                  {userData.profile.city && (
                    <div className={styles.profileField}>
                      <label>Ciudad</label>
                      <span>{userData.profile.city}</span>
                    </div>
                  )}
                  {userData.profile.address && (
                    <div className={`${styles.profileField} ${styles.fullWidth}`}>
                      <label>Dirección</label>
                      <span>{userData.profile.address}</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.info}>
                <h3>ℹ️ Sin Perfil</h3>
                <p>Este usuario aún no ha completado su perfil.</p>
              </div>
            )}

            {/* Sección de Acciones */}
            <div className={styles.profileSection}>
              <h2 className={styles.sectionTitle}>⚙️ Acciones del Administrador</h2>
              <div className={styles.actionsGrid}>
                {userData.profile?.agreementDocumentId && (
                  <div className={styles.actionCard}>
                    <h3>📋 Media-Agreement</h3>
                    <p>Acuerdo de uso de medios electrónicos firmado por el usuario</p>
                    <div className={styles.actionButtons}>
                      <button
                        className={styles.btnPrimary}
                        onClick={async () => {
                          try {
                            const token = localStorage.getItem("token")
                            if (!userData.profile?.agreementDocumentId) return
                            const response = await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/assets/${userData.profile.agreementDocumentId}`,
                              {
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              },
                            )
                            if (response.ok) {
                              const asset = await response.json()
                              if (asset.url) {
                                window.open(asset.url, "_blank")
                              }
                            }
                          } catch {
                            alert("Error al obtener el documento")
                          }
                        }}
                        disabled={actionLoading}
                      >
                        👁️ Revisar Documento
                      </button>
                      <button
                        className={styles.btnDanger}
                        onClick={handleRemoveAgreement}
                        disabled={actionLoading}
                      >
                        🗑️ Eliminar Media-Agreement
                      </button>
                    </div>
                  </div>
                )}

                <div className={styles.actionCard}>
                  <h3>Estado del Usuario</h3>
                  <p>
                    Este usuario está actualmente{" "}
                    <strong>{userData.user.isActive ? "ACTIVO" : "INACTIVO"}</strong>
                  </p>
                  <div className={styles.actionButtons}>
                    <button
                      className={
                        userData.user.isActive
                          ? styles.btnWarning
                          : styles.btnSuccess
                      }
                      onClick={handleToggleUserStatus}
                      disabled={actionLoading}
                    >
                      {userData.user.isActive
                        ? "🔴 Desactivar Usuario"
                        : "🟢 Activar Usuario"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.error}>
            <h2>Usuario no encontrado</h2>
            <p>No se pudo cargar la información del usuario</p>
          </div>
        )}
      </div>
    </>
  )
}
