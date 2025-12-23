/**
 * Mapeo de nombres de campos a etiquetas legibles en español
 * Se utiliza en el panel de admin, observaciones y edición de espacios
 */

export interface FieldInfo {
  value: string
  label: string
  section: string
}

export const FIELD_LABELS: FieldInfo[] = [
  // Información Básica
  { value: "name", label: "Nombre del espacio", section: "Básica" },
  { value: "type", label: "Tipo de espacio", section: "Básica" },
  { value: "province", label: "Provincia", section: "Básica" },
  { value: "city", label: "Ciudad", section: "Básica" },
  { value: "address", label: "Dirección", section: "Básica" },
  { value: "email", label: "Email del espacio", section: "Básica" },
  { value: "phone", label: "Teléfono", section: "Básica" },
  { value: "description", label: "Descripción", section: "Básica" },
  { value: "target", label: "Público objetivo", section: "Básica" },
  { value: "mainActivity", label: "Actividad principal", section: "Básica" },
  { value: "otherActivities", label: "Otras actividades", section: "Básica" },
  {
    value: "commercialActivities",
    label: "Actividades comerciales",
    section: "Básica",
  },

  // Personal Administrativo
  {
    value: "managerName",
    label: "Nombre del responsable",
    section: "Personal administrativo",
  },
  {
    value: "managerPhone",
    label: "Teléfono del responsable",
    section: "Personal administrativo",
  },
  {
    value: "managerEmail",
    label: "Email del responsable",
    section: "Personal administrativo",
  },

  // Personal Técnico
  {
    value: "technicianInCharge",
    label: "Técnico a cargo",
    section: "Personal técnico",
  },
  {
    value: "technicianRole",
    label: "Rol del técnico",
    section: "Personal técnico",
  },
  {
    value: "technicianPhone",
    label: "Teléfono del técnico",
    section: "Personal técnico",
  },
  {
    value: "technicianEmail",
    label: "Email del técnico",
    section: "Personal técnico",
  },

  // Infraestructura
  { value: "capacity", label: "Capacidad", section: "Infraestructura" },
  {
    value: "projectionEquipment",
    label: "Equipos de proyección",
    section: "Infraestructura",
  },
  {
    value: "soundEquipment",
    label: "Equipos de sonido",
    section: "Infraestructura",
  },
  { value: "screen", label: "Pantalla", section: "Infraestructura" },

  // Servicios
  {
    value: "boxofficeRegistration",
    label: "Registro de taquilla",
    section: "Servicios",
  },
  {
    value: "accessibilities",
    label: "Accesibilidades",
    section: "Servicios",
  },
  { value: "services", label: "Servicios", section: "Servicios" },
  {
    value: "operatingHistory",
    label: "Historial operativo",
    section: "Servicios",
  },

  // Archivos
  { value: "logoId", label: "Logo", section: "Archivos" },
  { value: "photosId", label: "Fotos", section: "Archivos" },
  {
    value: "ciDocument",
    label: "Documento de identidad",
    section: "Archivos",
  },
  { value: "rucDocument", label: "Documento RUC", section: "Archivos" },
  {
    value: "managerDocument",
    label: "Documento del responsable",
    section: "Archivos",
  },
  { value: "serviceBill", label: "Factura de servicio", section: "Archivos" },
  {
    value: "operatingLicense",
    label: "Licencia de operación",
    section: "Archivos",
  },
]

/**
 * Obtiene la etiqueta legible de un campo
 * @param fieldValue - El valor del campo (ej: "name", "capacity")
 * @returns La etiqueta legible o el valor original si no se encuentra
 */
export function getFieldLabel(fieldValue: string): string {
  const field = FIELD_LABELS.find((f) => f.value === fieldValue)
  return field?.label || fieldValue
}

/**
 * Obtiene toda la información de un campo
 * @param fieldValue - El valor del campo
 * @returns El objeto FieldInfo completo o undefined
 */
export function getFieldInfo(fieldValue: string): FieldInfo | undefined {
  return FIELD_LABELS.find((f) => f.value === fieldValue)
}
