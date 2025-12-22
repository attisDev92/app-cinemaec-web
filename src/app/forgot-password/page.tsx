"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Formik, Form } from "formik"
import * as Yup from "yup"
import { authService } from "@/features/auth/services/auth.service"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import styles from "./page.module.css"

const forgotPasswordSchema = Yup.object({
  email: Yup.string().email("Email inválido").required("El email es requerido"),
})

export default function ForgotPasswordPage() {
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (
    values: { email: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setError("")
    setSuccess(false)

    try {
      const response = await authService.forgotPassword(values.email)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar el correo")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.header}>
            <h2 className={styles.title}>Recuperar Contraseña</h2>
            <p className={styles.subtitle}>
              Ingresa tu email y te enviaremos un enlace para restablecer tu
              contraseña
            </p>
          </div>

          {success ? (
            <div className={styles.successContainer}>
              <div className={styles.successIcon}>✓</div>
              <h3 className={styles.successTitle}>¡Solicitud enviada!</h3>
              <p className={styles.successMessage}>
                Si el email existe, recibirás un enlace para restablecer tu
                contraseña. Por favor revisa tu bandeja de entrada y sigue las
                instrucciones.
              </p>
              <p className={styles.successNote}>
                Si no recibes el correo en unos minutos, revisa tu carpeta de
                spam.
              </p>
              <Link href="/login" className={styles.backButton}>
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <>
              <Formik
                initialValues={{
                  email: "",
                }}
                validationSchema={forgotPasswordSchema}
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
                      label="Email"
                      type="email"
                      name="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="tu@email.com"
                      error={
                        touched.email && errors.email ? errors.email : undefined
                      }
                      required
                    />

                    <Button
                      type="submit"
                      style={{ width: "100%" }}
                      isLoading={isSubmitting}
                    >
                      Enviar enlace de recuperación
                    </Button>
                  </Form>
                )}
              </Formik>

              <div className={styles.footer}>
                <p className={styles.footerText}>
                  ¿Recordaste tu contraseña?{" "}
                  <Link href="/login" className={styles.footerLink}>
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  )
}
