"use client"
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { Barlow_Condensed } from "next/font/google"
import styles from "../../movies/components/MovieInfoSheetSection.module.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

type Props = {
  festivalId: number
  name: string
  type?: string | null
  classification?: string | null
  description?: string | null
  descriptionEn?: string | null
  needs?: string | null
  needsEn?: string | null
  firstEditionYear?: number | null
  editionCount?: number | null
  website?: string | null
  contactName?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  directorNames?: string[]
  directorPhotoUrl?: string | null
  directorFilmography?: string | null
  producerNames?: string[]
  producerPhotoUrl?: string | null
  producerFilmography?: string | null
  companyNames?: string[]
  cityNames?: string[]
  mainVenueName?: string | null
  sections?: Array<{ name: string; competitive?: boolean }>
  posterUrl?: string | null
  posterElementId?: string
  directorPhotoElementId?: string
  producerPhotoElementId?: string
  onClose: () => void
}

const truncate = (value: string, max = 300): string =>
  value.length <= max ? value : `${value.slice(0, max - 1)}...`

const textValue = (value: unknown, fallback = ""): string => {
  const text = String(value || "").trim()
  return text.length ? text : fallback
}

const normalizeLocalAssetPath = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value
  return value
    .split("/")
    .map((segment, idx) => {
      if (!segment) return idx === 0 ? "" : segment
      return encodeURIComponent(decodeURIComponent(segment))
    })
    .join("/")
}

function getImageDataUrl(elementId?: string): string | undefined {
  if (!elementId) return undefined
  const img = typeof window !== "undefined" ? document.getElementById(elementId) as HTMLImageElement | null : null
  if (img && img.complete && img.naturalWidth > 0) {
    try {
      const scale = 2
      const canvas = document.createElement("canvas")
      canvas.width = img.naturalWidth * scale
      canvas.height = img.naturalHeight * scale
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.setTransform(scale, 0, 0, scale, 0, 0)
        ctx.imageSmoothingEnabled = true
        ctx.imageSmoothingQuality = "high"
        ctx.drawImage(img, 0, 0)
        return canvas.toDataURL("image/png")
      }
    } catch {}
  }
  return undefined
}

export function FestivalInfoSheetSection({
  festivalId,
  name,
  type,
  classification: _classification,
  description,
  descriptionEn,
  needs,
  needsEn,
  firstEditionYear,
  editionCount,
  website,
  contactName,
  contactEmail,
  contactPhone,
  directorNames = [],
  directorPhotoUrl,
  directorFilmography,
  producerNames = [],
  producerPhotoUrl,
  producerFilmography,
  companyNames: _companyNames = [],
  cityNames = [],
  mainVenueName,
  sections = [],
  posterUrl,
  posterElementId,
  directorPhotoElementId,
  producerPhotoElementId,
  onClose,
}: Props) {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const previewPagesRef = useRef<HTMLDivElement | null>(null)

  // Generate QR on mount
  useEffect(() => {
    const url = `${typeof window !== "undefined" ? window.location.origin : ""}/public/festivals/${festivalId}`
    QRCode.toDataURL(url, {
      width: 280,
      margin: 1,
      color: { dark: "#ffffff", light: "#0000" },
    }).then(setQrDataUrl).catch(() => {})
  }, [festivalId])

  const resolvedPosterUrl = getImageDataUrl(posterElementId) || posterUrl || undefined
  const resolvedDirectorPhotoUrl = getImageDataUrl(directorPhotoElementId) || directorPhotoUrl || undefined
  const resolvedProducerPhotoUrl = getImageDataUrl(producerPhotoElementId) || producerPhotoUrl || undefined

  const handleDownloadPdf = async () => {
    if (!previewPagesRef.current) return
    setIsDownloadingPdf(true)
    try {
      await document.fonts.load(`500 10pt ${barlowCondensed.style.fontFamily}`)
      // Ensure all images in the preview are loaded before rasterizing pages.
      const images = Array.from(previewPagesRef.current.querySelectorAll("img")) as HTMLImageElement[]
      await Promise.all(
        images.map(
          (img) =>
            new Promise<void>((resolve) => {
              if (img.complete && img.naturalWidth > 0) {
                resolve()
                return
              }
              const done = () => {
                img.removeEventListener("load", done)
                img.removeEventListener("error", done)
                resolve()
              }
              img.addEventListener("load", done, { once: true })
              img.addEventListener("error", done, { once: true })
            }),
        ),
      )
      const pages = Array.from(previewPagesRef.current.querySelectorAll('[data-pdf-page="true"]'))
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" })
      for (let i = 0; i < pages.length; i++) {
        const canvas = await html2canvas(pages[i] as HTMLElement, {
          scale: 4,
          useCORS: true,
          backgroundColor: null,
          logging: false,
        })
        const imgData = canvas.toDataURL("image/png")
        if (i > 0) pdf.addPage()
        const pageWidth = pdf.internal.pageSize.getWidth()
        const pageHeight = pdf.internal.pageSize.getHeight()
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight)
      }
      pdf.save(`${name || "festival"}-ficha-tecnica.pdf`)
    } catch (err) {
      alert("No se pudo generar el PDF. Intenta nuevamente.")
      console.error(err)
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  // ---- Build field values ----
  const technicalInfoParts = [
    type,
    firstEditionYear ? `Desde ${firstEditionYear}` : null,
    editionCount ? `${editionCount} ediciones` : null,
    cityNames.length > 0 ? cityNames.join(", ") : null,
  ].filter(Boolean)
  const technicalInfoText = technicalInfoParts.join("\n")

  const contactBlock = [
    contactName,
    contactPhone,
    contactEmail,
    website,
  ].filter(Boolean).join("\n")

  const descEs = truncate(textValue(description), 300)
  const descEn = truncate(textValue(descriptionEn), 300)
  const combinedDescription = [descEs, descEn].filter(Boolean).join("\n\n")
  const isDenseLeftCol = combinedDescription.length > 200

  const needsEs = textValue(needs)
  const needsEn2 = textValue(needsEn)
  const needsText = [needsEs && truncate(needsEs, 350), needsEn2 && truncate(needsEn2, 350)].filter(Boolean).join("\n\n")

  const sectionsList = sections
    .slice(0, 8)
    .map((s) => `• ${s.name}${s.competitive ? " (Competitiva)" : ""}`)
    .join("\n")

  const directorName = directorNames.join(", ")
  const producerName = producerNames.join(", ")

  // Right column status-box text
  const statusText = [
    type,
    mainVenueName,
    editionCount != null ? `${editionCount} ediciones` : null,
  ].filter(Boolean).join("\n")

  return (
    <div className={styles.previewModal} role="dialog" aria-modal="true" aria-label="Ficha técnica del festival">
      <button
        type="button"
        className={styles.previewBackdrop}
        aria-label="Cerrar"
        onClick={onClose}
      />

      <div className={`${styles.previewWrap} ${barlowCondensed.className}`}>
        <div className={styles.previewActions}>
          <button
            type="button"
            onClick={handleDownloadPdf}
            className={styles.printButton}
            disabled={isDownloadingPdf}
          >
            {isDownloadingPdf ? "Descargando PDF..." : "Descargar ficha"}
          </button>
          <button type="button" onClick={onClose} className={styles.closeButton}>
            Cerrar
          </button>
        </div>

        <div className={styles.previewPages} ref={previewPagesRef}>
          {/* PAGE 1 */}
          <article className={styles.sheetPage} data-pdf-page="true">
            <img className={styles.background} src={normalizeLocalAssetPath("/images/movies-pdf/Fondo 1.png")} alt="" />

            <div className={styles.page1Grid}>
              {/* Left column */}
              <div className={`${styles.page1Column} ${styles.page1ColumnLeft}`}>
                <div className={styles.page1TopLeft}>
                  <div className={styles.qrContainer}>
                    {qrDataUrl && (
                      <div className={styles.qrWrap}>
                        <img className={styles.qr} src={qrDataUrl} alt="QR" />
                      </div>
                    )}
                    <div className={styles.qrUrl}>app.cinemaec.com</div>
                  </div>

                  <div className={styles.titleBox}>
                    <p className={`${styles.field} ${styles.bold} ${styles.titleEs}`}>
                      {truncate(textValue(name), 120)}
                    </p>
                  </div>
                </div>

                <div className={styles.page1Main}>
                  <div className={`${styles.leftCol} ${isDenseLeftCol ? styles.leftColDense : ""}`}>
                    <div className={styles.infoBlock}>
                      <p className={`${styles.field} ${styles.smallField} ${styles.technicalField}`}>
                        {technicalInfoText}
                      </p>
                    </div>

                    <p className={`${styles.field} ${styles.smallField} ${styles.contactField}`}>
                      {contactBlock}
                    </p>

                    <div className={styles.lineH} />

                    <p className={`${styles.field} ${styles.synopsisField}`}>{combinedDescription}</p>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className={`${styles.page1Column} ${styles.page1ColumnRight}`}>
                <div className={styles.page1TopRight}>
                  <div className={styles.statusBox}>
                    <p className={`${styles.field} ${styles.semibold}`}>{statusText}</p>
                  </div>

                  <div className={styles.logoWrap}>
                    <img className={styles.logo} src={normalizeLocalAssetPath("/images/movies-pdf/logo-para-pdf.png")} alt="Logo" />
                  </div>
                </div>

                <div className={styles.page1Main}>
                  {resolvedPosterUrl && (
                    <div className={styles.posterBox}>
                      <img
                        className={styles.coverImage}
                        src={resolvedPosterUrl}
                        alt="Afiche"
                        style={{
                          width: "auto",
                          height: "auto",
                          maxWidth: "100%",
                          maxHeight: "100%",
                          objectFit: "unset",
                          objectPosition: "center",
                          position: "static",
                          display: "block",
                          margin: "0 auto",
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </article>

          {/* PAGE 2 */}
          <article className={styles.sheetPage} data-pdf-page="true">
            <img className={styles.background} src={normalizeLocalAssetPath("/images/movies-pdf/Fondo 2.png")} alt="" />

            <div className={styles.page2Grid}>
              {/* Left: directors / companies */}
              {/* Left: Director */}
              <div className={styles.page2Column}>
                <div className={styles.page2Header}>
                  <div className={styles.page2HeaderText}>
                    <div className={styles.page2RoleLabel}>
                      <span className={styles.page2RoleLabelEs}>Dirección</span>
                      <span className={styles.page2RoleLabelEn}>Direction</span>
                    </div>
                    <p className={styles.page2Name}>{directorName}</p>
                  </div>
                  {resolvedDirectorPhotoUrl ? (
                    <div className={styles.page2PhotoFrame}>
                      <img
                        className={styles.page2Photo}
                        src={resolvedDirectorPhotoUrl}
                        alt="Director"
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <p className={styles.page2Bio}>{truncate(textValue(directorFilmography), 300)}</p>
                <div className={styles.page2Row3}>
                  <p className={styles.page2Row3Label}>Secciones · Sections</p>
                  <p className={styles.page2Row3Text}>{sectionsList}</p>
                </div>
              </div>

              {/* Right: Producer */}
              <div className={styles.page2Column}>
                <div className={styles.page2Header}>
                  <div className={styles.page2HeaderText}>
                    <div className={styles.page2RoleLabel}>
                      <span className={styles.page2RoleLabelEs}>Producción</span>
                      <span className={styles.page2RoleLabelEn}>Production</span>
                    </div>
                    <p className={styles.page2Name}>{producerName}</p>
                  </div>
                  {resolvedProducerPhotoUrl ? (
                    <div className={styles.page2PhotoFrame}>
                      <img
                        className={styles.page2Photo}
                        src={resolvedProducerPhotoUrl}
                        alt="Productor"
                        crossOrigin="anonymous"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />
                    </div>
                  ) : null}
                </div>
                <p className={styles.page2Bio}>{truncate(textValue(producerFilmography), 300)}</p>
                <div className={styles.page2Row3}>
                  <p className={styles.page2Row3Label}>Necesidades · Festival Needs</p>
                  <p className={styles.page2Row3Text}>{needsText}</p>
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}
