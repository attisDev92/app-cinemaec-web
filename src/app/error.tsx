"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { Card, Button } from "@/shared/components/ui"
import styles from "./error.module.css"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log del error en consola para debugging
    console.error("Error capturado:", error)
  }, [error])

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.content}>
            <div className={styles.errorCode}>Error</div>

            <h1 className={styles.title}>Algo salió mal</h1>

            <p className={styles.description}>
              Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta
              nuevamente.
            </p>

            <div className={styles.illustration}>
              <svg
                className={styles.icon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {process.env.NODE_ENV === "development" && error.message && (
              <div className={styles.errorDetails}>
                <p className={styles.errorMessage}>
                  <strong>Detalles del error:</strong> {error.message}
                </p>
                {error.digest && (
                  <p className={styles.errorDigest}>
                    <strong>ID:</strong> {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className={styles.actions}>
              <Button onClick={() => reset()} variant="secondary">
                Intentar nuevamente
              </Button>

              <Link href="/">
                <Button variant="primary">Ir al inicio</Button>
              </Link>
            </div>

            <div className={styles.help}>
              <p className={styles.helpText}>
                Si el problema persiste, por favor contacta a soporte.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
