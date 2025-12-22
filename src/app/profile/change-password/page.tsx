"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { userService } from "@/features/auth/services/auth.service"
import { Navbar } from "@/shared/components/Navbar"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import styles from "./page.module.css"

export default function ChangePasswordPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, isLoading, router])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!currentPassword) {
      newErrors.currentPassword = "La contraseña actual es requerida"
    }

    if (!newPassword) {
      newErrors.newPassword = "La nueva contraseña es requerida"
    } else if (newPassword.length < 6) {
      newErrors.newPassword = "La contraseña debe tener al menos 6 caracteres"
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden"
    }

    if (currentPassword === newPassword) {
      newErrors.newPassword =
        "La nueva contraseña debe ser diferente a la actual"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!validateForm()) {
      return
    }

    setIsUpdating(true)

    try {
      await userService.changePassword({
        currentPassword,
        newPassword,
      })

      setSuccess("Contraseña actualizada correctamente")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      setTimeout(() => {
        router.push("/profile")
      }, 2000)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al cambiar la contraseña",
      )
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingText}>Cargando...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />

      <div className={styles.content}>
        <div className={styles.header}>
          <Button
            onClick={() => router.push("/profile")}
            variant="secondary"
            className={styles.backButton}
          >
            ← Volver al perfil
          </Button>
        </div>

        <h1 className={styles.title}>Cambiar Contraseña</h1>

        <Card>
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div className={styles.error}>{error}</div>}

            {success && <div className={styles.success}>{success}</div>}

            <Input
              label="Contraseña Actual"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.currentPassword}
              required
            />

            <Input
              label="Nueva Contraseña"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.newPassword}
              required
            />

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
            />

            <div className={styles.buttonGroup}>
              <Button type="submit" isLoading={isUpdating}>
                Cambiar Contraseña
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/profile")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
