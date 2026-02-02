"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter, useParams } from "next/navigation"
import { useAuth } from "@/features/auth/hooks/useAuth"
import { spaceService } from "@/features/spaces/services/space.service"
import { contractService } from "@/features/contracts/services/contract.service"
import { assetService } from "@/features/assets/services/asset.service"
import { Button } from "@/shared/components/ui/Button"
import { AssetTypeEnum, AssetOwnerEnum, Space } from "@/shared/types"
import jsPDF from "jspdf"
import styles from "./page.module.css"

export default function AgreementPage() {
  const router = useRouter()
  const params = useParams()
  const { user, isLoading: authLoading } = useAuth()
  const [space, setSpace] = useState<Space | null>(null)
  const [contractDocumentId, setContractDocumentId] = useState<number | null>(
    null,
  )
  const [contractDocumentUrl, setContractDocumentUrl] = useState<string | null>(
    null,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSpace, setIsLoadingSpace] = useState(true)
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false)
  const [isAccepted, setIsAccepted] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const spaceId = params?.id ? Number(params.id) : null

  const loadSpace = useCallback(async () => {
    try {
      setIsLoadingSpace(true)
      const spaceData = await spaceService.getSpaceById(spaceId!)
      setSpace(spaceData)
    } catch (error) {
      console.error("Error al cargar espacio:", error)
      alert("Error al cargar la información del espacio")
    } finally {
      setIsLoadingSpace(false)
    }
  }, [spaceId])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    if (spaceId) {
      loadSpace()
    }
  }, [authLoading, user, spaceId, router, loadSpace])

  const generatePDFDocument = () => {
    if (!space) return null

    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const lineHeight = 6
    let yPosition = 20

    // Encabezado azul con escudo y texto (igual que media-agreement)
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
    const title =
      "CARTA COMPROMISO PARA FORMAR PARTE DE LA RED DE ESPACIOS AUDIOVISUALES (REA)"
    const titleLines = pdf.splitTextToSize(title, pageWidth - 2 * margin)
    titleLines.forEach((line: string) => {
      pdf.text(line, pageWidth / 2, yPosition, { align: "center" })
      yPosition += 7
    })
    yPosition += 5

    // Contenido del documento
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
      `Yo, ${space.managerName} en representación del espacio ${space.name}, en adelante "MIEMBRO DE LA REA".`,
    )
    yPosition += 3

    addText(
      `Para efectos de la presente carta compromiso me comprometo con la Red de Espacios Audiovisuales (REA) a cumplir con cada una de las obligaciones y acepto la totalidad de los términos y condiciones de uso del Banco de Contenidos Audiovisuales gestionado por el INSTITUTO DE CINE Y CREACIÓN AUDIOVISUAL (ICCA).`,
    )
    yPosition += 3

    addText(
      `El objeto de este documento es establecer mi compromiso ante el cumplimiento de las obligaciones y prohibiciones relativas a mi membresía, así como al acceso de obras, a través del Banco de Contenidos Audiovisuales.`,
    )
    yPosition += 5

    // Sección I
    addText("I. OBLIGACIONES Y PROHIBICIONES:", true)
    yPosition += 2
    addText("El miembro de la Red de Espacios Audiovisuales se obliga a:")
    yPosition += 2

    const obligations = [
      "Remitir los reportes de exhibición y taquilla únicamente respecto de las funciones realizadas con obras obtenidas a través del Banco de Contenidos Audiovisuales.",
      "Mantener en funcionamiento el equipamiento técnico utilizado para la exhibición, garantizando condiciones adecuadas de audio, imagen y seguridad.",
      "Respetar los derechos de autor y conexos, así como las condiciones de uso y reproducción de obras provenientes del Banco de Contenidos Audiovisuales.",
      "Permitir visitas técnicas y programáticas realizadas por el ICCA, cuando éstas sean necesarias para verificar el cumplimiento de este Reglamento.",
      "Actualizar la información administrativa y técnica cuando se produzcan cambios o sean solicitados por el ICCA, en la administración, equipamiento, funcionamiento o características del espacio.",
      "Garantizar accesibilidad para el público, conforme a la normativa vigente.",
      "Participar, cuando corresponda, en actividades de formación de públicos, mediación cultural y otros.",
      "Velar por la integridad y seguridad de las obras y del material recibido a través del Banco de Contenidos, evitando cualquier uso no autorizado.",
      "En caso de solicitar una obra en archivo digital, respetar la inviolabilidad de las claves de protección y bajo ningún concepto duplicar el archivo prestado ni transmitir en ninguna modalidad o formato distinto al indicado en la solicitud.",
      "Incluir la imagen institucional de la REA en el material publicitario, impreso o digital, observando el Manual de Uso y Aplicación de Logotipos de la REA.",
      "Informar si se planea cobrar un valor de taquilla por la proyección del contenido del Banco de Contenidos, en cuyo caso el ICCA únicamente proveerá la información de contacto del titular de la obra. El solicitante deberá tramitar la autorización y negociará directamente los términos para la distribución de la taquilla con el titular de la obra. Una vez obtenida la autorización expresa, ésta debe ser remitida al ICCA para continuar con el debido proceso.",
      "Cumplir con los compromisos asumidos en la carta de compromiso de incorporación y en cualquier instrumento complementario derivado de esta.",
    ]

    obligations.forEach((obligation) => {
      addText(`• ${obligation}`, false, 5)
    })
    yPosition += 3

    addText("El miembro de la Red de Espacios Audiovisuales tiene prohibido:")
    yPosition += 2

    const prohibitions = [
      "Cobrar taquilla, donaciones, contribuciones u otros valores por la exhibición de obras obtenidas a través del Banco de Contenidos Audiovisuales cuando el titular de los derechos de propiedad intelectual no lo haya autorizado expresamente.",
      "Realizar copias, reproducciones, descargas no autorizadas, duplicación o almacenamiento de las obras proporcionadas por el Banco de Contenidos, por fuera del formato y modalidad estrictamente necesarios para su exhibición autorizada.",
      "Utilizar obras del Banco de Contenidos para fines distintos a los aprobados por el ICCA, incluyendo su uso en festivales, muestras externas, actividades comerciales, plataformas digitales o cualquier evento no autorizado.",
      "Modificar, editar, cortar, alterar o intervenir las obras audiovisuales sin autorización del titular de los derechos.",
      "Facilitar el acceso o prestar materiales del Banco de Contenidos a terceros no autorizados, incluyendo la cesión de claves, archivos, enlaces o formatos de exhibición.",
      "Proyectar obras en espacios o sedes no declaradas ante el ICCA, o en condiciones técnicas distintas a las autorizadas que comprometan la calidad o seguridad de la reproducción, lo que incluye su uso en festivales, muestras externas, actividades comerciales, plataformas digitales o cualquier evento no autorizado.",
      "Divulgar o difundir públicamente material promocional, informativo o técnico sujeto a confidencialidad o protegido por derechos de autor, salvo autorización del ICCA o del titular correspondiente.",
      "Utilizar la imagen institucional de la REA sin respetar los lineamientos gráficos y comunicacionales autorizados por el ICCA.",
      "Comercializar de manera directa o indirecta cualquier contenido del Banco de Contenidos Audiovisuales.",
    ]

    prohibitions.forEach((prohibition) => {
      addText(`• ${prohibition}`, false, 5)
    })
    yPosition += 5

    // Sección II
    addText("II. INCUMPLIMIENTO Y CONSECUENCIAS", true)
    yPosition += 2
    addText(
      "Reconozco que el incumplimiento de obligaciones y de las prohibiciones establecidas en la presente Carta Compromiso será causal de suspensión o exclusión definitiva de la REA, que incluye el uso de forma fraudulenta, comercial no autorizada o ilícita de los contenidos del Banco de Contenidos Audiovisuales. Dicha exclusión procederá sin perjuicio de las acciones civiles, administrativas o penales que correspondan conforme a la normativa legal vigente de propiedad intelectual o de las sanciones que pueda imponer la autoridad nacional competente en materia de derechos intelectuales.",
    )
    yPosition += 5

    // Sección III
    addText("III. ACEPTACIÓN:", true)
    yPosition += 2
    addText(
      "Mediante mi aceptación me comprometo al cabal cumplimiento de la totalidad de los términos contenidos en esta Carta Compromiso, asumiendo que mi incumplimiento puede llevar a la suspensión o exclusión según corresponda, de conformidad con lo establecido en el Reglamento para la operación de la Red de Espacios Audiovisuales y del Banco de Contenidos.",
    )
    yPosition += 3

    addText(
      "Adicionalmente, comprendo que el INSTITUTO DE CINE Y CREACIÓN AUDIOVISUAL (ICCA) no se responsabiliza por las infracciones a la Propiedad Intelectual causadas por quien suscribe.",
    )
    yPosition += 5

    // Datos del miembro
    addText("Datos del miembro:", true)
    yPosition += 3

    pdf.setFont("helvetica", "bold")
    pdf.text("Administrador del espacio:", margin, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.text(space.managerName || "", margin + 60, yPosition)
    yPosition += lineHeight

    pdf.setFont("helvetica", "bold")
    pdf.text("Espacio:", margin, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.text(space.name || "", margin + 60, yPosition)
    yPosition += lineHeight

    const dateFormatOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }

    const currentDate = new Date().toLocaleDateString(
      "es-EC",
      dateFormatOptions,
    )

    pdf.setFont("helvetica", "bold")
    pdf.text("Fecha de aceptación:", margin, yPosition)
    pdf.setFont("helvetica", "normal")
    pdf.text(currentDate, margin + 60, yPosition)
    yPosition += 10

    const twoYearsFromNow = new Date()
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2)
    const twoYearsFromNowFormatted = twoYearsFromNow.toLocaleDateString(
      "es-EC",
      dateFormatOptions,
    )

    // Información institucional al final
    pdf.setFont("helvetica", "normal")
    pdf.setFontSize(10)
    pdf.text(
      "Instituto de Cine y Creación Audiovisual (ICCA)",
      pageWidth / 2,
      yPosition,
      { align: "center" },
    )
    yPosition += lineHeight
    pdf.text("Red de Espacios Audiovisuales (REA)", pageWidth / 2, yPosition, {
      align: "center",
    })
    yPosition += lineHeight + 2
    pdf.text(
      `Vigencia: ${currentDate} - ${twoYearsFromNowFormatted}`,
      pageWidth / 2,
      yPosition,
      { align: "center" },
    )

    return pdf
  }

  const uploadGeneratedAgreement = async () => {
    if (!space) return null

    setIsGeneratingDocument(true)
    try {
      const pdf = generatePDFDocument()
      if (!pdf) throw new Error("No se pudo generar el documento")

      const blob = pdf.output("blob")
      const fileName = `Carta_Compromiso_REA_${space.name.replace(/\s+/g, "_")}_${Date.now()}.pdf`

      // Descargar automáticamente el documento PDF
      pdf.save(fileName)

      const file = new File([blob], fileName, {
        type: "application/pdf",
      })

      const uploaded = await assetService.uploadAsset(
        file,
        AssetTypeEnum.DOCUMENT,
        AssetOwnerEnum.SPACE_DOCUMENT,
        spaceId || undefined,
      )

      setContractDocumentId(uploaded.id)
      setContractDocumentUrl(uploaded.url)

      return uploaded
    } finally {
      setIsGeneratingDocument(false)
    }
  }

  const handleSubmitAgreement = async () => {
    if (!isAccepted) {
      alert("Debes aceptar los términos para continuar")
      return
    }

    if (!space) {
      alert("No se encontró la información del espacio")
      return
    }

    try {
      setIsSubmitting(true)

      const uploaded = contractDocumentUrl
        ? { id: contractDocumentId!, url: contractDocumentUrl }
        : await uploadGeneratedAgreement()

      if (!uploaded) {
        throw new Error("No se pudo generar el documento")
      }

      const startDate = new Date()
      const expirationDate = new Date()
      expirationDate.setFullYear(expirationDate.getFullYear() + 2)

      // Crear el contrato con POST /contracts
      // El backend se encargará de actualizar el estado del espacio a UNDER_REVIEW
      await contractService.createContract({
        adminName: space.managerName,
        spaceId: spaceId!,
        contractType: "space",
        documentUrl: uploaded.url,
        startDate: startDate.toISOString(),
        expirationDate: expirationDate.toISOString(),
      })

      setIsCompleted(true)
      alert(
        "¡Acuerdo aceptado y registrado correctamente! Tu espacio está bajo revisión.",
      )
    } catch (error) {
      console.error("Error al enviar acuerdo:", error)
      alert("Error al enviar el acuerdo. Por favor intenta nuevamente.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading || isLoadingSpace) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Cargando...</div>
      </div>
    )
  }

  if (!space) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          No se pudo cargar la información del espacio
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            📄 Carta Compromiso - Red de Espacios Audiovisuales
          </h1>
          <p className={styles.subtitle}>
            Último paso para completar el registro de{" "}
            <strong>{space.name}</strong>
          </p>
        </div>

        <div className={styles.content}>
          <div className={styles.instructions}>
            <h2 className={styles.sectionTitle}>Términos y Condiciones</h2>
            <div className={styles.termsBox}>
              <h3 className={styles.termsTitle}>
                COMPROMISO PARA FORMAR PARTE DE LA RED DE ESPACIOS AUDIOVISUALES
                (REA)
              </h3>

              <h4>I. OBLIGACIONES Y PROHIBICIONES</h4>
              <p>El miembro de la Red de Espacios Audiovisuales se obliga a:</p>
              <ul>
                <li>
                  Remitir los reportes de exhibición y taquilla únicamente
                  respecto de las funciones realizadas con obras obtenidas a
                  través del Banco de Contenidos Audiovisuales.
                </li>
                <li>
                  Mantener en funcionamiento el equipamiento técnico utilizado
                  para la exhibición, garantizando condiciones adecuadas de
                  audio, imagen y seguridad.
                </li>
                <li>
                  Respetar los derechos de autor y conexos, así como las
                  condiciones de uso y reproducción de obras provenientes del
                  Banco de Contenidos Audiovisuales.
                </li>
                <li>
                  Permitir visitas técnicas y programáticas realizadas por el
                  ICCA, cuando éstas sean necesarias para verificar el
                  cumplimiento de este Reglamento.
                </li>
                <li>
                  Actualizar la información administrativa y técnica cuando se
                  produzcan cambios o sean solicitados por el ICCA, en la
                  administración, equipamiento, funcionamiento o características
                  del espacio.
                </li>
                <li>
                  Garantizar accesibilidad para el público, conforme a la
                  normativa vigente.
                </li>
                <li>
                  Participar, cuando corresponda, en actividades de formación de
                  públicos, mediación cultural y otros.
                </li>
                <li>
                  Velar por la integridad y seguridad de las obras y del
                  material recibido a través del Banco de Contenidos, evitando
                  cualquier uso no autorizado.
                </li>
                <li>
                  En caso de solicitar una obra en archivo digital, respetar la
                  inviolabilidad de las claves de protección y bajo ningún
                  concepto duplicar el archivo prestado ni transmitir en ninguna
                  modalidad o formato distinto al indicado en la solicitud.
                </li>
                <li>
                  Incluir la imagen institucional de la REA en el material
                  publicitario, impreso o digital, observando el Manual de Uso y
                  Aplicación de Logotipos de la REA.
                </li>
                <li>
                  Informar si se planea cobrar un valor de taquilla por la
                  proyección del contenido del Banco de Contenidos, en cuyo caso
                  el ICCA únicamente proveerá la información de contacto del
                  titular de la obra. El solicitante deberá tramitar la
                  autorización y negociará directamente los términos para la
                  distribución de la taquilla con el titular de la obra. Una vez
                  obtenida la autorización expresa, ésta debe ser remitida al
                  ICCA para continuar con el debido proceso.
                </li>
                <li>
                  Cumplir con los compromisos asumidos en la carta de compromiso
                  de incorporación y en cualquier instrumento complementario
                  derivado de esta.
                </li>
              </ul>

              <p>
                El miembro de la Red de Espacios Audiovisuales tiene prohibido:
              </p>
              <ol>
                <li>
                  Cobrar taquilla, donaciones, contribuciones u otros valores
                  por la exhibición de obras obtenidas a través del Banco de
                  Contenidos Audiovisuales cuando el titular de los derechos de
                  propiedad intelectual no lo haya autorizado expresamente.
                </li>
                <li>
                  Realizar copias, reproducciones, descargas no autorizadas,
                  duplicación o almacenamiento de las obras proporcionadas por
                  el Banco de Contenidos, por fuera del formato y modalidad
                  estrictamente necesarios para su exhibición autorizada.
                </li>
                <li>
                  Utilizar obras del Banco de Contenidos para fines distintos a
                  los aprobados por el ICCA, incluyendo su uso en festivales,
                  muestras externas, actividades comerciales, plataformas
                  digitales o cualquier evento no autorizado.
                </li>
                <li>
                  Modificar, editar, cortar, alterar o intervenir las obras
                  audiovisuales sin autorización del titular de los derechos.
                </li>
                <li>
                  Facilitar el acceso o prestar materiales del Banco de
                  Contenidos a terceros no autorizados, incluyendo la cesión de
                  claves, archivos, enlaces o formatos de exhibición.
                </li>
                <li>
                  Proyectar obras en espacios o sedes no declaradas ante el
                  ICCA, o en condiciones técnicas distintas a las autorizadas
                  que comprometan la calidad o seguridad de la reproducción, lo
                  que incluye su uso en festivales, muestras externas,
                  actividades comerciales, plataformas digitales o cualquier
                  evento no autorizado.
                </li>
                <li>
                  Divulgar o difundir públicamente material promocional,
                  informativo o técnico sujeto a confidencialidad o protegido
                  por derechos de autor, salvo autorización del ICCA o del
                  titular correspondiente.
                </li>
                <li>
                  Utilizar la imagen institucional de la REA sin respetar los
                  lineamientos gráficos y comunicacionales autorizados por el
                  ICCA.
                </li>
                <li>
                  Comercializar de manera directa o indirecta cualquier
                  contenido del Banco de Contenidos Audiovisuales.
                </li>
              </ol>

              <p>
                El incumplimiento de las prohibiciones establecidas constituirá
                causal de suspensión o exclusión de la Red, sin perjuicio de las
                acciones civiles, administrativas o penales que procedan
                conforme a la normativa vigente de propiedad intelectual.
              </p>

              <h4>II. INCUMPLIMIENTO Y CONSECUENCIAS</h4>
              <p>
                Reconozco que el incumplimiento de obligaciones y de las
                prohibiciones establecidas en la presente Carta Compromiso, será
                causal de suspensión o exclusión definitiva de la REA, que
                incluye el uso de forma fraudulenta, comercial no autorizada o
                ilícita de los contenidos del Banco de Contenidos Audiovisuales.
                Dicha exclusión procederá sin perjuicio de las acciones civiles,
                administrativas o penales que correspondan conforme a la
                normativa legal vigente de propiedad intelectual o de las
                sanciones que pueda imponer la autoridad nacional competente en
                materia de derechos intelectuales.
              </p>

              <h4>III. ACEPTACIÓN</h4>
              <p>
                Mediante mi aceptación me comprometo al cabal cumplimiento de la
                totalidad de los términos contenidos en esta Carta Compromiso,
                asumiendo que mi incumplimiento puede llevar a la suspensión o
                exclusión según corresponda, de conformidad con lo establecido
                en el &quot;Reglamento para la operación de la Red de Espacios
                Audiovisuales y del Banco de Contenidos&quot;.
              </p>
              <p>
                Adicionalmente, comprendo que el INSTITUTO DE CINE Y CREACIÓN
                AUDIOVISUAL (ICCA) no se responsabiliza por las infracciones a
                la Propiedad Intelectual causadas por quien suscribe.
              </p>
            </div>
          </div>

          <div className={styles.acceptanceRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isAccepted}
                onChange={(e) => setIsAccepted(e.target.checked)}
              />
              <span>
                Confirmo que he leído y acepto los términos y condiciones de la
                Carta Compromiso de la REA.
              </span>
            </label>
          </div>

          <div className={styles.submitSection}>
            {isGeneratingDocument && (
              <p className={styles.generatingMessage}>
                ⏳ Generando y guardando el documento, por favor espera...
              </p>
            )}
            {!isCompleted && (
              <>
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleSubmitAgreement}
                  disabled={!isAccepted || isSubmitting || isGeneratingDocument}
                  className={styles.submitButton}
                >
                  {isSubmitting ? "Enviando..." : "✓ Aceptar y Continuar"}
                </Button>
                <p className={styles.note}>
                  Al aceptar, generaremos automáticamente la carta compromiso
                  con los datos del espacio, la guardaremos en el sistema y
                  podrá descargarla como respaldo.
                </p>
              </>
            )}
            {isCompleted && (
              <div className={styles.completedMessage}>
                <p className={styles.successMessage}>
                  ✓ ¡Acuerdo aceptado y registrado correctamente!
                </p>
                <p className={styles.note}>
                  Tu espacio está ahora bajo revisión y será evaluado por el
                  equipo del ICCA.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push("/home")}
                  className={styles.continueButton}
                >
                  Ir al home
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
