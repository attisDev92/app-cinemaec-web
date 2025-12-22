"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Formik, Form } from "formik"
import { useAuth } from "@/features/auth/hooks"
import { Input } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import { Card } from "@/shared/components/ui"
import styles from "./page.module.css"
import { registerValidationSchema } from "@/features/auth/lib/validations/register-schema.yup"

export default function RegisterPage() {
  const { register } = useAuth()
  const [error, setError] = useState("")

  const handleSubmit = async (
    values: {
      email: string
      ciOrRuc: string
      password: string
      confirmPassword: string
    },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void },
  ) => {
    setError("")
    try {
      // confirmPassword solo se usa para validación, no se envía al backend
      await register(values.email, values.ciOrRuc, values.password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrarse")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <Card>
          <div className={styles.header}>
            <h2 className={styles.title}>Crear Cuenta</h2>
            <p className={styles.subtitle}>Regístrate en CinemaEC</p>
          </div>

          <Formik
            initialValues={{
              email: "",
              ciOrRuc: "",
              password: "",
              confirmPassword: "",
            }}
            validationSchema={registerValidationSchema}
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

                <Input
                  label="Cédula o Ruc"
                  type="text"
                  name="ciOrRuc"
                  value={values.ciOrRuc}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="1234567890"
                  error={
                    touched.ciOrRuc && errors.ciOrRuc
                      ? errors.ciOrRuc
                      : undefined
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
                  error={
                    touched.password && errors.password
                      ? errors.password
                      : undefined
                  }
                  required
                />
                <p className={styles.passwordHint}>
                  La contraseña debe contener mínimo 6 caracteres, incluyendo
                  una letra mayúscula y un número.
                </p>
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
                >
                  Registrarse
                </Button>
              </Form>
            )}
          </Formik>

          <div className={styles.footer}>
            <p className={styles.footerText}>
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className={styles.footerLink}>
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}
