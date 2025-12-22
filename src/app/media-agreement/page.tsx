"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth/hooks"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { profileService } from "@/features/profile/services/profile.service"
import { Card } from "@/shared/components/ui"
import { Button } from "@/shared/components/ui"
import styles from "./page.module.css"
import jsPDF from "jspdf"

export default function MediaAgreementPage() {
  const {
    user,
    isAuthenticated,
    isLoading: authLoading,
    refreshUser,
  } = useAuth()
  const { profile, loadProfile } = useProfile()
  const router = useRouter()
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirigir si no está autenticado
    if (!authLoading && !isAuthenticated) {
      router.push("/login")
    }
    // Si el perfil no está completado, redirigir a completar perfil
    else if (!authLoading && user && !user.hasProfile) {
      router.push("/complete-profile")
    }
    // Si ya subió el acuerdo, redirigir al home
    else if (!authLoading && user?.hasUploadedAgreement) {
      router.push("/home")
    }
    // Cargar el perfil si está autenticado y tiene perfil
    else if (!authLoading && user && user.hasProfile && !profile) {
      loadProfile()
    }
  }, [isAuthenticated, authLoading, user, router, profile, loadProfile])

  const handleDownloadAgreement = async () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 6
    let yPosition = 20

    // Encabezado azul con escudo y texto
    pdf.setFillColor(0, 32, 91) // Azul oscuro del membrete
    pdf.rect(0, 0, pageWidth, 25, "F")

    // Texto del encabezado (derecha)
    pdf.setTextColor(255, 255, 255)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    pdf.text("Instituto de Cine", pageWidth - margin, 12, { align: "right" })
    pdf.text("y Creación Audiovisual", pageWidth - margin, 18, {
      align: "right",
    })

    // Texto izquierda del encabezado
    pdf.setFontSize(10)
    pdf.text("REPÚBLICA", margin + 5, 12)
    pdf.text("DEL ECUADOR", margin + 5, 17)

    yPosition = 35

    // Título del documento
    pdf.setTextColor(0, 0, 0)
    pdf.setFontSize(14)
    pdf.setFont("helvetica", "bold")
    const title = "ACUERDO DE RESPONSABILIDAD Y USO DE MEDIOS ELECTRÓNICOS"
    pdf.text(title, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 8

    pdf.setFontSize(11)
    pdf.text(
      "Instituto de Cine y Creación Audiovisual - ICCA",
      pageWidth / 2,
      yPosition,
      { align: "center" },
    )
    yPosition += 5

    // Contenido del acuerdo
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")

    const addText = (text: string, isBold = false, indent = 0) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage()
        yPosition = 20
      }
      pdf.setFont("helvetica", isBold ? "bold" : "normal")
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin - indent)
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - 30) {
          pdf.addPage()
          yPosition = 20
        }
        pdf.text(line, margin + indent, yPosition)
        yPosition += lineHeight
      })
    }

    // Introducción
    addText(
      `La persona identificada en el presente Acuerdo, en su calidad de usuario del Instituto de Cine y Creación Audiovisual (ICCA), acepta voluntariamente sujetarse a las siguientes condiciones relacionadas con el uso de medios electrónicos, mensajería para la realización de solicitudes, la gestión de trámites, el cumplimiento de obligaciones, la recepción de notificaciones y el acceso a servicios vinculados a la Red de Espacios Audiovisuales (REA) y el Banco de Contenidos Audiovisuales.`,
    )
    yPosition += 3

    addText(
      `La aceptación en línea del presente Acuerdo implica el consentimiento expreso del usuario para utilizar los medios electrónicos como medio oficial para todas las comunicaciones oficiales, técnicas y administrativas en el correo electrónico registrado en los sistemas electrónicos institucionales. El usuario entiende que estos medios tienen todos los efectos legales previstos en el Código Orgánico Administrativo.`,
    )
    yPosition += 5

    // Sección 1
    addText("1. ACEPTACIÓN DEL USO DE MEDIOS ELECTRÓNICOS", true)
    yPosition += 2
    addText(
      `El usuario manifiesta su deseo y conformidad en utilizar los medios electrónicos que el ICCA pone a su disposición para:`,
    )
    yPosition += 2

    const items1 = [
      "Presentar y gestionar solicitudes relacionadas con la REA o el Banco de Contenidos;",
      "Cumplir obligaciones y completar verificaciones necesarias;",
      "Recibir comunicaciones, mensajes de datos, notificaciones y requerimientos;",
      "Acceder a servicios, certificaciones, autorizaciones o registros electrónicos.",
    ]
    items1.forEach((item) => {
      addText(`• ${item}`, false, 5)
    })
    yPosition += 3

    addText(
      `La aceptación de este Acuerdo no impide al ICCA utilizar otros medios de notificación permitidos por ley cuando las circunstancias lo requieran.`,
    )
    yPosition += 5

    // Sección 2
    addText("2. NOTIFICACIONES ELECTRÓNICAS Y EFECTOS LEGALES", true)
    yPosition += 2
    addText(
      `El usuario acepta que la notificación electrónica es válida y se entenderá practicada en el momento en que el mensaje de datos sea recibido en:`,
    )
    yPosition += 2

    const items2 = [
      "El buzón electrónico del sistema institucional del ICCA, o",
      "La dirección de correo electrónico registrada por el usuario.",
    ]
    items2.forEach((item) => {
      addText(`• ${item}`, false, 5)
    })
    yPosition += 3

    addText(
      `El acceso del usuario al mensaje de datos se considera acceso al documento original, conforme a la Ley de Comercio Electrónico, Firmas Electrónicas y Mensajes de Datos.`,
    )
    yPosition += 5

    // Sección 3
    addText("3. RESPONSABILIDAD DEL USUARIO", true)
    yPosition += 2
    addText("El usuario asume la responsabilidad total por:")
    yPosition += 2

    const items3 = [
      "El uso adecuado de sus credenciales o claves de acceso;",
      "La veracidad de la información ingresada en los sistemas institucionales;",
      "El cumplimiento de las obligaciones administrativas derivadas de su relación con la REA y/o el Banco de Contenidos;",
      "Mantener actualizados sus datos electrónicos de contacto;",
      "Revisar periódicamente los canales electrónicos habilitados, incluyendo correo y plataforma institucional.",
      "La falta de revisión de sus buzones electrónicos no afectará la validez jurídica de las notificaciones realizadas.",
    ]
    items3.forEach((item) => {
      addText(`${item}`, false, 0)
    })
    yPosition += 3

    // Sección 4
    addText("4. RESPONSABILIDAD DEL ICCA", true)
    yPosition += 2
    addText(
      `El ICCA será responsable por fallas tecnológicas imputables al usuario o a terceros; accesos indebidos derivados del mal uso o descuido del usuario respecto de sus claves o credenciales; y/o errores en la información proporcionada por el usuario que afecten los registros oficiales.`,
    )
    yPosition += 3

    addText(
      `El ICCA tomará medidas razonables de seguridad tecnológica, sin que ello implique responsabilidad por daños causados por factores externos o ajenos a su control.`,
    )
    yPosition += 5

    // Sección 5
    addText("5. AUTORIZACIÓN DE USO DE DATOS", true)
    yPosition += 2
    addText(
      `El usuario autoriza al ICCA a utilizar los datos proporcionados en los sistemas electrónicos institucionales exclusivamente para la gestión administrativa vinculada a la REA, al Banco de Contenidos o a otros servicios institucionales relacionados.`,
    )
    yPosition += 5

    // Sección 6
    addText("6. VIGENCIA DEL ACUERDO", true)
    yPosition += 2
    addText(
      `El presente Acuerdo tendrá vigencia indefinida, desde su aceptación electrónica, salvo que el usuario manifieste su voluntad de dejarlo sin efecto, con aviso previo de treinta (30) días, o el ICCA determine su terminación con la misma antelación.`,
    )
    yPosition += 3

    addText(
      `La terminación del Acuerdo afectará la posibilidad de utilizar medios electrónicos para trámites relacionados con la REA o el Banco, sin perjuicio de otras obligaciones pendientes.`,
    )
    yPosition += 5

    // Sección 7
    addText("7. ACEPTACIÓN EXPRESA", true)
    yPosition += 2
    addText(
      `La aceptación electrónica de este Acuerdo implica la conformidad total del usuario con sus términos y condiciones, y se entenderá incorporado en todas las actuaciones administrativas que se realicen mediante medios electrónicos en el marco de la REA y del Banco de Contenidos Audiovisuales.`,
    )
    yPosition += 10

    // Formulario de datos
    pdf.setFontSize(10)
    pdf.setFont("helvetica", "normal")
    pdf.setTextColor(0, 0, 0)

    // Determinar si es persona natural o jurídica
    const isLegalEntity = profile?.legalStatus === "legal_entity"

    // Tabla de datos
    const formStartY = yPosition
    const leftColX = margin
    const rightColX = pageWidth / 2 + 10
    const fieldHeight = 12 // Altura por campo con más espacio

    // Columna izquierda
    pdf.setFont("helvetica", "bold")
    pdf.text(
      isLegalEntity ? "Razón social:" : "Nombres y apellidos:",
      leftColX,
      yPosition,
    )
    pdf.setFont("helvetica", "normal")
    pdf.line(leftColX, yPosition + 2, rightColX - 5, yPosition + 2)

    const displayName = isLegalEntity
      ? profile?.legalName || ""
      : profile?.fullName || ""
    pdf.text(displayName, leftColX + 2, yPosition + 6)
    yPosition += fieldHeight

    pdf.setFont("helvetica", "bold")
    pdf.text("Identificación / RUC:", leftColX, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.line(leftColX, yPosition + 2, rightColX - 5, yPosition + 2)
    pdf.text(user?.cedula || "", leftColX + 2, yPosition + 6)
    yPosition += fieldHeight

    pdf.setFont("helvetica", "bold")
    pdf.text("Correo electrónico registrado:", leftColX, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.line(leftColX, yPosition + 2, rightColX - 5, yPosition + 2)
    pdf.text(user?.email || "", leftColX + 2, yPosition + 6)
    yPosition += fieldHeight

    pdf.setFont("helvetica", "bold")
    pdf.text("Teléfono de contacto:", leftColX, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.line(leftColX, yPosition + 2, rightColX - 5, yPosition + 2)
    pdf.text(profile?.phone || "", leftColX + 2, yPosition + 6)
    yPosition += fieldHeight

    // Representante legal solo si es entidad jurídica
    if (isLegalEntity) {
      pdf.setFont("helvetica", "bold")
      pdf.text("Representante legal:", leftColX, yPosition)
      pdf.setFont("helvetica", "normal")
      pdf.line(leftColX, yPosition + 2, rightColX - 5, yPosition + 2)
      // El fullName es el representante cuando es legal entity
      pdf.text(profile?.fullName || "", leftColX + 2, yPosition + 6)
      yPosition += fieldHeight
    }

    const currentDate = new Date().toLocaleDateString("es-EC", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    pdf.setFont("helvetica", "bold")
    pdf.text("Fecha:", leftColX, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.line(leftColX, yPosition + 2, rightColX - 5, yPosition + 2)
    pdf.text(currentDate, leftColX + 2, yPosition + 6)

    // Columna derecha - Cuadro de firma
    const boxX = rightColX
    const boxY = formStartY
    const boxWidth = pageWidth - rightColX - margin
    const boxHeight = isLegalEntity ? 80 : 70

    pdf.rect(boxX, boxY, boxWidth, boxHeight)
    pdf.setFontSize(11)
    pdf.text("FIRMA ELECTRÓNICA", boxX + boxWidth / 2, boxY + 10, {
      align: "center",
    })

    // Guardar el PDF
    pdf.save(`Acuerdo_Responsabilidad_${user?.cedula || "documento"}.pdf`)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("El archivo no debe superar los 5MB")
        return
      }

      // Validar tipo de archivo (PDF, imágenes)
      const allowedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
      ]
      if (!allowedTypes.includes(file.type)) {
        setError("Solo se permiten archivos PDF, JPG o PNG")
        return
      }

      setError("")
      setUploadedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadedFile) {
      setError("Debe seleccionar un archivo para subir")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      // Llamar al servicio para subir el acuerdo
      // Este proceso incluye dos pasos:
      // 1. POST /assets/upload - Sube el archivo
      // 2. POST /profiles/upload-agreement - Registra el acuerdo en el perfil
      await profileService.uploadAgreement(uploadedFile)

      // Refrescar los datos del usuario para obtener el estado actualizado
      await refreshUser()

      // Redirigir al home
      router.push("/home")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir el documento",
      )
    } finally {
      setIsUploading(false)
    }
  }

  if (authLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.wrapper}>
          <Card>
            <div className={styles.header}>
              <p className={styles.subtitle}>Cargando...</p>
            </div>
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
            <h2 className={styles.title}>
              Acuerdo de Responsabilidad de Medios Electrónicos
            </h2>
            <p className={styles.subtitle}>
              Paso final para completar su registro
            </p>
          </div>

          <div className={styles.content}>
            <div className={styles.infoBox}>
              <h3 className={styles.infoTitle}>Instrucciones:</h3>
              <ol className={styles.instructionsList}>
                <li>Descargue el documento de acuerdo de responsabilidad</li>
                <li>Firme el documento electrónicamente</li>
                <li>Suba el documento a través de esta plataforma</li>
              </ol>
              <p className={styles.warning}>
                ⚠️ <strong>Importante:</strong> Sin este documento firmado no
                podrá acceder a los servicios del sistema.
              </p>
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDownloadAgreement}
                className={styles.downloadButton}
              >
                📄 Descargar Documento
              </Button>

              <div className={styles.uploadSection}>
                <h3 className={styles.uploadTitle}>Subir documento firmado:</h3>

                <div className={styles.fileInputWrapper}>
                  <input
                    type="file"
                    id="agreement-file"
                    accept=".pdf"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                  />
                  <label htmlFor="agreement-file" className={styles.fileLabel}>
                    {uploadedFile
                      ? uploadedFile.name
                      : "Seleccionar archivo (PDF - Max 5MB)"}
                  </label>
                </div>

                {error && <div className={styles.error}>{error}</div>}

                {uploadedFile && (
                  <div className={styles.fileInfo}>
                    <p>
                      ✅ Archivo seleccionado:{" "}
                      <strong>{uploadedFile.name}</strong>
                    </p>
                    <p>Tamaño: {(uploadedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="primary"
                  onClick={handleUpload}
                  disabled={!uploadedFile || isUploading}
                  className={styles.uploadButton}
                >
                  {isUploading ? "Subiendo..." : "Subir Documento"}
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
