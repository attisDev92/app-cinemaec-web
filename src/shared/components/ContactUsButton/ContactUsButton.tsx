"use client"

import { useMemo, useState } from "react"
import { useFormik } from "formik"
import * as Yup from "yup"
import { contactUsService } from "@/features/contact-us/services/contact-us.service"
import type { CreateContactUsPayload } from "@/features/contact-us/types"
import { Button, Input, Textarea } from "@/shared/components/ui"
import styles from "./ContactUsButton.module.css"

type ContactUsLocale = "es" | "en" | "bilingual"

interface ContactUsButtonProps {
  className?: string
  buttonLabel?: string
  modalTitle?: string
  locale?: ContactUsLocale
}

const initialValues: CreateContactUsPayload = {
  name: "",
  institution: "",
  email: "",
  phone: "",
  message: "",
}

const TEXTS: Record<ContactUsLocale, {
  buttonLabel: string
  modalTitle: string
  subtitle: string
  closeLabel: string
  labels: {
    name: string
    institution: string
    email: string
    phone: string
    message: string
  }
  placeholders: {
    name: string
    institution: string
    email: string
    phone: string
    message: string
  }
  helper: (count: number) => string
  cancel: string
  submit: string
  success: string
  errors: {
    nameMin: string
    nameMax: string
    nameRequired: string
    institutionMax: string
    emailInvalid: string
    emailMax: string
    emailRequired: string
    phoneInvalid: string
    phoneMax: string
    messageMin: string
    messageMax: string
    messageRequired: string
    submit: string
  }
}> = {
  es: {
    buttonLabel: "Contáctanos",
    modalTitle: "Contáctanos",
    subtitle: "Completa el formulario y nos pondremos en contacto contigo.",
    closeLabel: "Cerrar",
    labels: {
      name: "Nombre *",
      institution: "Institución",
      email: "Email *",
      phone: "Número",
      message: "Mensaje *",
    },
    placeholders: {
      name: "Tu nombre",
      institution: "Opcional",
      email: "correo@ejemplo.com",
      phone: "+593 99 123 4567",
      message: "Escribe tu mensaje aquí",
    },
    helper: (count) => `${count}/300 caracteres`,
    cancel: "Cancelar",
    submit: "Enviar mensaje",
    success: "Tu mensaje fue enviado correctamente.",
    errors: {
      nameMin: "El nombre debe tener al menos 2 caracteres",
      nameMax: "El nombre no puede exceder 150 caracteres",
      nameRequired: "El nombre es obligatorio",
      institutionMax: "La institución no puede exceder 255 caracteres",
      emailInvalid: "El email debe ser válido",
      emailMax: "El email no puede exceder 255 caracteres",
      emailRequired: "El email es obligatorio",
      phoneInvalid: "Ingresa un número válido",
      phoneMax: "El número no puede exceder 30 caracteres",
      messageMin: "El mensaje debe tener al menos 5 caracteres",
      messageMax: "El mensaje no puede exceder 300 caracteres",
      messageRequired: "El mensaje es obligatorio",
      submit: "No se pudo enviar el mensaje.",
    },
  },
  en: {
    buttonLabel: "Contact Us",
    modalTitle: "Contact Us",
    subtitle: "Fill out the form and we will get back to you.",
    closeLabel: "Close",
    labels: {
      name: "Name *",
      institution: "Institution",
      email: "Email *",
      phone: "Phone Number",
      message: "Message *",
    },
    placeholders: {
      name: "Your name",
      institution: "Optional",
      email: "email@example.com",
      phone: "+1 555 123 4567",
      message: "Write your message here",
    },
    helper: (count) => `${count}/300 characters`,
    cancel: "Cancel",
    submit: "Send message",
    success: "Your message was sent successfully.",
    errors: {
      nameMin: "Name must be at least 2 characters long",
      nameMax: "Name cannot exceed 150 characters",
      nameRequired: "Name is required",
      institutionMax: "Institution cannot exceed 255 characters",
      emailInvalid: "Email must be valid",
      emailMax: "Email cannot exceed 255 characters",
      emailRequired: "Email is required",
      phoneInvalid: "Enter a valid phone number",
      phoneMax: "Phone number cannot exceed 30 characters",
      messageMin: "Message must be at least 5 characters long",
      messageMax: "Message cannot exceed 300 characters",
      messageRequired: "Message is required",
      submit: "The message could not be sent.",
    },
  },
  bilingual: {
    buttonLabel: "Contáctanos / Contact Us",
    modalTitle: "Contáctanos / Contact Us",
    subtitle:
      "Completa el formulario y nos pondremos en contacto contigo. / Fill out the form and we will get back to you.",
    closeLabel: "Cerrar / Close",
    labels: {
      name: "Nombre / Name *",
      institution: "Institución / Institution",
      email: "Email *",
      phone: "Número / Phone Number",
      message: "Mensaje / Message *",
    },
    placeholders: {
      name: "Tu nombre / Your name",
      institution: "Opcional / Optional",
      email: "correo@ejemplo.com / email@example.com",
      phone: "+593 99 123 4567 / +1 555 123 4567",
      message: "Escribe tu mensaje aquí / Write your message here",
    },
    helper: (count) => `${count}/300 caracteres / characters`,
    cancel: "Cancelar / Cancel",
    submit: "Enviar mensaje / Send message",
    success:
      "Tu mensaje fue enviado correctamente. / Your message was sent successfully.",
    errors: {
      nameMin: "El nombre debe tener al menos 2 caracteres / Name must be at least 2 characters long",
      nameMax: "El nombre no puede exceder 150 caracteres / Name cannot exceed 150 characters",
      nameRequired: "El nombre es obligatorio / Name is required",
      institutionMax:
        "La institución no puede exceder 255 caracteres / Institution cannot exceed 255 characters",
      emailInvalid: "El email debe ser válido / Email must be valid",
      emailMax: "El email no puede exceder 255 caracteres / Email cannot exceed 255 characters",
      emailRequired: "El email es obligatorio / Email is required",
      phoneInvalid: "Ingresa un número válido / Enter a valid phone number",
      phoneMax:
        "El número no puede exceder 30 caracteres / Phone number cannot exceed 30 characters",
      messageMin:
        "El mensaje debe tener al menos 5 caracteres / Message must be at least 5 characters long",
      messageMax:
        "El mensaje no puede exceder 300 caracteres / Message cannot exceed 300 characters",
      messageRequired: "El mensaje es obligatorio / Message is required",
      submit: "No se pudo enviar el mensaje. / The message could not be sent.",
    },
  },
}

const buildValidationSchema = (localeText: (typeof TEXTS)[ContactUsLocale]) =>
  Yup.object({
    name: Yup.string()
      .trim()
      .min(2, localeText.errors.nameMin)
      .max(150, localeText.errors.nameMax)
      .required(localeText.errors.nameRequired),
    institution: Yup.string()
      .trim()
      .max(255, localeText.errors.institutionMax),
    email: Yup.string()
      .trim()
      .email(localeText.errors.emailInvalid)
      .max(255, localeText.errors.emailMax)
      .required(localeText.errors.emailRequired),
    phone: Yup.string()
      .trim()
      .matches(/^$|^\+?[0-9()\-\s]{7,30}$/, localeText.errors.phoneInvalid)
      .max(30, localeText.errors.phoneMax),
    message: Yup.string()
      .trim()
      .min(5, localeText.errors.messageMin)
      .max(300, localeText.errors.messageMax)
      .required(localeText.errors.messageRequired),
  })

export function ContactUsButton({
  className = "",
  buttonLabel,
  modalTitle,
  locale = "bilingual",
}: ContactUsButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null)

  const text = useMemo(() => TEXTS[locale], [locale])
  const validationSchema = useMemo(() => buildValidationSchema(text), [text])

  const formik = useFormik({
    initialValues,
    validationSchema,
    onSubmit: async (values, helpers) => {
      setSubmitError(null)
      setSubmitSuccess(null)

      try {
        await contactUsService.create({
          name: values.name.trim(),
          institution: values.institution?.trim() || undefined,
          email: values.email.trim(),
          phone: values.phone?.trim() || undefined,
          message: values.message.trim(),
        })

        setSubmitSuccess(text.success)
        helpers.resetForm()
      } catch (error) {
        setSubmitError(
          error instanceof Error ? error.message : text.errors.submit,
        )
      }
    },
  })

  const messageHelper = useMemo(
    () => text.helper(formik.values.message.length),
    [formik.values.message.length, text],
  )

  const closeModal = () => {
    setIsOpen(false)
    setSubmitError(null)
    setSubmitSuccess(null)
    formik.resetForm()
  }

  return (
    <>
      <div className={`${styles.wrapper} ${className}`}>
        <Button type="button" onClick={() => setIsOpen(true)} className={styles.trigger}>
          {buttonLabel ?? text.buttonLabel}
        </Button>
      </div>

      {isOpen && (
        <div className={styles.overlay} onClick={closeModal}>
          <div
            className={styles.modal}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-us-modal-title"
          >
            <div className={styles.header}>
              <div>
                <h2 id="contact-us-modal-title" className={styles.title}>
                  {modalTitle ?? text.modalTitle}
                </h2>
                <p className={styles.subtitle}>
                  {text.subtitle}
                </p>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeModal}
                aria-label={text.closeLabel}
              >
                ✕
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className={styles.form}>
              <div className={styles.fields}>
                <Input
                  label={text.labels.name}
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={text.placeholders.name}
                  error={
                    formik.touched.name && formik.errors.name
                      ? String(formik.errors.name)
                      : undefined
                  }
                />

                <Input
                  label={text.labels.institution}
                  name="institution"
                  value={formik.values.institution}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={text.placeholders.institution}
                  error={
                    formik.touched.institution && formik.errors.institution
                      ? String(formik.errors.institution)
                      : undefined
                  }
                />

                <Input
                  label={text.labels.email}
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={text.placeholders.email}
                  error={
                    formik.touched.email && formik.errors.email
                      ? String(formik.errors.email)
                      : undefined
                  }
                />

                <Input
                  label={text.labels.phone}
                  name="phone"
                  type="tel"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={text.placeholders.phone}
                  error={
                    formik.touched.phone && formik.errors.phone
                      ? String(formik.errors.phone)
                      : undefined
                  }
                />

                <Textarea
                  label={text.labels.message}
                  name="message"
                  rows={5}
                  maxLength={300}
                  value={formik.values.message}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder={text.placeholders.message}
                  helper={messageHelper}
                  error={
                    formik.touched.message && formik.errors.message
                      ? String(formik.errors.message)
                      : undefined
                  }
                />

                {submitError && <p className={styles.errorMessage}>{submitError}</p>}
                {submitSuccess && <p className={styles.successMessage}>{submitSuccess}</p>}
              </div>

              <div className={styles.footer}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={closeModal}
                  disabled={formik.isSubmitting}
                >
                  {text.cancel}
                </Button>
                <Button
                  type="submit"
                  isLoading={formik.isSubmitting}
                  disabled={formik.isSubmitting}
                >
                  {text.submit}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}