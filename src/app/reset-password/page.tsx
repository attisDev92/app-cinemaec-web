"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { authService } from "@/features/auth/services/auth.service"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import styles from "./page.module.css"

const resetPasswordSchema = Yup.object({
  password: Yup.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
})

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [token, setToken] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const tokenParam = searchParams.get("token")
    if (!tokenParam) {
      setError("Token inválido o no proporcionado")
    } else {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (
    values: { password: string; confirmPassword: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    if (!token) {
      setError("Token inválido")
      setSubmitting(false)
      return
    }

    setError("")

    try {
      await authService.resetPassword(token, values.password)
      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Error al restablecer la contraseña",
      )
    } finally {
      setSubmitting(false)
    }
  }

  if (!token && !error) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <Card>
            <div className={styles.loading}>Cargando...</div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.header}>
            <h2 className={styles.title}>Restablecer Contraseña</h2>
            <p className={styles.subtitle}>Ingresa tu nueva contraseña</p>
          </div>

          {success ? (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>¡Contraseña restablecida!</h3>
              <p className={styles.successMessage}>
                Tu contraseña ha sido actualizada exitosamente. Serás redirigido
                al inicio de sesión en unos segundos...
              </p>
              <Link href="/login" className={styles.backButton}>
                Ir al inicio de sesión
              </Link>
            </div>
          ) : (
            <Formik
              initialValues={{
                password: "",
                confirmPassword: "",
              }}
              validationSchema={resetPasswordSchema}
              onSubmit={handleSubmit}
            >
              {({
                values,
                errors,
                touched,
                handleChange,
                handleBlur,
                isSubmitting,
              }) => (
                <Form className={styles.form}>
                  {error && <div className={styles.error}>{error}</div>}

                  <Input
                    label="Nueva Contraseña"
                    type="password"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    error={
                      touched.password && errors.password
                        ? errors.password
                        : undefined
                    }
                    required
                  />

                  <Input
                    label="Confirmar Contraseña"
                    type="password"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="••••••••"
                    error={
                      touched.confirmPassword && errors.confirmPassword
                        ? errors.confirmPassword
                        : undefined
                    }
                    required
                  />

                  <Button
                    type="submit"
                    style={{ width: "100%" }}
                    isLoading={isSubmitting}
                    disabled={!token}
                  >
                    Restablecer Contraseña
                  </Button>
                </Form>
              )}
            </Formik>
          )}
        </Card>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <div className={styles.wrapper}>
            <Card>
              <div className={styles.loading}>Cargando...</div>
            </Card>
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
