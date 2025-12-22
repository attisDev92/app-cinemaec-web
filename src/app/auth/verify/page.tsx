"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, Button } from "@/shared/components/ui"
import { apiClient } from "@/lib/api-client"
import styles from "./page.module.css"

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  )
  const [message, setMessage] = useState("")
  const token = searchParams.get("token")

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error")
        setMessage("Token de verificación no encontrado.")
        return
      }

      try {
        await apiClient.post(
          "/users/verify-email",
          { token },
          false, // Sin autenticación
        )

        setStatus("success")
        setMessage("¡Tu email ha sido verificado exitosamente!")

        // Redirigir al login después de 3 segundos
        setTimeout(() => {
          router.push("/login?verified=true")
        }, 3000)
      } catch (error) {
        setStatus("error")
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Error al verificar el email. El token puede haber expirado."
        setMessage(errorMessage)
      }
    }

    verifyEmail()
  }, [token, router])

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.content}>
            {status === "loading" && (
              <>
                <div className={styles.spinner}>
                  <div className={styles.spinnerCircle}></div>
                </div>
                <h1 className={styles.title}>Verificando tu email...</h1>
                <p className={styles.description}>
                  Por favor espera mientras validamos tu cuenta.
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className={styles.iconWrapper}>
                  <svg
                    className={styles.iconSuccess}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className={styles.title}>¡Email verificado!</h1>
                <p className={styles.description}>{message}</p>
                <p className={styles.redirect}>
                  Serás redirigido al inicio de sesión en unos segundos...
                </p>
                <div className={styles.actions}>
                  <Link href="/login?verified=true">
                    <Button variant="primary">Ir al inicio de sesión</Button>
                  </Link>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className={styles.iconWrapper}>
                  <svg
                    className={styles.iconError}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h1 className={styles.title}>Error de verificación</h1>
                <p className={styles.description}>{message}</p>
                <div className={styles.errorInfo}>
                  <p className={styles.errorText}>Esto puede ocurrir si:</p>
                  <ul className={styles.errorList}>
                    <li>El enlace ha expirado (válido por 24 horas)</li>
                    <li>El enlace ya fue utilizado</li>
                    <li>El token es inválido</li>
                  </ul>
                </div>
                <div className={styles.actions}>
                  <Link href="/register">
                    <Button variant="secondary">Registrarse nuevamente</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="primary">Ir al inicio de sesión</Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <Card>
              <div className={styles.content}>
                <div className={styles.spinner}>
                  <div className={styles.spinnerCircle}></div>
                </div>
                <h1 className={styles.title}>Cargando...</h1>
              </div>
            </Card>
          </div>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
