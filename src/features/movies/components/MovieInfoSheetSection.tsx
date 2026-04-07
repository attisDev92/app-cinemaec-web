"use client"
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { Barlow_Condensed } from "next/font/google"
import styles from "./MovieInfoSheetSection.module.css"

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
})

type BasicEntity = {
  id?: number
  name?: string | null
}

type ProfessionalData = {
  id?: number
  fullName?: string | null
  name?: string | null
  bio?: string | null
  bioEn?: string | null
  profilePhotoAssetId?: number | null
  profilePhotoAsset?: { url?: string | null } | null
}

type SheetMovie = {
  id: number
  title?: string | null
  titleEn?: string | null
  genre?: string | null
  type?: string | null
  durationMinutes?: number | null
  projectStatus?: string | null
  synopsis?: string | null
  synopsisEn?: string | null
  logLine?: string | null
  logLineEn?: string | null
  logline?: string | null
  loglineEn?: string | null
  projectNeed?: string | null
  projectNeedEn?: string | null
  country?: BasicEntity
  subgenres?: BasicEntity[]
  platforms?: Array<{ link?: string | null }>
  contacts?: Array<{ name?: string | null; role?: string | null; phone?: string | null; email?: string | null }>
  funding?: Array<{ fund?: BasicEntity; year?: number | null }>
  festivalNominations?: Array<{ fund?: BasicEntity; category?: string | null; result?: string | null; year?: number | null }>
  professionals?: Array<{
    cinematicRoleId?: number
    cinematicRole?: BasicEntity
    professional?: ProfessionalData
  }>
  internationalCoproductions?: Array<{ country?: BasicEntity }>
  posterAsset?: { url?: string | null } | null
}

type Props = {
  movie: SheetMovie
  posterElementId?: string
  directorPhotoElementId?: string
  producerPhotoElementId?: string
}

const DESIGN_WIDTH = 1772
const DESIGN_HEIGHT = 1181

type PreviewData = {
  movieUrl: string
  qrDataUrl: string
  posterSrc: string | null
  directorPhotoSrc: string | null
  producerPhotoSrc: string | null
}

const statusLabel = (value?: string | null): string => {
  const map: Record<string, string> = {
    desarrollo: "Desarrollo",
    produccion: "Producción",
    postproduccion: "Postproducción",
    distribucion: "Distribución",
    finalizado: "Finalizado",
  }
  const key = String(value || "").toLowerCase()
  return map[key] || ""
}

const countryStatusLabel = (country?: string | null, status?: string | null): string => {
  const countryText = textValue(country)
  const statusText = statusLabel(status)
  if (countryText && statusText) return `${countryText} - EN ${statusText}`
  if (countryText) return countryText
  if (statusText) return `EN ${statusText}`
  return ""
}

const textValue = (value: unknown, fallback = ""): string => {
  const text = String(value || "").trim()
  return text.length ? text : fallback
}

const truncate = (value: string, max = 300): string => {
  if (value.length <= max) return value
  return `${value.slice(0, max - 1)}...`
}

const pxToX = (value: number): string => `${(value / DESIGN_WIDTH) * 100}%`
const pxToY = (value: number): string => `${(value / DESIGN_HEIGHT) * 100}%`

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

const toAbsolute = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value
  return `${window.location.origin}${value.startsWith("/") ? value : `/${value}`}`
}

const htmlEscape = (value: string): string => {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

const nlToBr = (value: string): string => htmlEscape(value).replaceAll("\n", "<br />")

const normalizeForMatch = (value: unknown): string =>
  String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()

const getImageElementFromDom = (elementId?: string): HTMLImageElement | null => {
  if (!elementId) return null
  const node = document.getElementById(elementId)
  if (node instanceof HTMLImageElement) return node
  return node?.querySelector("img") ?? null
}

const toAbsoluteDomUri = (value?: string | null): string | null => {
  const raw = String(value || "").trim()
  if (!raw) return null
  try {
    return new URL(raw, window.location.origin).toString()
  } catch {
    return raw
  }
}

const fetchAsDataUrl = (src: string): Promise<string | null> =>
  new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      try {
        const c = document.createElement("canvas")
        c.width = img.naturalWidth
        c.height = img.naturalHeight
        const ctx = c.getContext("2d")
        if (!ctx) { resolve(null); return }
        ctx.drawImage(img, 0, 0)
        resolve(c.toDataURL("image/png", 1.0))
      } catch {
        resolve(null)
      }
    }
    img.onerror = () => resolve(null)
    img.src = src
  })

const pickBestImageUri = (image: HTMLImageElement): string | null => {
  const srcset = String(image.getAttribute("srcset") || "").trim()
  if (!srcset) {
    return toAbsoluteDomUri(image.currentSrc || image.src)
  }

  const candidates = srcset
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .map((item) => {
      const [url = "", descriptor = ""] = item.split(/\s+/)
      const widthMatch = descriptor.match(/^(\d+)w$/i)
      const densityMatch = descriptor.match(/^(\d+(?:\.\d+)?)x$/i)
      return {
        url,
        width: widthMatch ? Number(widthMatch[1]) : 0,
        density: densityMatch ? Number(densityMatch[1]) : 0,
      }
    })
    .filter((entry) => entry.url)

  if (!candidates.length) {
    return toAbsoluteDomUri(image.currentSrc || image.src)
  }

  candidates.sort((a, b) => {
    if (b.width !== a.width) return b.width - a.width
    return b.density - a.density
  })
  return toAbsoluteDomUri(candidates[0].url || image.currentSrc || image.src)
}

const waitForRenderedImageUri = async (elementId?: string): Promise<string | null> => {
  const image = getImageElementFromDom(elementId)
  if (!image) return null

  const getUri = () => pickBestImageUri(image)
  if (image.complete) return getUri()

  await new Promise<void>((resolve) => {
    const onDone = () => {
      image.removeEventListener("load", onDone)
      image.removeEventListener("error", onDone)
      resolve()
    }
    image.addEventListener("load", onDone)
    image.addEventListener("error", onDone)
  })

  return getUri()
}

const roleIdOf = (entry?: { cinematicRoleId?: number; cinematicRole?: BasicEntity }): number | undefined => {
  return entry?.cinematicRoleId ?? entry?.cinematicRole?.id
}

const isRoleMatch = (
  entry: { cinematicRoleId?: number; cinematicRole?: BasicEntity },
  role: "director" | "producer",
): boolean => {
  const roleId = roleIdOf(entry)
  if (role === "director" && roleId === 1) return true
  if (role === "producer" && roleId === 2) return true

  const roleName = normalizeForMatch(entry.cinematicRole?.name)
  if (!roleName) return false

  if (role === "director") {
    return roleName.includes("director") || roleName.includes("direccion")
  }

  return roleName.includes("productor") || roleName.includes("produccion") || roleName.includes("producer")
}

const findProfessionalEntry = (
  entries: Array<{ cinematicRoleId?: number; cinematicRole?: BasicEntity; professional?: ProfessionalData }> | undefined,
  role: "director" | "producer",
) => {
  return (entries || []).find((entry) => isRoleMatch(entry, role))
}

type SheetProfessionalEntry = NonNullable<SheetMovie["professionals"]>[number]

type ProfessionalSlot = {
  entry: SheetProfessionalEntry
  roleEs: string
  roleEn: string
}

const professionalIdentityKey = (entry?: SheetProfessionalEntry): string => {
  const professional = entry?.professional
  if (professional?.id) return `id:${professional.id}`

  const normalizedName = normalizeForMatch(professional?.fullName || professional?.name)
  if (normalizedName) return `name:${normalizedName}`

  return `role:${roleIdOf(entry) || "unknown"}`
}

const buildDirectorProducerSlots = (entries?: SheetMovie["professionals"]): ProfessionalSlot[] => {
  const relevant = (entries || []).filter((entry) => isRoleMatch(entry, "director") || isRoleMatch(entry, "producer"))
  if (!relevant.length) return []

  type Group = {
    key: string
    entry: SheetProfessionalEntry
    hasDirector: boolean
    hasProducer: boolean
    firstIndex: number
  }

  const grouped = new Map<string, Group>()

  for (let index = 0; index < relevant.length; index += 1) {
    const entry = relevant[index]
    const key = professionalIdentityKey(entry)
    const hasDirector = isRoleMatch(entry, "director")
    const hasProducer = isRoleMatch(entry, "producer")
    const existing = grouped.get(key)

    if (!existing) {
      grouped.set(key, {
        key,
        entry,
        hasDirector,
        hasProducer,
        firstIndex: index,
      })
      continue
    }

    existing.hasDirector = existing.hasDirector || hasDirector
    existing.hasProducer = existing.hasProducer || hasProducer

    if (!existing.entry?.professional?.profilePhotoAsset?.url && entry?.professional?.profilePhotoAsset?.url) {
      existing.entry = entry
    }
  }

  const groups = Array.from(grouped.values()).sort((a, b) => a.firstIndex - b.firstIndex)
  const selected: Group[] = []

  const mergedRolePerson = groups.find((group) => group.hasDirector && group.hasProducer)
  if (mergedRolePerson) {
    selected.push(mergedRolePerson)
    const second = groups.find((group) => group.key !== mergedRolePerson.key)
    if (second) selected.push(second)
  } else {
    const firstDirector = groups.find((group) => group.hasDirector)
    if (firstDirector) selected.push(firstDirector)

    const firstProducer = groups.find((group) => group.hasProducer && group.key !== selected[0]?.key)
    if (firstProducer) selected.push(firstProducer)

    if (selected.length < 2) {
      const fallback = groups.find((group) => group.key !== selected[0]?.key)
      if (fallback) selected.push(fallback)
    }
  }

  return selected.slice(0, 2).map((group) => {
    if (group.hasDirector && group.hasProducer) {
      return {
        entry: group.entry,
        roleEs: "Dirección / Producción",
        roleEn: "Direction / Production",
      }
    }

    if (group.hasDirector) {
      return {
        entry: group.entry,
        roleEs: "Director/a",
        roleEn: "Direction",
      }
    }

    return {
      entry: group.entry,
      roleEs: "Productor/a",
      roleEn: "Production",
    }
  })
}

const getProfessionalBio = (entry?: { professional?: ProfessionalData }): string => {
  const professional = entry?.professional
  return textValue(professional?.bio || professional?.bioEn)
}

const buildContactBlock = (contacts?: Array<{ name?: string | null; role?: string | null; phone?: string | null; email?: string | null }>): string => {
  const lines = (contacts || [])
    .filter((c) => c?.name || c?.phone || c?.email)
    .map((c) => {
      const parts: string[] = []
      if (c.role) parts.push(c.role)
      const info: string[] = []
      if (c.name) info.push(c.name)
      if (c.phone) info.push(c.phone)
      if (info.length) parts.push(info.join(" · "))
      if (c.email) parts.push(c.email)
      return parts.join("\n")
    })
  return lines.join("\n")
}

const buildPrintHtml = (movie: SheetMovie, data: PreviewData, autoPrint = true): string => {
  const professionalSlots = buildDirectorProducerSlots(movie.professionals)
  const firstSlot = professionalSlots[0]
  const secondSlot = professionalSlots[1]

  const subgenres = (movie.subgenres || [])
    .map((item) => textValue(item?.name, ""))
    .filter(Boolean)
    .slice(0, 2)
    .join(", ")

  const coproductionCountries = (movie.internationalCoproductions || [])
    .map((item) => textValue(item?.country?.name, ""))
    .filter(Boolean)
    .join(", ")

  const directorRoleEs = firstSlot?.roleEs || "Director/a"
  const directorRoleEn = firstSlot?.roleEn || "Direction"
  const producerRoleEs = secondSlot?.roleEs || "Productor/a"
  const producerRoleEn = secondSlot?.roleEn || "Production"

  const directorName = textValue(firstSlot?.entry?.professional?.fullName || firstSlot?.entry?.professional?.name)
  const producerName = textValue(secondSlot?.entry?.professional?.fullName || secondSlot?.entry?.professional?.name)
  const directorBio = getProfessionalBio(firstSlot?.entry)
  const producerBio = getProfessionalBio(secondSlot?.entry)
  const directorBioText = truncate(directorBio, 400)
  const producerBioText = truncate(producerBio, 400)
  const durationText = movie.durationMinutes ? `${movie.durationMinutes} min` : ""
  const locationText = [textValue(movie.country?.name), coproductionCountries].filter(Boolean).join(" y ")
  const technicalInfoText = [textValue(movie.type), textValue(movie.genre), subgenres, durationText, locationText]
    .filter(Boolean)
    .join("\n")

  const needsEs = String(movie.projectNeed || "").trim()
  const needsEn = String(movie.projectNeedEn || "").trim()
  const needsText = needsEs || needsEn
    ? [needsEs && truncate(needsEs, 350), needsEn && truncate(needsEn, 350)].filter(Boolean).join("\n\n")
    : ""

  const fundingItems = (movie.funding || [])
    .slice(0, 5)
    .map((f) => `• ${textValue(f.fund?.name, "Fondo")}${f.year ? ` (${f.year})` : ""}`)
    .join("\n")
  const awardItems = (movie.festivalNominations || [])
    .slice(0, 5)
    .map((n) => `• ${textValue(n.fund?.name, "Festival")}${n.year ? ` (${n.year})` : ""}${n.result ? ` — ${n.result}` : ""}`)
    .join("\n")
  const awardsText = [fundingItems, awardItems].filter(Boolean).join("\n")

  const loglineEs = String(movie.logLine ?? movie.logline ?? "").trim()
  const loglineEn = String(movie.logLineEn ?? movie.loglineEn ?? "").trim()
  const synopsisEs = String(movie.synopsis || "").trim()
  const synopsisEn = String(movie.synopsisEn || "").trim()
  const sheetTextEs = truncate((loglineEs.length >= 200 ? loglineEs : synopsisEs) || loglineEs, 300)
  const sheetTextEn = truncate((loglineEn.length >= 200 ? loglineEn : synopsisEn) || loglineEn, 300)
  const combinedLogline = [sheetTextEs, sheetTextEn].filter(Boolean).join("\n\n")
  const isDenseLeftCol = combinedLogline.length > 200

  const printCss = `
    @page { size: 150mm 100mm landscape; margin: 0; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: "Barlow Condensed", sans-serif; background: #111; }
    .sheet-page { position: relative; width: 150mm; height: 100mm; overflow: hidden; border-radius: 0; page-break-after: always; }
    .sheet-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
    .sheet-layer { position: absolute; inset: 0; }
    .field { position: absolute; color: #fff; font-size: 8.2pt; line-height: 1.12; font-weight: 500; white-space: pre-wrap; overflow: hidden; }
    .field.bold { font-weight: 700; }
    .field.semibold { font-weight: 600; }
    .field.title-es { font-size: 18.59pt; line-height: 0.96; overflow: visible; padding-bottom: 0.08em; }
    .field.title-en { font-size: 11pt; line-height: 0.96; overflow: visible; padding-bottom: 0.08em; }
    .field.small { font-size: 7.4pt; line-height: 1.08; }
    .divider-h { position: absolute; height: 2px; background: rgba(255,255,255,0.95); }
    .divider-v { position: absolute; width: 2px; background: rgba(255,255,255,0.95); }
    .page1-grid { position: absolute; inset: ${pxToY(40)} 0 ${pxToY(40)} ${pxToX(60)}; display: grid; grid-template-columns: ${(75 - 60 / DESIGN_WIDTH * 150).toFixed(2)}mm minmax(0, 1fr); column-gap: 0; }
    .page1-column { --status-fs: 8.2pt; --status-lh: 1.12; --status-gap: 2pt; --logo-h: calc((3 * 1em * var(--status-lh)) + (2 * var(--status-gap))); display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: auto 1fr; row-gap: ${pxToY(26)}; min-height: 0; }
    .page1-column-left { min-width: 0; }
    .page1-column-right { --poster-width: calc(100% - var(--logo-h) - ${pxToX(14)}); min-width: 0; row-gap: 0; }
    .page1-top-left { display: grid; grid-template-columns: 90px ${pxToX(22)} minmax(0, 1fr); align-items: end; column-gap: ${pxToX(14)}; min-width: 0; min-height: 0; }
    .page1-top-left .qr-container { grid-column: 1; }
    .page1-top-left .title-box { grid-column: 3; width: 100%; align-self: end; justify-content: start; }
    .qr-container { position: relative; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; width: 100%; height: 100%; gap: 0; }
    .qr-wrap { align-self: start; justify-self: center; width: 100%; height: 100%; margin-top: 0; max-width: 100%; max-height: 100%; overflow: hidden; }
    .qr-url { position: absolute; top: calc(100% + 2px); left: 50%; transform: translateX(-50%); font-size: 5.5pt; line-height: 1; font-weight: 600; color: #fff; text-align: center; width: fit-content; letter-spacing: 0.3px; white-space: nowrap; }
    .page1-top-right { display: flex; justify-content: space-between; align-items: start; justify-self: center; width: var(--poster-width); min-width: 0; min-height: 0; }
    .title-box { min-width: 0; display: grid; grid-template-rows: auto auto; row-gap: ${pxToY(6)}; align-self: start; }
    .status-box { min-width: 0; align-self: start; display: grid; row-gap: var(--status-gap); font-size: var(--status-fs); line-height: var(--status-lh); }
    .page1-column-right .status-box { width: auto; max-width: calc(100% - var(--logo-h) - ${pxToX(14)}); height: var(--logo-h); align-content: start; font-size: calc(var(--status-fs) * 1.48); }
    .status-box .field { font-size: 1em; line-height: inherit; text-transform: uppercase; }
    .status-box .type-genre { font-size: 0.99em; }
    .logo-wrap { align-self: start; justify-self: end; display: flex; justify-content: flex-end; width: var(--logo-h); height: var(--logo-h); font-size: var(--status-fs); }
    .page1-main { min-height: 0; }
    .page1-column-left .page1-main { display: grid; align-items: stretch; margin-right: 0; }
    .page1-column-right .page1-main { display: grid; justify-items: center; overflow: hidden; }
    .left-col { --left-divider-x: -68px; --left-content-gap: 6px; --left-status-divider-height: 170px; position: relative; align-self: stretch; display: grid; grid-template-rows: auto auto 1px auto; align-content: end; row-gap: ${pxToY(18)}; min-height: 100%; height: 100%; margin-left: calc(102px + var(--left-divider-x) + var(--left-content-gap)); margin-top: 0; margin-bottom: 4pt; padding-left: 0; }
    .left-col.dense { row-gap: ${pxToY(10)}; margin-bottom: 8pt; }
    .left-col::before { content: ""; position: absolute; left: calc(0px - var(--left-content-gap)); top: auto; bottom: 0; height: var(--left-status-divider-height); width: 1px; background: rgba(255,255,255,0.5); }
    .project-status-vertical { position: absolute; left: calc(-34px - var(--left-content-gap)); bottom: 0; transform: rotate(180deg); writing-mode: vertical-rl; text-orientation: mixed; font-size: 32pt; font-style: italic; font-weight: 300; letter-spacing: 0.06em; text-transform: uppercase; color: rgba(255,255,255,0.78); line-height: 1; white-space: nowrap; pointer-events: none; }
    .project-status-vertical::after { content: none; }
    .left-col .field { font-size: 9.02pt; }
    .left-col .field.small { font-size: 8.14pt; margin-left: 0; width: 100%; overflow: visible; }
    .left-col.dense .field.small { font-size: 7.6pt; line-height: 1.02; }
    .technical-field, .contact-field { overflow: visible; overflow-wrap: anywhere; word-break: break-word; }
    .synopsis-field { height: auto; overflow: visible; align-self: start; margin-left: 0; width: 100%; }
    .left-col .synopsis-field { font-size: 8pt; line-height: 1; }
    .poster-box { justify-self: center; align-self: start; position: relative; width: var(--poster-width); max-width: 100%; max-height: 100%; aspect-ratio: 2 / 3; border-radius: 0; overflow: hidden; height: auto; }
    .cover-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
    .line-h { height: 1px; background: rgba(255,255,255,0.5); margin-left: 0; width: 100%; }
    .line-v { width: 2px; background: rgba(255,255,255,0.95); justify-self: start; }
    .fixed-label { color: #fff; font-size: 7.1pt; line-height: 1.05; font-weight: 600; white-space: pre-wrap; }
    .cover-image { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; }
    .face-image { position: absolute; object-fit: cover; border-radius: 18px; }
    .logo { position: relative; display: block; object-fit: contain; object-position: right top; width: 100%; height: 100%; aspect-ratio: 1 / 1; }
    .qr { position: relative; display: block; width: 100%; height: 100%; max-width: 100%; max-height: 100%; aspect-ratio: 1 / 1; object-fit: contain; object-position: right top; }
    .sheet-page:last-child { page-break-after: auto; }
    .page2-grid { position: absolute; inset: ${pxToY(40)} ${pxToX(60)} ${pxToY(40)} ${pxToX(60)}; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); column-gap: ${pxToX(60)}; align-items: stretch; z-index: 3; }
    .page2-column { display: grid; grid-template-rows: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr); row-gap: ${pxToY(14)}; min-height: 0; min-width: 0; height: 100%; }
    .page2-header { grid-row: 1; display: grid; grid-template-columns: 2fr 1.4fr; column-gap: 3%; min-height: 0; }
    .page2-header-text { grid-column: 1; display: grid; grid-template-rows: auto auto; row-gap: 0.25em; align-content: end; min-height: 0; }
    .page2-role-label { display: flex; flex-direction: column; gap: 0.15em; }
    .page2-role-label-es { font-size: 14pt; font-weight: 700; text-transform: uppercase; color: #fff; line-height: 1; letter-spacing: 0.04em; }
    .page2-role-label-en { font-size: 8.5pt; font-weight: 400; font-style: italic; color: rgba(255,255,255,0.6); line-height: 1; }
    .page2-name { font-size: 10.5pt; font-weight: 600; color: #fff; line-height: 1.15; white-space: pre-wrap; margin: 0; }
    .page2-photo-frame { grid-column: 2; position: relative; align-self: stretch; justify-self: end; width: auto; height: 100%; aspect-ratio: 1 / 1; max-width: 100%; max-height: 100%; border-radius: 2.3%; min-height: 0; overflow: hidden; display: block; z-index: 1; }
    .page2-photo { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; }
    .page2-photo-placeholder { grid-column: 2; justify-self: end; width: auto; height: 100%; aspect-ratio: 1 / 1; max-width: 100%; max-height: 100%; min-height: 0; }
    .page2-bio { grid-row: 2; font-size: 8pt; color: #fff; line-height: 1; white-space: pre-wrap; overflow: hidden; align-self: start; min-height: 0; margin: 0; }
    .page2-row3 { grid-row: 3; overflow: hidden; min-height: 0; display: flex; flex-direction: column; gap: 0.18em; }
    .page2-row3-label { font-size: 8.5pt; font-weight: 700; text-transform: uppercase; color: rgba(255,255,255,0.55); letter-spacing: 0.06em; line-height: 1; margin: 0 0 0.25em; }
    .page2-row3-text { font-size: 8pt; color: #fff; line-height: 1; white-space: pre-wrap; overflow: hidden; flex: 1; margin: 0; }
    .page2-divider { height: 1px; background: rgba(255,255,255,0.25); margin: 0.2em 0; flex-shrink: 0; }
  `

  return `<!doctype html>
  <html lang="es">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ficha ${htmlEscape(textValue(movie.title, `pelicula-${movie.id}`))}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;500;600;700&display=swap" rel="stylesheet" />
      <style>${printCss}</style>
    </head>
    <body>
      <section class="sheet-page">
        <img class="sheet-bg" src="${toAbsolute(normalizeLocalAssetPath("/images/movies-pdf/Fondo 1.png"))}" alt="" />
        <div class="sheet-layer page1-grid">
          <div class="page1-column page1-column-left">
            <div class="page1-top-left">
              <div class="qr-container">
                <div class="qr-wrap"><img class="qr" src="${data.qrDataUrl}" alt="QR" /></div>
                <div class="qr-url">app.cinemaec.com</div>
              </div>
              <div class="title-box">
                <div class="field bold title-es">${nlToBr(truncate(textValue(movie.title), 120))}</div>
                <div class="field title-en">${nlToBr(truncate(textValue(movie.titleEn, ""), 120))}</div>
              </div>
            </div>

            <div class="page1-main">
              <div class="left-col${isDenseLeftCol ? " dense" : ""}">
                <div class="project-status-vertical">${nlToBr(statusLabel(movie.projectStatus))}</div>
                <div style="display:grid;grid-template-columns:1fr;">
                  <div class="field small technical-field">${nlToBr(technicalInfoText)}</div>
                </div>
                <div class="field small contact-field">${nlToBr(buildContactBlock(movie.contacts))}</div>
                <div class="line-h"></div>
                <div class="field synopsis-field">${nlToBr(combinedLogline)}</div>
              </div>
            </div>
          </div>

          <div class="page1-column page1-column-right">
            <div class="page1-top-right">
              <div class="status-box">
                <div class="field semibold">${nlToBr(countryStatusLabel(movie.country?.name, movie.projectStatus))}</div>
                <div class="field semibold type-genre">${nlToBr(`${textValue(movie.type)} - ${textValue(movie.genre)}`)}</div>
              </div>
              <div class="logo-wrap">
                <img class="logo" src="${toAbsolute(normalizeLocalAssetPath("/images/movies-pdf/logo-para-pdf.png"))}" alt="Logo" />
              </div>
            </div>

            <div class="page1-main">
              <div class="poster-box">
                ${data.posterSrc ? `<img class="cover-image" src="${data.posterSrc}" alt="Afiche" />` : ""}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="sheet-page">
        <img class="sheet-bg" src="${toAbsolute(normalizeLocalAssetPath("/images/movies-pdf/Fondo 2.png"))}" alt="" />
        <div class="sheet-layer page2-grid">
          <div class="page2-column">
            <div class="page2-header">
              <div class="page2-header-text">
                <div class="page2-role-label">
                  <span class="page2-role-label-es">Director/a</span>
                  <span class="page2-role-label-en">Direction</span>
                </div>
                <div class="page2-name">${nlToBr(directorName)}</div>
              </div>
              ${data.directorPhotoSrc ? `<div class="page2-photo-frame"><img class="page2-photo" src="${htmlEscape(toAbsolute(data.directorPhotoSrc))}" alt="Director" crossorigin="anonymous" /></div>` : `<div class="page2-photo-placeholder"></div>`}
            </div>
            <div class="page2-bio">${nlToBr(directorBioText)}</div>
            <div class="page2-row3">
              <div class="page2-row3-label">Fondos y Premios · Funds &amp; Awards</div>
              <div class="page2-row3-text">${nlToBr(awardsText)}</div>
            </div>
          </div>
          <div class="page2-column">
            <div class="page2-header">
              <div class="page2-header-text">
                <div class="page2-role-label">
                  <span class="page2-role-label-es">Productor/a</span>
                  <span class="page2-role-label-en">Production</span>
                </div>
                <div class="page2-name">${nlToBr(producerName)}</div>
              </div>
              ${data.producerPhotoSrc ? `<div class="page2-photo-frame"><img class="page2-photo" src="${htmlEscape(toAbsolute(data.producerPhotoSrc))}" alt="Productor" crossorigin="anonymous" /></div>` : `<div class="page2-photo-placeholder"></div>`}
            </div>
            <div class="page2-bio">${nlToBr(producerBioText)}</div>
            <div class="page2-row3">
              <div class="page2-row3-label">Necesidades · Project Needs</div>
              <div class="page2-row3-text">${nlToBr(needsText)}</div>
            </div>
          </div>
        </div>
      </section>

      ${autoPrint
        ? `<script>
        window.addEventListener("load", () => {
          setTimeout(() => window.print(), 220)
        })
      </script>`
        : ""}
    </body>
  </html>`
}

void buildPrintHtml

export function MovieInfoSheetSection({
  movie,
  posterElementId = "public-movie-poster",
  directorPhotoElementId = "public-director-photo",
  producerPhotoElementId = "public-producer-photo",
}: Props) {
  const [isPreparing, setIsPreparing] = useState(false)
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false)
  const [previewData, setPreviewData] = useState<PreviewData | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const previewPagesRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setPreviewData(null)
    setIsPreviewOpen(false)
  }, [movie.id])

  const handlePreview = async () => {
    try {
      setIsPreparing(true)

      await document.fonts.load(`500 10pt ${barlowCondensed.style.fontFamily}`)

      const movieUrl = `${window.location.origin}/public/catalog/${movie.id}`
      const qrDataUrl = await QRCode.toDataURL(movieUrl, {
        width: 280,
        margin: 1,
        color: { dark: "#ffffff", light: "#0000" },
      })

      const [domPosterSrc, domDirectorPhoto, domProducerPhoto] = await Promise.all([
        waitForRenderedImageUri(posterElementId),
        waitForRenderedImageUri(directorPhotoElementId),
        waitForRenderedImageUri(producerPhotoElementId),
      ])

      const posterSrc = toAbsoluteDomUri(domPosterSrc)
      const resolvedDirectorPhoto = toAbsoluteDomUri(domDirectorPhoto)
      const resolvedProducerPhoto = toAbsoluteDomUri(domProducerPhoto)

      setPreviewData({
        movieUrl,
        qrDataUrl,
        posterSrc,
        directorPhotoSrc: resolvedDirectorPhoto,
        producerPhotoSrc: resolvedProducerPhoto,
      })
      setIsPreviewOpen(true)
    } catch (error) {
      console.error("Error preparando ficha para impresión:", error)
      alert("No se pudo preparar la ficha. Verifica que los recursos estén disponibles.")
    } finally {
      setIsPreparing(false)
    }
  }

  const handleDownloadPdf = async () => {
    if (!previewData) return
    if (!previewPagesRef.current) {
      alert("No se pudo acceder a la previsualización para exportar PDF.")
      return
    }

    try {
      setIsDownloadingPdf(true)

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve())
        })
      })

      if ("fonts" in document) {
        await document.fonts.ready
      }

      const pageElements = Array.from(previewPagesRef.current.querySelectorAll<HTMLElement>("[data-pdf-page='true']"))
      if (!pageElements.length) {
        throw new Error("No se encontraron páginas para exportar")
      }

      // Pre-fetch all sheet images as crisp data URLs so html2canvas gets true high-res pixels
      const allSheetImages = Array.from(
        previewPagesRef.current.querySelectorAll<HTMLImageElement>(
          "img[class*='coverImage'], img[class*='page2Photo']",
        ),
      )
      const dataUrlBySrc = new Map<string, string>()
      for (const imgEl of allSheetImages) {
        const src = pickBestImageUri(imgEl)
        if (src && !dataUrlBySrc.has(src)) {
          const dataUrl = await fetchAsDataUrl(src)
          if (dataUrl) dataUrlBySrc.set(src, dataUrl)
        }
      }

      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [150, 100],
        compress: false,
      })

      const pdfScale = Math.max(4, Math.ceil(window.devicePixelRatio || 1) * 2)

      for (let index = 0; index < pageElements.length; index += 1) {
        const page = pageElements[index]
        const canvas = await html2canvas(page, {
          scale: pdfScale,
          useCORS: true,
          allowTaint: false,
          backgroundColor: null,
          logging: false,
          onclone: (clonedDoc) => {
            const statusNodes = clonedDoc.querySelectorAll<HTMLElement>("[class*='projectStatusVertical']")
            for (const node of statusNodes) {
              node.style.writingMode = "horizontal-tb"
              node.style.textOrientation = "mixed"
              node.style.transformOrigin = "left bottom"
              node.style.transform = "rotate(-90deg)"
              node.style.left = "calc(-14px - var(--left-content-gap))"
              node.style.bottom = "0"
              node.style.letterSpacing = "0.03em"
            }

            const fitImages = clonedDoc.querySelectorAll<HTMLImageElement>(
              "img[class*='coverImage'], img[class*='page2Photo']",
            )

            for (const imageNode of fitImages) {
              try {
                const src = pickBestImageUri(imageNode)
                // Prefer pre-fetched data URL for maximum quality
                const finalSrc = (src ? dataUrlBySrc.get(src) : null) || src
                if (!finalSrc) {
                  imageNode.style.display = "none"
                  continue
                }

                const div = clonedDoc.createElement("div")
                div.className = imageNode.className
                div.style.backgroundImage = `url("${finalSrc}")`
                div.style.backgroundSize = "cover"
                div.style.backgroundPosition = "center"
                div.style.backgroundRepeat = "no-repeat"
                div.style.position = "absolute"
                div.style.inset = "0"
                div.style.width = "100%"
                div.style.height = "100%"
                div.style.display = "block"

                imageNode.replaceWith(div)
              } catch (err) {
                console.warn("Image replacement failed:", err)
              }
            }
          },
        })

        if (index > 0) {
          pdf.addPage([150, 100], "landscape")
        }

        const imageData = canvas.toDataURL("image/png", 1.0)
        pdf.addImage(imageData, "PNG", 0, 0, 150, 100, undefined, "NONE")
      }

      const safeTitle = textValue(movie.title, `pelicula-${movie.id}`)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase()

      pdf.save(`${safeTitle || `pelicula-${movie.id}`}.pdf`)

    } catch (error) {
      console.error("Error descargando ficha en PDF:", error)
      alert("No se pudo descargar la ficha en PDF. Intenta nuevamente.")
    } finally {
      setIsDownloadingPdf(false)
    }
  }

  const professionalSlots = buildDirectorProducerSlots(movie.professionals)
  const firstSlot = professionalSlots[0]
  const secondSlot = professionalSlots[1]

  const subgenres = (movie.subgenres || [])
    .map((item) => textValue(item?.name, ""))
    .filter(Boolean)
    .slice(0, 2)
    .join(", ")

  const coproductionCountries = (movie.internationalCoproductions || [])
    .map((item) => textValue(item?.country?.name, ""))
    .filter(Boolean)
    .join(", ")

  const directorRoleEs = firstSlot?.roleEs || "Director/a"
  const directorRoleEn = firstSlot?.roleEn || "Direction"
  const producerRoleEs = secondSlot?.roleEs || "Productor/a"
  const producerRoleEn = secondSlot?.roleEn || "Production"

  const directorName = textValue(firstSlot?.entry?.professional?.fullName || firstSlot?.entry?.professional?.name)
  const producerName = textValue(secondSlot?.entry?.professional?.fullName || secondSlot?.entry?.professional?.name)
  const directorBio = getProfessionalBio(firstSlot?.entry)
  const producerBio = getProfessionalBio(secondSlot?.entry)
  const directorBioText = truncate(directorBio, 400)
  const producerBioText = truncate(producerBio, 400)
  const durationText = movie.durationMinutes ? `${movie.durationMinutes} min` : ""
  const locationText = [textValue(movie.country?.name), coproductionCountries].filter(Boolean).join(" y ")
  const technicalInfoText = [textValue(movie.type), textValue(movie.genre), subgenres, durationText, locationText]
    .filter(Boolean)
    .join("\n")

  const needsEs = String(movie.projectNeed || "").trim()
  const needsEn = String(movie.projectNeedEn || "").trim()
  const needsText = needsEs || needsEn
    ? [needsEs && truncate(needsEs, 350), needsEn && truncate(needsEn, 350)].filter(Boolean).join("\n\n")
    : ""

  const fundingItems = (movie.funding || [])
    .slice(0, 5)
    .map((f) => `• ${textValue(f.fund?.name, "Fondo")}${f.year ? ` (${f.year})` : ""}`)
    .join("\n")
  const awardItems = (movie.festivalNominations || [])
    .slice(0, 5)
    .map((n) => `• ${textValue(n.fund?.name, "Festival")}${n.year ? ` (${n.year})` : ""}${n.result ? ` — ${n.result}` : ""}`)
    .join("\n")
  const awardsText = [fundingItems, awardItems].filter(Boolean).join("\n")

  const loglineEs = String(movie.logLine ?? movie.logline ?? "").trim()
  const loglineEn = String(movie.logLineEn ?? movie.loglineEn ?? "").trim()
  const synopsisEs = String(movie.synopsis || "").trim()
  const synopsisEn = String(movie.synopsisEn || "").trim()
  const sheetTextEs = truncate((loglineEs.length >= 200 ? loglineEs : synopsisEs) || loglineEs, 300)
  const sheetTextEn = truncate((loglineEn.length >= 200 ? loglineEn : synopsisEn) || loglineEn, 300)
  const combinedLogline = [sheetTextEs, sheetTextEn].filter(Boolean).join("\n\n")
  const isDenseLeftCol = combinedLogline.length > 200

  return (
    <section className={`${styles.sheetSection} ${barlowCondensed.className}`}>
      <button type="button" onClick={handlePreview} disabled={isPreparing} className={styles.downloadButton}>
        {isPreparing ? "Preparando previsualización..." : "Ver ficha técnica"}
      </button>

      {previewData && isPreviewOpen && (
        <div className={styles.previewModal} role="dialog" aria-modal="true" aria-label="Previsualización de ficha">
          <button
            type="button"
            className={styles.previewBackdrop}
            aria-label="Cerrar previsualización"
            onClick={() => setIsPreviewOpen(false)}
          />

          <div className={styles.previewWrap}>
            <div className={styles.previewActions}>
                <button type="button" onClick={handleDownloadPdf} className={styles.printButton} disabled={isDownloadingPdf}>
                  {isDownloadingPdf ? "Descargando PDF..." : "Descargar ficha"}
              </button>
              <button type="button" onClick={() => setIsPreviewOpen(false)} className={styles.closeButton}>
                Cerrar
              </button>
            </div>

            <div
              className={styles.previewPages}
              ref={previewPagesRef}
            >
            <article className={styles.sheetPage} data-pdf-page="true">
              <img className={styles.background} src={normalizeLocalAssetPath("/images/movies-pdf/Fondo 1.png")} alt="Plantilla página 1" />

              <div className={styles.page1Grid}>
                <div className={`${styles.page1Column} ${styles.page1ColumnLeft}`}>
                  <div className={styles.page1TopLeft}>
                    <div className={styles.qrContainer}>
                      <div className={styles.qrWrap}>
                        <img className={styles.qr} src={previewData.qrDataUrl} alt="QR" />
                      </div>
                      <div className={styles.qrUrl}>app.cinemaec.com</div>
                    </div>

                    <div className={styles.titleBox}>
                      <p className={`${styles.field} ${styles.bold} ${styles.titleEs}`}>{truncate(textValue(movie.title), 120)}</p>
                      <p className={`${styles.field} ${styles.titleEn}`}>{truncate(textValue(movie.titleEn, ""), 120)}</p>
                    </div>
                  </div>

                  <div className={styles.page1Main}>
                    <div className={`${styles.leftCol} ${isDenseLeftCol ? styles.leftColDense : ""}`}>
                      <p className={styles.projectStatusVertical}>{statusLabel(movie.projectStatus)}</p>
                      <div className={styles.infoBlock}>
                        <p className={`${styles.field} ${styles.smallField} ${styles.technicalField}`}>
                          {technicalInfoText}
                        </p>
                      </div>

                      <p className={`${styles.field} ${styles.smallField} ${styles.contactField}`}>
                        {buildContactBlock(movie.contacts)}
                      </p>

                      <div className={styles.lineH} />

                      <p className={`${styles.field} ${styles.synopsisField}`}>{combinedLogline}</p>
                    </div>
                  </div>
                </div>

                <div className={`${styles.page1Column} ${styles.page1ColumnRight}`}>
                  <div className={styles.page1TopRight}>
                    <div className={styles.statusBox}>
                      <p className={`${styles.field} ${styles.semibold}`}>{countryStatusLabel(movie.country?.name, movie.projectStatus)}</p>
                      <p className={`${styles.field} ${styles.semibold} ${styles.typeGenre}`}>{`${textValue(movie.type)} - ${textValue(movie.genre)}`}</p>
                    </div>

                    <div className={styles.logoWrap}>
                      <img className={styles.logo} src={normalizeLocalAssetPath("/images/movies-pdf/logo-para-pdf.png")} alt="Logo" />
                    </div>
                  </div>

                  <div className={styles.page1Main}>
                    <div className={styles.posterBox}>
                      {previewData.posterSrc && <img className={styles.coverImage} src={previewData.posterSrc} alt="Afiche" crossOrigin="anonymous" />}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            <article className={styles.sheetPage} data-pdf-page="true">
              <img className={styles.background} src={normalizeLocalAssetPath("/images/movies-pdf/Fondo 2.png")} alt="Plantilla página 2" />

              <div className={styles.page2Grid}>
                <div className={styles.page2Column}>
                  <div className={styles.page2Header}>
                    <div className={styles.page2HeaderText}>
                      <div className={styles.page2RoleLabel}>
                        <span className={styles.page2RoleLabelEs}>{directorRoleEs}</span>
                        <span className={styles.page2RoleLabelEn}>{directorRoleEn}</span>
                      </div>
                      <p className={styles.page2Name}>{directorName}</p>
                    </div>
                    {firstSlot && previewData.directorPhotoSrc
                      ? <div className={styles.page2PhotoFrame}><img className={styles.page2Photo} src={previewData.directorPhotoSrc} alt="Director" crossOrigin="anonymous" /></div>
                      : <div className={styles.page2PhotoPlaceholder} />}
                  </div>
                  <p className={styles.page2Bio}>{directorBioText}</p>
                  <div className={styles.page2Row3}>
                    <p className={styles.page2Row3Label}>Fondos y Premios · Funds &amp; Awards</p>
                    <p className={styles.page2Row3Text}>{awardsText}</p>
                  </div>
                </div>

                <div className={styles.page2Column}>
                  <div className={styles.page2Header}>
                    <div className={styles.page2HeaderText}>
                      <div className={styles.page2RoleLabel}>
                        <span className={styles.page2RoleLabelEs}>{producerRoleEs}</span>
                        <span className={styles.page2RoleLabelEn}>{producerRoleEn}</span>
                      </div>
                      <p className={styles.page2Name}>{producerName}</p>
                    </div>
                    {secondSlot && previewData.producerPhotoSrc
                      ? <div className={styles.page2PhotoFrame}><img className={styles.page2Photo} src={previewData.producerPhotoSrc} alt="Productor" crossOrigin="anonymous" /></div>
                      : <div className={styles.page2PhotoPlaceholder} />}
                  </div>
                  <p className={styles.page2Bio}>{producerBioText}</p>
                  <div className={styles.page2Row3}>
                    <p className={styles.page2Row3Label}>Necesidades · Project Needs</p>
                    <p className={styles.page2Row3Text}>{needsText}</p>
                  </div>
                </div>
              </div>
            </article>
            </div>
          </div>
        </div>
      )}

    </section>
  )
}
