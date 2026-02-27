"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Formik, Form } from "formik"
import { useAuth } from "@/features/auth/hooks"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import styles from "./page.module.css"
import { loginValidationSchema } from "@/features/auth/lib/validations/logion-schema.yup"

export default function LoginClientPage() {
  const { login } = useAuth()
  const [error, setError] = useState("")
  const [sessionExpiredMsg, setSessionExpiredMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("session") === "expired") {
      setSessionExpiredMsg(
        "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
      )
    }

    if (searchParams.get("verified") === "true") {
      setSuccessMsg("¡Email verificado exitosamente! Ya puedes iniciar sesión.")
    }
  }, [searchParams])

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setError("")
    setSessionExpiredMsg("")
    setSuccessMsg("")

    try {
      await login(values.email, values.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.header}>
            <h2 className={styles.title}>Iniciar Sesión</h2>
            <p className={styles.subtitle}>Accede a tu cuenta de CinemaEC</p>
          </div>

          <Formik
            initialValues={{
              email: "",
              password: "",
            }}
            validationSchema={loginValidationSchema}
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
                {successMsg && (
                  <div className={styles.success}>{successMsg}</div>
                )}
                {sessionExpiredMsg && (
                  <div className={styles.warning}>{sessionExpiredMsg}</div>
                )}
                {error && <div className={styles.error}>{error}</div>}

                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="tu@email.com"
                  autoComplete="username"
                  error={
                    touched.email && errors.email ? errors.email : undefined
                  }
                  required
                />

                <Input
                  label="Contraseña"
                  type="password"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  error={
                    touched.password && errors.password
                      ? errors.password
                      : undefined
                  }
                  required
                />

                <div className={styles.forgotPassword}>
                  <div>
                    <Link href="/forgot-password" className={styles.link}>
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                </div>

                <Button
                  type="submit"
                  style={{ width: "100%" }}
                  isLoading={isSubmitting}
                >
                  Iniciar Sesión
                </Button>
              </Form>
            )}
          </Formik>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className={styles.footerLink}>
                Regístrate aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
