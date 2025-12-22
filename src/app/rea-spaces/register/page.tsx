"use client"

import { Navbar } from "@/shared/components/Navbar"
import { RegisterSpaceForm } from "@/features/spaces/components/RegisterSpaceForm"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { UserRole } from "@/shared/types"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import styles from "./register-space.module.css"

export default function RegisterSpacePage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login?redirect=/rea-spaces/register")
        return
      }

      // Solo USER puede registrar espacios
      if (user.role !== UserRole.USER) {
        router.push("/rea-spaces")
      }
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>Cargando...</div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Registrar Nuevo Espacio REA</h1>
          <p className={styles.subtitle}>
            Completa el formulario para registrar tu espacio en la Red de
            Espacios Audiovisuales
          </p>
        </div>

        <RegisterSpaceForm />
      </main>
    </div>
  )
}
