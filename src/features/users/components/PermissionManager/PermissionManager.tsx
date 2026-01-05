"use client"

import { useEffect, useState } from "react"
import { PermissionEnum, UserRole } from "@/shared/types"
import { useUserPermissions } from "../../hooks"
import styles from "./PermissionManager.module.css"

interface PermissionManagerProps {
  userId: number
  onClose?: () => void
}

// Mapeo de permisos a etiquetas legibles
const PERMISSION_LABELS: Record<PermissionEnum, string> = {
  [PermissionEnum.ADMIN_SPACES]: "Revisar Espacios",
  [PermissionEnum.ADMIN_MOVIES]: "Gestionar Películas",
  [PermissionEnum.APPROVE_MOVIES_REQUEST]: "Aprobar Solicitudes de Películas",
  [PermissionEnum.ADMIN_USERS]: "Gestionar Usuarios",
  [PermissionEnum.ASSIGN_ROLES]: "Asignar Roles",
  [PermissionEnum.VIEW_REPORTS]: "Ver Reportes",
  [PermissionEnum.EXPORT_DATA]: "Exportar Datos",
}

// Lista de todos los permisos disponibles
const ALL_PERMISSIONS = Object.values(PermissionEnum)

export function PermissionManager({ userId, onClose }: PermissionManagerProps) {
  const {
    user,
    loading,
    error,
    success,
    fetchUser,
    updatePermissions,
    updateRole,
  } = useUserPermissions()
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.USER)

  // Cargar usuario al montar
  useEffect(() => {
    fetchUser(userId)
  }, [userId, fetchUser])

  // Actualizar permisos seleccionados cuando se cargue el usuario
  useEffect(() => {
    if (user?.permissions) {
      setSelectedPermissions(user.permissions)
    }
    if (user?.role) {
      setSelectedRole(user.role)
    }
  }, [user])

  const handlePermissionToggle = (permission: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    )
  }

  const handleSave = async () => {
    // Si el rol cambió, usar updateRole que envía tanto rol como permisos
    if (selectedRole !== user?.role) {
      await updateRole(userId, selectedRole, selectedPermissions)
    } else {
      // Si solo cambiaron los permisos
      await updatePermissions(userId, selectedPermissions)
    }
  }

  const handleSelectAll = () => {
    setSelectedPermissions(ALL_PERMISSIONS)
  }

  const handleDeselectAll = () => {
    setSelectedPermissions([])
  }

  if (loading && !user) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Cargando usuario...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>No se pudo cargar el usuario</p>
          {onClose && (
            <button className={styles.btnSecondary} onClick={onClose}>
              Cerrar
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>Gestionar Permisos</h2>
          <p className={styles.subtitle}>
            Usuario: {user.email} ({user.cedula})
          </p>
          <span className={`${styles.badge} ${styles[user.role]}`}>
            {user.role.toUpperCase()}
          </span>
        </div>
        {onClose && (
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        )}
      </div>

      {error && (
        <div className={styles.alert} data-type="error">
          <span className={styles.alertIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className={styles.alert} data-type="success">
          <span className={styles.alertIcon}>✓</span>
          <span>Cambios guardados correctamente</span>
        </div>
      )}

      <div className={styles.roleSection}>
        <h3 className={styles.sectionTitle}>Rol del Usuario</h3>
        <div className={styles.roleSelector}>
          <label className={styles.roleOption}>
            <input
              type="radio"
              name="role"
              value={UserRole.USER}
              checked={selectedRole === UserRole.USER}
              onChange={() => setSelectedRole(UserRole.USER)}
              disabled={loading}
              className={styles.radioInput}
            />
            <div className={styles.roleInfo}>
              <span className={`${styles.badge} ${styles.user}`}>USER</span>
              <span className={styles.roleDescription}>
                Usuario regular sin acceso administrativo
              </span>
            </div>
          </label>

          <label className={styles.roleOption}>
            <input
              type="radio"
              name="role"
              value={UserRole.EDITOR}
              checked={selectedRole === UserRole.EDITOR}
              onChange={() => setSelectedRole(UserRole.EDITOR)}
              disabled={loading}
              className={styles.radioInput}
            />
            <div className={styles.roleInfo}>
              <span className={`${styles.badge} ${styles.editor}`}>EDITOR</span>
              <span className={styles.roleDescription}>
                Rol intermedio, sin permisos administrativos
              </span>
            </div>
          </label>

          <label className={styles.roleOption}>
            <input
              type="radio"
              name="role"
              value={UserRole.ADMIN}
              checked={selectedRole === UserRole.ADMIN}
              onChange={() => setSelectedRole(UserRole.ADMIN)}
              disabled={loading}
              className={styles.radioInput}
            />
            <div className={styles.roleInfo}>
              <span className={`${styles.badge} ${styles.admin}`}>ADMIN</span>
              <span className={styles.roleDescription}>
                Acceso completo con permisos específicos
              </span>
            </div>
          </label>
        </div>
      </div>

      {selectedRole !== UserRole.ADMIN && (
        <div className={styles.alert} data-type="warning">
          <span className={styles.alertIcon}>ℹ️</span>
          <span>
            Solo los usuarios con rol ADMIN pueden tener permisos asignados.
          </span>
        </div>
      )}

      <div className={styles.permissionsSection}>
        <h3 className={styles.sectionTitle}>Permisos Administrativos</h3>
        <div className={styles.actions}>
          <button
            className={styles.btnText}
            onClick={handleSelectAll}
            disabled={loading || selectedRole !== UserRole.ADMIN}
          >
            Seleccionar todos
          </button>
          <button
            className={styles.btnText}
            onClick={handleDeselectAll}
            disabled={loading || selectedRole !== UserRole.ADMIN}
          >
            Deseleccionar todos
          </button>
        </div>
      </div>

      <div className={styles.permissionsGrid}>
        {ALL_PERMISSIONS.map((permission) => (
          <label
            key={permission}
            className={`${styles.permissionCard} ${
              selectedPermissions.includes(permission) ? styles.selected : ""
            } ${selectedRole !== UserRole.ADMIN ? styles.disabled : ""}`}
          >
            <input
              type="checkbox"
              checked={selectedPermissions.includes(permission)}
              onChange={() => handlePermissionToggle(permission)}
              disabled={loading || selectedRole !== UserRole.ADMIN}
              className={styles.checkbox}
            />
            <div className={styles.permissionInfo}>
              <span className={styles.permissionLabel}>
                {PERMISSION_LABELS[permission as PermissionEnum]}
              </span>
              <span className={styles.permissionValue}>{permission}</span>
            </div>
          </label>
        ))}
      </div>

      <div className={styles.footer}>
        <button
          className={styles.btnPrimary}
          onClick={handleSave}
          disabled={
            loading ||
            (selectedRole === UserRole.ADMIN &&
              selectedPermissions.length === 0)
          }
        >
          {loading ? "Guardando..." : "Guardar Cambios"}
        </button>
        {onClose && (
          <button
            className={styles.btnSecondary}
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </button>
        )}
      </div>

      {selectedRole === UserRole.ADMIN && selectedPermissions.length === 0 && (
        <p className={styles.hint}>
          ⚠️ Los administradores deben tener al menos un permiso asignado
        </p>
      )}
    </div>
  )
}
