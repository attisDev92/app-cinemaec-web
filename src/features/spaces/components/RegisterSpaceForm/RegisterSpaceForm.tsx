import { useState } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, Field, FormikErrors } from "formik"
import { ImageUpload } from "@/shared/components/ui/ImageUpload"
import { MultiImageUpload } from "@/shared/components/ui/MultiImageUpload"
import { DocumentUpload } from "@/shared/components/ui/DocumentUpload"
import { TagInput } from "@/shared/components/ui/TagInput"
import { Button } from "@/shared/components/ui/Button"
import { ProvinceSelector } from "@/shared/components/ProvinceSelector"
import { CitySelector } from "@/shared/components/CitySelector"
import {
  LocationPicker,
  LocationData,
} from "@/shared/components/LocationPicker"
import { useProfile } from "@/features/profile/hooks/useProfile"
import { LegalStatus } from "@/features/profile/types"
import { spaceService } from "@/features/spaces/services/space.service"
import { registerSpaceValidationSchema } from "@/features/spaces/lib/validations/register-space-schema.yup"
import {
  SpaceType,
  AssetTypeEnum,
  AssetOwnerEnum,
  Space,
  SpaceStatus,
} from "@/shared/types"
import { Issue } from "@/shared/types"
import styles from "./register-space-form.module.css"

const PROJECTION_EQUIPMENT_OPTIONS = [
  "Proyector digital",
  "Proyector 4K",
  "DVD",
  "BLURAY",
  "DCP",
  "TV",
  "Proyector 16mm",
  "Proyector 35mm",
]

const SOUND_EQUIPMENT_OPTIONS = [
  "Dolby Atmos",
  "Dolby Digital 5.1",
  "Dolby Digital 7.1",
  "Sistema estéreo",
  "Sistema mono",
  "THX",
]

const ACCESSIBILITY_OPTIONS = [
  "Rampa de acceso",
  "Ascensor",
  "Baños adaptados",
  "Estacionamiento accesible",
  "Señalización braille",
  "Audiodescripción",
  "Intérprete de señas",
  "Subtítulos",
]

const SERVICES_OPTIONS = [
  "WiFi",
  "Cafetería",
  "Estacionamiento",
  "Aire acondicionado",
  "Calefacción",
  "Guardarropa",
  "Zona de espera",
  "Venta de snacks",
]

const MAIN_ACTIVITY_OPTIONS = [
  "Actividades culturales",
  "Programación Artística",
  "Formación, Talleres, Conferencias y Seminarios",
  "Charlas y conversatorios",
  "Proyección de películas",
  "Exposiciones y Exhibiciones",
  "Residencia Artística",
  "Preservación de la memoria",
  "Ferias y Mercados",
  "Asambleas comunitarias",
  "Servicios gastronómicos – café cultural",
  "Alquiler de espacio",
  "Servicios técnicos",
  "Coworking",
  "Galería",
  "Otros (especifique)",
]

const TARGET_AUDIENCE_OPTIONS = [
  { label: "Niñez", range: "0 - 12 años" },
  { label: "Adolescencia", range: "12 - 17 años" },
  { label: "Juventud", range: "18 - 29 años" },
  { label: "Adultez", range: "30 - 64 años" },
  { label: "Adulto Mayor", range: "65+ años" },
]

interface FormValues {
  // Información básica
  name: string
  type: SpaceType
  province: string
  city: string
  address: string
  email: string
  phone: string
  ruc: string
  latitude: number
  longitude: number
  description: string
  target: string[]
  mainActivity: string
  mainActivityOther: string
  otherActivities: string[]
  commercialActivities: string[]
  // Personal administrativo
  managerName: string
  managerPhone: string
  managerEmail: string
  // Personal técnico
  technicianInCharge: string
  technicianRole: string
  technicianPhone: string
  technicianEmail: string
  // Infraestructura
  capacity: number
  projectionEquipment: string[]
  soundEquipment: string[]
  screen: string[]
  // Servicios y operación
  boxofficeRegistration: string
  accessibilities: string[]
  services: string[]
  operatingHistory: string
}

export function RegisterSpaceForm({
  spaceToEdit,
  observedIssues = [],
}: {
  spaceToEdit?: Space
  observedIssues?: Issue[]
} = {}) {
  const router = useRouter()
  const { profile } = useProfile()
  const isLegalEntity = profile?.legalStatus === LegalStatus.LEGAL_ENTITY

  const initialLogoId = spaceToEdit?.logoId ?? spaceToEdit?.assets?.logo?.id
  const initialPhotosId =
    spaceToEdit?.photosId ??
    spaceToEdit?.assets?.photos?.map((photo) => photo.id) ??
    []
  const initialCiDocumentId =
    spaceToEdit?.ciDocument ?? spaceToEdit?.assets?.documents?.ci?.id
  const initialRucDocumentId =
    (spaceToEdit?.rucDocument as number | undefined) ??
    spaceToEdit?.assets?.documents?.ruc?.id ??
    undefined
  const initialManagerDocumentId =
    spaceToEdit?.managerDocument ?? spaceToEdit?.assets?.documents?.manager?.id
  const initialServiceBillId =
    spaceToEdit?.serviceBill ?? spaceToEdit?.assets?.documents?.serviceBill?.id
  const initialOperatingLicenseId =
    spaceToEdit?.operatingLicense ??
    spaceToEdit?.assets?.documents?.operatingLicense?.id

  const [logoId, setLogoId] = useState<number | undefined>(initialLogoId)
  const [photosId, setPhotosId] = useState<number[]>(initialPhotosId)
  const [ciDocumentId, setCiDocumentId] = useState<number | undefined>(
    initialCiDocumentId,
  )
  const [rucDocumentId, setRucDocumentId] = useState<number | undefined>(
    initialRucDocumentId,
  )
  const [managerDocumentId, setManagerDocumentId] = useState<
    number | undefined
  >(initialManagerDocumentId)
  const [serviceBillId, setServiceBillId] = useState<number | undefined>(
    initialServiceBillId,
  )
  const [operatingLicenseId, setOperatingLicenseId] = useState<
    number | undefined
  >(initialOperatingLicenseId)

  const currentLogoUrl = spaceToEdit?.assets?.logo?.url
  const currentPhotos =
    spaceToEdit?.assets?.photos?.map((photo) => ({
      id: photo.id,
      url: photo.url,
      localId: `existing-${photo.id}`,
    })) ?? []
  const currentCiUrl = spaceToEdit?.assets?.documents?.ci?.url ?? undefined
  const currentRucUrl = spaceToEdit?.assets?.documents?.ruc?.url ?? undefined
  const currentManagerDocUrl =
    spaceToEdit?.assets?.documents?.manager?.url ?? undefined
  const currentServiceBillUrl =
    spaceToEdit?.assets?.documents?.serviceBill?.url ?? undefined
  const currentOperatingLicenseUrl =
    spaceToEdit?.assets?.documents?.operatingLicense?.url ?? undefined

  const initialValues: FormValues = {
    name: spaceToEdit?.name || "",
    type: spaceToEdit?.type || SpaceType.THEATER,
    province: spaceToEdit?.province || "",
    city: spaceToEdit?.city || "",
    address: spaceToEdit?.address || "",
    email: spaceToEdit?.email || "",
    phone: spaceToEdit?.phone || "",
    ruc: spaceToEdit?.ruc || "",
    latitude: spaceToEdit?.coordinates?.[0] || 0,
    longitude: spaceToEdit?.coordinates?.[1] || 0,
    description: spaceToEdit?.description || "",
    target: spaceToEdit?.target || [],
    mainActivity:
      spaceToEdit?.mainActivity &&
      MAIN_ACTIVITY_OPTIONS.includes(spaceToEdit.mainActivity)
        ? spaceToEdit.mainActivity
        : spaceToEdit?.mainActivity
          ? "Otros (especifique)"
          : "",
    mainActivityOther:
      spaceToEdit?.mainActivity &&
      !MAIN_ACTIVITY_OPTIONS.includes(spaceToEdit.mainActivity)
        ? spaceToEdit.mainActivity
        : "",
    otherActivities: spaceToEdit?.otherActivities || [],
    commercialActivities: spaceToEdit?.commercialActivities || [],
    managerName: spaceToEdit?.managerName || "",
    managerPhone: spaceToEdit?.managerPhone || "",
    managerEmail: spaceToEdit?.managerEmail || "",
    technicianInCharge: spaceToEdit?.technicianInCharge || "",
    technicianRole: spaceToEdit?.technicianRole || "",
    technicianPhone: spaceToEdit?.technicianPhone || "",
    technicianEmail: spaceToEdit?.technicianEmail || "",
    capacity: spaceToEdit?.capacity || 0,
    projectionEquipment: spaceToEdit?.projectionEquipment || [],
    soundEquipment: spaceToEdit?.soundEquipment || [],
    screen: spaceToEdit?.screen || [],
    boxofficeRegistration: spaceToEdit?.boxofficeRegistration || "",
    accessibilities: spaceToEdit?.accessibilities || [],
    services: spaceToEdit?.services || [],
    operatingHistory: spaceToEdit?.operatingHistory || "",
  }

  // Obtener observación de un campo específico
  const getFieldObservation = (fieldName: string): Issue | undefined => {
    return observedIssues.find((issue) => issue.field === fieldName)
  }

  // Verificar si mostrar solo campos observados
  const shouldShowOnlyObserved = spaceToEdit && observedIssues.length > 0

  // Renderizar campo observado específico
  const renderObservedField = (
    fieldName: string,
    values: FormValues,
    errors: FormikErrors<FormValues>,
    touched: Partial<Record<keyof FormValues, boolean>>,
    setFieldValue: (field: string, value: FormValues[keyof FormValues]) => void,
  ) => {
    switch (fieldName) {
      case "name":
        return (
          <div className={styles.field}>
            <label htmlFor="name" className={styles.label}>
              Nombre del espacio *
            </label>
            <Field
              type="text"
              id="name"
              name="name"
              className={styles.input}
              placeholder="Ej: Teatro Nacional"
            />
            {errors.name && touched.name && (
              <div className={styles.error}>{errors.name}</div>
            )}
          </div>
        )
      case "description":
        return (
          <div className={styles.field}>
            <label htmlFor="description" className={styles.label}>
              Descripción detallada *
            </label>
            <Field
              as="textarea"
              id="description"
              name="description"
              className={styles.textarea}
              rows={4}
              placeholder="Describe el espacio, periodicidad con la que programa, si realiza algun evento, características especiales, etc.."
            />
            {errors.description && touched.description && (
              <div className={styles.error}>{errors.description}</div>
            )}
            <div className={styles.characterCount}>
              {values.description?.length || 0} caracteres
            </div>
          </div>
        )
      case "capacity":
        return (
          <div className={styles.field}>
            <label htmlFor="capacity" className={styles.label}>
              Capacidad (personas) *
            </label>
            <Field
              type="number"
              id="capacity"
              name="capacity"
              className={styles.input}
              min="1"
              placeholder="Ej: 850"
            />
            {errors.capacity && touched.capacity && (
              <div className={styles.error}>{errors.capacity}</div>
            )}
          </div>
        )
      case "email":
        return (
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Email del espacio *
            </label>
            <Field
              type="email"
              id="email"
              name="email"
              className={styles.input}
              placeholder="Ej: info@espaciocultural.com"
            />
            {errors.email && touched.email && (
              <div className={styles.error}>{errors.email}</div>
            )}
          </div>
        )
      case "phone":
        return (
          <div className={styles.field}>
            <label htmlFor="phone" className={styles.label}>
              Teléfono *
            </label>
            <Field
              type="tel"
              id="phone"
              name="phone"
              className={styles.input}
              placeholder="Ej: +593 2 1234567"
            />
            {errors.phone && touched.phone && (
              <div className={styles.error}>{errors.phone}</div>
            )}
          </div>
        )
      case "ruc":
        return (
          <div className={styles.field}>
            <label htmlFor="ruc" className={styles.label}>
              RUC *
            </label>
            <Field
              type="text"
              id="ruc"
              name="ruc"
              className={styles.input}
              placeholder="Ej: 1718122797001"
              maxLength={13}
            />
            {errors.ruc && touched.ruc && (
              <div className={styles.error}>{errors.ruc}</div>
            )}
          </div>
        )
      case "address":
        return (
          <div className={styles.field}>
            <label htmlFor="address" className={styles.label}>
              Dirección *
            </label>
            <Field
              type="text"
              id="address"
              name="address"
              className={styles.input}
              placeholder="Ej: Calle Principal 123"
            />
            {errors.address && touched.address && (
              <div className={styles.error}>{errors.address}</div>
            )}
          </div>
        )
      case "type":
        return (
          <div className={styles.field}>
            <label htmlFor="type" className={styles.label}>
              Tipo de espacio *
            </label>
            <Field as="select" id="type" name="type" className={styles.select}>
              <option value={SpaceType.CINEMA}>Cine</option>
              <option value={SpaceType.CULTURAL_CENTER}>Centro Cultural</option>
              <option value={SpaceType.THEATER}>Teatro</option>
              <option value={SpaceType.MULTIPURPOSE}>Multipropósito</option>
              <option value={SpaceType.OTHER}>Otro</option>
            </Field>
          </div>
        )
      case "target":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Público objetivo *</label>
            <div className={styles.checkboxGroup}>
              {TARGET_AUDIENCE_OPTIONS.map((option) => (
                <div key={option.label} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id={`target-${option.label}`}
                    name="target"
                    value={option.label}
                    checked={values.target.includes(option.label)}
                    onChange={(e) => {
                      const newTarget = e.target.checked
                        ? [...values.target, option.label]
                        : values.target.filter((t) => t !== option.label)
                      setFieldValue("target", newTarget)
                    }}
                    className={styles.checkbox}
                  />
                  <label
                    htmlFor={`target-${option.label}`}
                    className={styles.checkboxLabel}
                  >
                    <span className={styles.checkboxText}>{option.label}</span>
                    <span className={styles.checkboxRange}>{option.range}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.target && touched.target && (
              <div className={styles.error}>{errors.target}</div>
            )}
          </div>
        )
      case "mainActivity":
        return (
          <>
            <div className={styles.field}>
              <label htmlFor="mainActivity" className={styles.label}>
                Actividad principal *
              </label>
              <Field
                as="select"
                id="mainActivity"
                name="mainActivity"
                className={styles.input}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setFieldValue("mainActivity", e.target.value)
                  if (e.target.value !== "Otros (especifique)") {
                    setFieldValue("mainActivityOther", "")
                  }
                }}
              >
                <option value="">Selecciona una opción</option>
                {MAIN_ACTIVITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </Field>
              {errors.mainActivity && touched.mainActivity && (
                <div className={styles.error}>{errors.mainActivity}</div>
              )}
            </div>
            {values.mainActivity === "Otros (especifique)" && (
              <div className={styles.field}>
                <label htmlFor="mainActivityOther" className={styles.label}>
                  Especifique la actividad *
                </label>
                <Field
                  type="text"
                  id="mainActivityOther"
                  name="mainActivityOther"
                  className={styles.input}
                  placeholder="Especifique la actividad principal"
                />
                {errors.mainActivityOther && touched.mainActivityOther && (
                  <div className={styles.error}>{errors.mainActivityOther}</div>
                )}
              </div>
            )}
          </>
        )
      case "otherActivities":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Actividades secundarias</label>
            <div className={styles.checkboxGroup}>
              {MAIN_ACTIVITY_OPTIONS.filter(
                (opt) => opt !== "Otros (especifique)",
              ).map((option) => (
                <div key={option} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    id={`otherActivities-${option}`}
                    name="otherActivities"
                    value={option}
                    checked={values.otherActivities.includes(option)}
                    onChange={(e) => {
                      const newActivities = e.target.checked
                        ? [...values.otherActivities, option]
                        : values.otherActivities.filter((a) => a !== option)
                      setFieldValue("otherActivities", newActivities)
                    }}
                    className={styles.checkbox}
                  />
                  <label
                    htmlFor={`otherActivities-${option}`}
                    className={styles.checkboxLabel}
                  >
                    <span className={styles.checkboxText}>{option}</span>
                  </label>
                </div>
              ))}
            </div>
            {errors.otherActivities && touched.otherActivities && (
              <div className={styles.error}>{errors.otherActivities}</div>
            )}
          </div>
        )
      case "commercialActivities":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Actividades comerciales</label>
            <TagInput
              value={values.commercialActivities}
              onChange={(tags) => setFieldValue("commercialActivities", tags)}
              placeholder="Ej: Alquiler de espacios, venta de entradas, publicidad"
              maxLength={100}
            />
            {errors.commercialActivities && touched.commercialActivities && (
              <div className={styles.error}>{errors.commercialActivities}</div>
            )}
          </div>
        )
      case "province":
        return (
          <div className={styles.field}>
            <label htmlFor="province" className={styles.label}>
              Provincia *
            </label>
            <Field
              type="text"
              id="province"
              name="province"
              className={styles.input}
              placeholder="Ej: Pichincha"
            />
            {errors.province && touched.province && (
              <div className={styles.error}>{errors.province}</div>
            )}
          </div>
        )
      case "city":
        return (
          <div className={styles.field}>
            <label htmlFor="city" className={styles.label}>
              Ciudad *
            </label>
            <Field
              type="text"
              id="city"
              name="city"
              className={styles.input}
              placeholder="Ej: Quito"
            />
            {errors.city && touched.city && (
              <div className={styles.error}>{errors.city}</div>
            )}
          </div>
        )
      case "managerName":
        return (
          <div className={styles.field}>
            <label htmlFor="managerName" className={styles.label}>
              Nombre del responsable *
            </label>
            <Field
              type="text"
              id="managerName"
              name="managerName"
              className={styles.input}
              placeholder="Nombre completo"
            />
            {errors.managerName && touched.managerName && (
              <div className={styles.error}>{errors.managerName}</div>
            )}
          </div>
        )
      case "managerEmail":
        return (
          <div className={styles.field}>
            <label htmlFor="managerEmail" className={styles.label}>
              Email del responsable *
            </label>
            <Field
              type="email"
              id="managerEmail"
              name="managerEmail"
              className={styles.input}
              placeholder="Email del responsable"
            />
            {errors.managerEmail && touched.managerEmail && (
              <div className={styles.error}>{errors.managerEmail}</div>
            )}
          </div>
        )
      case "managerPhone":
        return (
          <div className={styles.field}>
            <label htmlFor="managerPhone" className={styles.label}>
              Teléfono del responsable *
            </label>
            <Field
              type="tel"
              id="managerPhone"
              name="managerPhone"
              className={styles.input}
              placeholder="Teléfono"
            />
            {errors.managerPhone && touched.managerPhone && (
              <div className={styles.error}>{errors.managerPhone}</div>
            )}
          </div>
        )
      case "technicianInCharge":
        return (
          <div className={styles.field}>
            <label htmlFor="technicianInCharge" className={styles.label}>
              Técnico a cargo *
            </label>
            <Field
              type="text"
              id="technicianInCharge"
              name="technicianInCharge"
              className={styles.input}
              placeholder="Nombre del técnico"
            />
            {errors.technicianInCharge && touched.technicianInCharge && (
              <div className={styles.error}>{errors.technicianInCharge}</div>
            )}
          </div>
        )
      case "technicianEmail":
        return (
          <div className={styles.field}>
            <label htmlFor="technicianEmail" className={styles.label}>
              Email del técnico *
            </label>
            <Field
              type="email"
              id="technicianEmail"
              name="technicianEmail"
              className={styles.input}
              placeholder="Email del técnico"
            />
            {errors.technicianEmail && touched.technicianEmail && (
              <div className={styles.error}>{errors.technicianEmail}</div>
            )}
          </div>
        )
      case "technicianPhone":
        return (
          <div className={styles.field}>
            <label htmlFor="technicianPhone" className={styles.label}>
              Teléfono del técnico *
            </label>
            <Field
              type="tel"
              id="technicianPhone"
              name="technicianPhone"
              className={styles.input}
              placeholder="Teléfono del técnico"
            />
            {errors.technicianPhone && touched.technicianPhone && (
              <div className={styles.error}>{errors.technicianPhone}</div>
            )}
          </div>
        )
      case "technicianRole":
        return (
          <div className={styles.field}>
            <label htmlFor="technicianRole" className={styles.label}>
              Rol del técnico *
            </label>
            <Field
              type="text"
              id="technicianRole"
              name="technicianRole"
              className={styles.input}
              placeholder="Ej: Proyeccionista, Técnico de sonido"
            />
            {errors.technicianRole && touched.technicianRole && (
              <div className={styles.error}>{errors.technicianRole}</div>
            )}
          </div>
        )
      case "projectionEquipment":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Equipos de proyección</label>
            <TagInput
              value={values.projectionEquipment}
              onChange={(tags) => setFieldValue("projectionEquipment", tags)}
              placeholder="Ej: Proyector digital, DCP, DVD..."
              maxLength={100}
            />
            {errors.projectionEquipment && touched.projectionEquipment && (
              <div className={styles.error}>{errors.projectionEquipment}</div>
            )}
          </div>
        )
      case "soundEquipment":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Equipos de sonido</label>
            <TagInput
              value={values.soundEquipment}
              onChange={(tags) => setFieldValue("soundEquipment", tags)}
              placeholder="Ej: Dolby Atmos, Sistema estéreo, THX..."
              maxLength={100}
            />
            {errors.soundEquipment && touched.soundEquipment && (
              <div className={styles.error}>{errors.soundEquipment}</div>
            )}
          </div>
        )
      case "screen":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Pantalla</label>
            <TagInput
              value={values.screen}
              onChange={(tags) => setFieldValue("screen", tags)}
              placeholder="Ej: Pantalla digital 4K"
              maxLength={100}
            />
            {errors.screen && touched.screen && (
              <div className={styles.error}>{errors.screen}</div>
            )}
          </div>
        )
      case "accessibilities":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Accesibilidades</label>
            <TagInput
              value={values.accessibilities}
              onChange={(tags) => setFieldValue("accessibilities", tags)}
              placeholder="Ej: Rampa de acceso, Ascensor, Baños adaptados..."
              maxLength={100}
            />
            {errors.accessibilities && touched.accessibilities && (
              <div className={styles.error}>{errors.accessibilities}</div>
            )}
          </div>
        )
      case "services":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Servicios</label>
            <TagInput
              value={values.services}
              onChange={(tags) => setFieldValue("services", tags)}
              placeholder="Ej: WiFi, Cafetería, Estacionamiento..."
              maxLength={100}
            />
            {errors.services && touched.services && (
              <div className={styles.error}>{errors.services}</div>
            )}
          </div>
        )
      case "boxofficeRegistration":
        return (
          <div className={styles.field}>
            <label htmlFor="boxofficeRegistration" className={styles.label}>
              Registro de taquilla
            </label>
            <Field
              type="text"
              id="boxofficeRegistration"
              name="boxofficeRegistration"
              className={styles.input}
              placeholder="Número de registro o descripción"
            />
            {errors.boxofficeRegistration && touched.boxofficeRegistration && (
              <div className={styles.error}>{errors.boxofficeRegistration}</div>
            )}
          </div>
        )
      case "operatingHistory":
        return (
          <div className={styles.field}>
            <label htmlFor="operatingHistory" className={styles.label}>
              Historial
            </label>
            <Field
              as="textarea"
              id="operatingHistory"
              name="operatingHistory"
              className={styles.textarea}
              rows={4}
              placeholder="Describe el historial del espacio, actividades realizadas en los últimos años, etc..."
            />
            {errors.operatingHistory && touched.operatingHistory && (
              <div className={styles.error}>{errors.operatingHistory}</div>
            )}
          </div>
        )
      case "logoId":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Logo del espacio *</label>
            <ImageUpload
              documentType={AssetTypeEnum.LOGO}
              ownerType={AssetOwnerEnum.SPACE_LOGO}
              currentImageUrl={currentLogoUrl}
              onUploadComplete={(id) => setLogoId(id)}
              onRemove={() => setLogoId(undefined)}
              label="Subir logo"
            />
          </div>
        )
      case "photosId":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Fotos del espacio *</label>
            <p>Subir mínimo 3 fotos: Sala en general, butacas, pantalla</p>
            <MultiImageUpload
              documentType={AssetTypeEnum.IMAGE}
              ownerType={AssetOwnerEnum.SPACE_PHOTO}
              currentImages={currentPhotos}
              onImagesChange={(ids) => setPhotosId(ids)}
              maxImages={6}
              label="Fotos del espacio"
            />
          </div>
        )
      case "ciDocument":
        return (
          <div className={styles.field}>
            <label className={styles.label}>
              {isLegalEntity
                ? "Cédula de identidad del representante legal *"
                : "Cédula de identidad *"}
            </label>
            <DocumentUpload
              documentType={AssetTypeEnum.DOCUMENT}
              ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
              currentDocumentUrl={currentCiUrl}
              onUploadComplete={(id) => setCiDocumentId(id)}
              onRemove={() => setCiDocumentId(undefined)}
              label="Subir CI (PDF)"
            />
          </div>
        )
      case "rucDocument":
        return (
          <div className={styles.field}>
            <label className={styles.label}>
              RUC {isLegalEntity ? "*" : "(opcional)"}
            </label>
            <DocumentUpload
              documentType={AssetTypeEnum.DOCUMENT}
              ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
              currentDocumentUrl={currentRucUrl}
              onUploadComplete={(id) => setRucDocumentId(id)}
              onRemove={() => setRucDocumentId(undefined)}
              label="Subir RUC (PDF)"
            />
          </div>
        )
      case "managerDocument":
        return (
          <div className={styles.field}>
            <label className={styles.label}>
              Documento de acreditación del administrador *
            </label>
            <DocumentUpload
              documentType={AssetTypeEnum.DOCUMENT}
              ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
              currentDocumentUrl={currentManagerDocUrl}
              onUploadComplete={(id) => setManagerDocumentId(id)}
              onRemove={() => setManagerDocumentId(undefined)}
              label="Subir documento (PDF)"
            />
          </div>
        )
      case "serviceBill":
        return (
          <div className={styles.field}>
            <label className={styles.label}>
              Planilla de servicio básico *
            </label>
            <DocumentUpload
              documentType={AssetTypeEnum.DOCUMENT}
              ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
              currentDocumentUrl={currentServiceBillUrl}
              onUploadComplete={(id) => setServiceBillId(id)}
              onRemove={() => setServiceBillId(undefined)}
              label="Subir planilla (PDF)"
            />
          </div>
        )
      case "operatingLicense":
        return (
          <div className={styles.field}>
            <label className={styles.label}>Licencia de funcionamiento *</label>
            <DocumentUpload
              documentType={AssetTypeEnum.DOCUMENT}
              ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
              currentDocumentUrl={currentOperatingLicenseUrl}
              onUploadComplete={(id) => setOperatingLicenseId(id)}
              onRemove={() => setOperatingLicenseId(undefined)}
              label="Subir licencia (PDF)"
            />
          </div>
        )
      default:
        return null
    }

    // Fin renderObservedField
  }

  const handleSubmit = async (values: FormValues) => {
    try {
      // Validar que todos los documentos obligatorios estén subidos
      const documentsValid =
        logoId &&
        photosId.length >= 3 &&
        ciDocumentId &&
        managerDocumentId &&
        serviceBillId &&
        operatingLicenseId &&
        (!isLegalEntity || rucDocumentId) // RUC obligatorio solo para personas jurídicas

      if (!documentsValid) {
        const missingDocs = []
        if (!logoId) missingDocs.push("Logo")
        if (photosId.length < 3)
          missingDocs.push(
            `Fotos del espacio (mínimo 3, tienes ${photosId.length})`,
          )
        if (!ciDocumentId)
          missingDocs.push(
            isLegalEntity
              ? "Cédula de identidad del representante legal"
              : "Cédula de identidad",
          )
        if (!managerDocumentId) missingDocs.push("Documento del administrador")
        if (!serviceBillId) missingDocs.push("Planilla de servicio")
        if (!operatingLicenseId) missingDocs.push("Licencia de funcionamiento")
        if (isLegalEntity && !rucDocumentId) missingDocs.push("RUC")

        alert(
          `Por favor sube los siguientes documentos obligatorios:\n- ${missingDocs.join("\n- ")}`,
        )
        return
      }
      const spaceData = {
        // Información básica
        name: values.name,
        type: values.type,
        province: values.province,
        city: values.city,
        address: values.address,
        email: values.email,
        phone: values.phone,
        ruc: values.ruc,
        coordinates: [values.latitude, values.longitude] as [number, number],
        description: values.description,
        target: values.target,
        mainActivity:
          values.mainActivity === "Otros (especifique)"
            ? values.mainActivityOther
            : values.mainActivity,
        otherActivities: values.otherActivities,
        commercialActivities: values.commercialActivities,
        // Personal administrativo
        managerName: values.managerName,
        managerPhone: values.managerPhone,
        managerEmail: values.managerEmail,
        // Personal técnico
        technicianInCharge: values.technicianInCharge,
        technicianRole: values.technicianRole,
        technicianPhone: values.technicianPhone,
        technicianEmail: values.technicianEmail,
        // Infraestructura
        capacity: values.capacity,
        projectionEquipment: values.projectionEquipment,
        soundEquipment: values.soundEquipment,
        screen: values.screen,
        // Servicios y operación
        boxofficeRegistration: values.boxofficeRegistration,
        accessibilities: values.accessibilities,
        services: values.services,
        operatingHistory: values.operatingHistory,
        // Assets
        logoId: logoId,
        photosId: photosId,
        ciDocument: ciDocumentId,
        rucDocument: rucDocumentId,
        managerDocument: managerDocumentId,
        serviceBill: serviceBillId,
        operatingLicense: operatingLicenseId,
      }

      if (spaceToEdit) {
        // Actualizar espacio existente
        await spaceService.updateSpace(spaceToEdit.id, spaceData)
        // Cambiar estado a UNDER_REVIEW después de actualizar
        await spaceService.updateSpaceStatus(spaceToEdit.id, {
          status: SpaceStatus.UNDER_REVIEW,
        })
        // Redirigir a lista de espacios después de actualizar
        router.push("/rea-spaces")
      } else {
        // Crear nuevo espacio
        const createdSpace = await spaceService.createSpace(spaceData)
        // Redirigir a la página del acuerdo REA con el ID del espacio creado
        router.push(`/rea-spaces/agreement/${createdSpace.id}`)
      }
    } catch (error) {
      console.error(
        `Error al ${spaceToEdit ? "actualizar" : "registrar"} el espacio:`,
        error,
      )
      alert(
        `Error al ${spaceToEdit ? "actualizar" : "registrar"} el espacio. Por favor intenta nuevamente.`,
      )
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={registerSpaceValidationSchema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, setFieldValue, isSubmitting }) => (
        <Form className={styles.form}>
          {/* Mostrar solo campos observados si estamos en modo edición con observaciones */}
          {shouldShowOnlyObserved && (
            <>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Campos a Corregir</h2>
                <p className={styles.sectionDescription}>
                  Solo se muestran los campos que requieren corrección según las
                  observaciones del administrador.
                </p>
              </section>

              {/* Renderizar dinámicamente solo los campos observados */}
              {observedIssues.map((issue, index) => (
                <section
                  key={`observed-${issue.field}-${index}`}
                  className={styles.section}
                >
                  <div className={styles.observedField}>
                    <div className={styles.observationBox}>
                      <strong className={styles.observationLabel}>
                        Observación:
                      </strong>
                      <p className={styles.observationText}>{issue.comment}</p>
                    </div>

                    {/* Renderizar el campo específico basado en su tipo */}
                    {renderObservedField(
                      issue.field,
                      values,
                      errors,
                      touched,
                      setFieldValue,
                    )}
                  </div>
                </section>
              ))}
            </>
          )}

          {/* Si no hay observaciones o no estamos en modo edición, mostrar el formulario completo */}
          {!shouldShowOnlyObserved && (
            <>
              {/* Información Básica */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Información Básica</h2>

                <div className={styles.field}>
                  <label htmlFor="name" className={styles.label}>
                    Nombre del espacio *
                  </label>
                  <Field
                    type="text"
                    id="name"
                    name="name"
                    className={styles.input}
                    placeholder="Ej: Teatro Nacional"
                  />
                  {errors.name && touched.name && (
                    <div className={styles.error}>{errors.name}</div>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="type" className={styles.label}>
                      Tipo de espacio *
                    </label>
                    <Field
                      as="select"
                      id="type"
                      name="type"
                      className={styles.select}
                    >
                      <option value={SpaceType.CINEMA}>Cine</option>
                      <option value={SpaceType.CULTURAL_CENTER}>
                        Centro Cultural
                      </option>
                      <option value={SpaceType.THEATER}>Teatro</option>
                      <option value={SpaceType.MULTIPURPOSE}>
                        Multipropósito
                      </option>
                      <option value={SpaceType.OTHER}>Otro</option>
                    </Field>
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="capacity" className={styles.label}>
                      Capacidad (personas) *
                    </label>
                    <Field
                      type="number"
                      id="capacity"
                      name="capacity"
                      className={styles.input}
                      min="1"
                      placeholder="Ej: 850"
                    />
                    {errors.capacity && touched.capacity && (
                      <div className={styles.error}>{errors.capacity}</div>
                    )}
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="description" className={styles.label}>
                    Descripción detallada *
                  </label>
                  <Field
                    as="textarea"
                    id="description"
                    name="description"
                    className={styles.textarea}
                    rows={4}
                    placeholder="Describe el espacio, su historia, características especiales..."
                  />
                  {errors.description && touched.description && (
                    <div className={styles.error}>{errors.description}</div>
                  )}
                  <div className={styles.characterCount}>
                    {values.description?.length || 0} caracteres
                  </div>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Público objetivo *</label>
                  <div className={styles.checkboxGroup}>
                    {TARGET_AUDIENCE_OPTIONS.map((option) => (
                      <div key={option.label} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`target-${option.label}`}
                          name="target"
                          value={option.label}
                          checked={values.target.includes(option.label)}
                          onChange={(e) => {
                            const newTarget = e.target.checked
                              ? [...values.target, option.label]
                              : values.target.filter((t) => t !== option.label)
                            setFieldValue("target", newTarget)
                          }}
                          className={styles.checkbox}
                        />
                        <label
                          htmlFor={`target-${option.label}`}
                          className={styles.checkboxLabel}
                        >
                          <span className={styles.checkboxText}>
                            {option.label}
                          </span>
                          <span className={styles.checkboxRange}>
                            {option.range}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.target && touched.target && (
                    <div className={styles.error}>{errors.target}</div>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="mainActivity" className={styles.label}>
                    Actividad principal *
                  </label>
                  <Field
                    as="select"
                    id="mainActivity"
                    name="mainActivity"
                    className={styles.input}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setFieldValue("mainActivity", e.target.value)
                      if (e.target.value !== "Otros (especifique)") {
                        setFieldValue("mainActivityOther", "")
                      }
                    }}
                  >
                    <option value="">Selecciona una opción</option>
                    {MAIN_ACTIVITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Field>
                  {errors.mainActivity && touched.mainActivity && (
                    <div className={styles.error}>{errors.mainActivity}</div>
                  )}
                </div>

                {values.mainActivity === "Otros (especifique)" && (
                  <div className={styles.field}>
                    <label htmlFor="mainActivityOther" className={styles.label}>
                      Especifique la actividad *
                    </label>
                    <Field
                      type="text"
                      id="mainActivityOther"
                      name="mainActivityOther"
                      className={styles.input}
                      placeholder="Especifique la actividad principal"
                    />
                    {errors.mainActivityOther && touched.mainActivityOther && (
                      <div className={styles.error}>
                        {errors.mainActivityOther}
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.field}>
                  <label className={styles.label}>
                    Actividades secundarias
                  </label>
                  <div className={styles.checkboxGroup}>
                    {MAIN_ACTIVITY_OPTIONS.filter(
                      (opt) => opt !== "Otros (especifique)",
                    ).map((option) => (
                      <div key={option} className={styles.checkboxItem}>
                        <input
                          type="checkbox"
                          id={`otherActivities-${option}`}
                          name="otherActivities"
                          value={option}
                          checked={values.otherActivities.includes(option)}
                          onChange={(e) => {
                            const newActivities = e.target.checked
                              ? [...values.otherActivities, option]
                              : values.otherActivities.filter(
                                  (a) => a !== option,
                                )
                            setFieldValue("otherActivities", newActivities)
                          }}
                          className={styles.checkbox}
                        />
                        <label
                          htmlFor={`otherActivities-${option}`}
                          className={styles.checkboxLabel}
                        >
                          <span className={styles.checkboxText}>{option}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.otherActivities && touched.otherActivities && (
                    <div className={styles.error}>{errors.otherActivities}</div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Actividades comerciales
                  </label>
                  <TagInput
                    value={values.commercialActivities}
                    onChange={(tags) =>
                      setFieldValue("commercialActivities", tags)
                    }
                    placeholder="Ej: Alquiler de espacios, venta de entradas, publicidad"
                    maxLength={100}
                  />
                  {errors.commercialActivities &&
                    touched.commercialActivities && (
                      <div className={styles.error}>
                        {errors.commercialActivities}
                      </div>
                    )}
                </div>
              </section>

              {/* Ubicación y Contacto */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Ubicación y Contacto</h2>

                <div className={styles.row}>
                  <ProvinceSelector
                    label="Provincia"
                    name="province"
                    value={values.province}
                    onChange={(e) => {
                      setFieldValue("province", e.target.value)
                      setFieldValue("city", "")
                    }}
                    onBlur={() => {}}
                    error={touched.province ? errors.province : undefined}
                    required
                  />

                  <CitySelector
                    label="Ciudad"
                    name="city"
                    value={values.city}
                    onChange={(e) => setFieldValue("city", e.target.value)}
                    onBlur={() => {}}
                    error={touched.city ? errors.city : undefined}
                    required
                    province={values.province}
                    onProvinceChange={() => setFieldValue("city", "")}
                  />
                </div>

                <LocationPicker
                  label="Dirección y Ubicación"
                  value={{
                    address: values.address,
                    latitude: values.latitude,
                    longitude: values.longitude,
                  }}
                  onChange={(location: LocationData) => {
                    setFieldValue("address", location.address)
                    setFieldValue("latitude", location.latitude)
                    setFieldValue("longitude", location.longitude)
                    // Actualizar provincia y ciudad si vienen del mapa
                    if (location.province) {
                      setFieldValue("province", location.province)
                    }
                    if (location.city) {
                      setFieldValue("city", location.city)
                    }
                  }}
                  province={values.province}
                  city={values.city}
                  error={
                    (touched.address && errors.address) ||
                    (touched.latitude && errors.latitude) ||
                    (touched.longitude && errors.longitude)
                      ? "Selecciona una ubicación válida en el mapa"
                      : undefined
                  }
                  required
                />

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="email" className={styles.label}>
                      Email de contacto *
                    </label>
                    <Field
                      type="email"
                      id="email"
                      name="email"
                      className={styles.input}
                      placeholder="contacto@espacio.ec"
                    />
                    {errors.email && touched.email && (
                      <div className={styles.error}>{errors.email}</div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="phone" className={styles.label}>
                      Teléfono de contacto *
                    </label>
                    <Field
                      type="tel"
                      id="phone"
                      name="phone"
                      className={styles.input}
                      placeholder="0987654321"
                    />
                    {errors.phone && touched.phone && (
                      <div className={styles.error}>{errors.phone}</div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="ruc" className={styles.label}>
                      RUC *
                    </label>
                    <Field
                      type="text"
                      id="ruc"
                      name="ruc"
                      className={styles.input}
                      placeholder="1718122797001"
                      maxLength={13}
                    />
                    {errors.ruc && touched.ruc && (
                      <div className={styles.error}>{errors.ruc}</div>
                    )}
                  </div>
                </div>
              </section>

              {/* Personal Administrativo */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Personal Administrativo</h2>

                <div className={styles.field}>
                  <label htmlFor="managerName" className={styles.label}>
                    Nombre del administrador *
                  </label>
                  <Field
                    type="text"
                    id="managerName"
                    name="managerName"
                    className={styles.input}
                    placeholder="Ej: María González"
                  />
                  {errors.managerName && touched.managerName && (
                    <div className={styles.error}>{errors.managerName}</div>
                  )}
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="managerPhone" className={styles.label}>
                      Teléfono del administrador *
                    </label>
                    <Field
                      type="tel"
                      id="managerPhone"
                      name="managerPhone"
                      className={styles.input}
                      placeholder="0987654321"
                    />
                    {errors.managerPhone && touched.managerPhone && (
                      <div className={styles.error}>{errors.managerPhone}</div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="managerEmail" className={styles.label}>
                      Email del administrador *
                    </label>
                    <Field
                      type="email"
                      id="managerEmail"
                      name="managerEmail"
                      className={styles.input}
                      placeholder="admin@espacio.ec"
                    />
                    {errors.managerEmail && touched.managerEmail && (
                      <div className={styles.error}>{errors.managerEmail}</div>
                    )}
                  </div>
                </div>
              </section>

              {/* Personal Técnico */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Personal Técnico</h2>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label
                      htmlFor="technicianInCharge"
                      className={styles.label}
                    >
                      Nombre del técnico de proyección *
                    </label>
                    <Field
                      type="text"
                      id="technicianInCharge"
                      name="technicianInCharge"
                      className={styles.input}
                      placeholder="Ej: Carlos Mendoza"
                    />
                    {errors.technicianInCharge &&
                      touched.technicianInCharge && (
                        <div className={styles.error}>
                          {errors.technicianInCharge}
                        </div>
                      )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="technicianRole" className={styles.label}>
                      Cargo del técnico *
                    </label>
                    <Field
                      type="text"
                      id="technicianRole"
                      name="technicianRole"
                      className={styles.input}
                      placeholder="Ej: Técnico de Proyección"
                    />
                    {errors.technicianRole && touched.technicianRole && (
                      <div className={styles.error}>
                        {errors.technicianRole}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="technicianPhone" className={styles.label}>
                      Teléfono del técnico *
                    </label>
                    <Field
                      type="tel"
                      id="technicianPhone"
                      name="technicianPhone"
                      className={styles.input}
                      placeholder="0991234567"
                    />
                    {errors.technicianPhone && touched.technicianPhone && (
                      <div className={styles.error}>
                        {errors.technicianPhone}
                      </div>
                    )}
                  </div>

                  <div className={styles.field}>
                    <label htmlFor="technicianEmail" className={styles.label}>
                      Email del técnico *
                    </label>
                    <Field
                      type="email"
                      id="technicianEmail"
                      name="technicianEmail"
                      className={styles.input}
                      placeholder="tecnico@espacio.ec"
                    />
                    {errors.technicianEmail && touched.technicianEmail && (
                      <div className={styles.error}>
                        {errors.technicianEmail}
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Infraestructura */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Infraestructura</h2>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Equipos de proyección *
                  </label>
                  <div className={styles.checkboxGroup}>
                    {PROJECTION_EQUIPMENT_OPTIONS.map((option) => (
                      <label key={option} className={styles.checkbox}>
                        <Field
                          type="checkbox"
                          name="projectionEquipment"
                          value={option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.projectionEquipment &&
                    touched.projectionEquipment && (
                      <div className={styles.error}>
                        {errors.projectionEquipment}
                      </div>
                    )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Equipos de sonido *</label>
                  <div className={styles.checkboxGroup}>
                    {SOUND_EQUIPMENT_OPTIONS.map((option) => (
                      <label key={option} className={styles.checkbox}>
                        <Field
                          type="checkbox"
                          name="soundEquipment"
                          value={option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.soundEquipment && touched.soundEquipment && (
                    <div className={styles.error}>{errors.soundEquipment}</div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Pantalla *</label>
                  <TagInput
                    value={values.screen}
                    onChange={(tags) => setFieldValue("screen", tags)}
                    placeholder="Ej: Pantalla 10m, formato 16:9"
                    maxLength={100}
                  />
                  {errors.screen && touched.screen && (
                    <div className={styles.error}>{errors.screen}</div>
                  )}
                </div>
              </section>

              {/* Servicios y Operación */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Servicios y Operación</h2>

                <div className={styles.field}>
                  <label
                    htmlFor="boxofficeRegistration"
                    className={styles.label}
                  >
                    Sistema de registro de asistencia *
                  </label>
                  <Field
                    type="text"
                    id="boxofficeRegistration"
                    name="boxofficeRegistration"
                    className={styles.input}
                    placeholder="Ej: Sistema digital de venta, registro manual..."
                  />
                  {errors.boxofficeRegistration &&
                    touched.boxofficeRegistration && (
                      <div className={styles.error}>
                        {errors.boxofficeRegistration}
                      </div>
                    )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Accesibilidad *</label>
                  <div className={styles.checkboxGroup}>
                    {ACCESSIBILITY_OPTIONS.map((option) => (
                      <label key={option} className={styles.checkbox}>
                        <Field
                          type="checkbox"
                          name="accessibilities"
                          value={option}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.accessibilities && touched.accessibilities && (
                    <div className={styles.error}>{errors.accessibilities}</div>
                  )}
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Servicios adicionales *
                  </label>
                  <div className={styles.checkboxGroup}>
                    {SERVICES_OPTIONS.map((option) => (
                      <label key={option} className={styles.checkbox}>
                        <Field type="checkbox" name="services" value={option} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                  {errors.services && touched.services && (
                    <div className={styles.error}>{errors.services}</div>
                  )}
                </div>

                <div className={styles.field}>
                  <label htmlFor="operatingHistory" className={styles.label}>
                    Historial operativo *
                  </label>
                  <Field
                    as="textarea"
                    id="operatingHistory"
                    name="operatingHistory"
                    className={styles.textarea}
                    rows={3}
                    placeholder="Ej: Operando desde hace 5 años con 200 eventos anuales"
                  />
                  {errors.operatingHistory && touched.operatingHistory && (
                    <div className={styles.error}>
                      {errors.operatingHistory}
                    </div>
                  )}
                </div>
              </section>

              {/* Documentos y Multimedia */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Documentos y Multimedia</h2>

                <div className={styles.field}>
                  <label className={styles.label}>Logo del espacio *</label>
                  <ImageUpload
                    documentType={AssetTypeEnum.LOGO}
                    ownerType={AssetOwnerEnum.SPACE_LOGO}
                    currentImageUrl={currentLogoUrl}
                    onUploadComplete={(id) => setLogoId(id)}
                    onRemove={() => setLogoId(undefined)}
                    label="Subir logo"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Fotos del espacio *</label>
                  <p>
                    Subir mínimo 3 fotos: Sala en general, butacas, pantalla
                  </p>
                  <MultiImageUpload
                    documentType={AssetTypeEnum.IMAGE}
                    ownerType={AssetOwnerEnum.SPACE_PHOTO}
                    currentImages={currentPhotos}
                    onImagesChange={(ids) => setPhotosId(ids)}
                    maxImages={6}
                    label="Fotos del espacio"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    {isLegalEntity
                      ? "Cédula de identidad del representante legal *"
                      : "Cédula de identidad *"}
                  </label>
                  <DocumentUpload
                    documentType={AssetTypeEnum.DOCUMENT}
                    ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
                    currentDocumentUrl={currentCiUrl}
                    onUploadComplete={(id) => setCiDocumentId(id)}
                    onRemove={() => setCiDocumentId(undefined)}
                    label="Subir CI (PDF)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    RUC {isLegalEntity ? "*" : "(opcional)"}
                  </label>
                  <DocumentUpload
                    documentType={AssetTypeEnum.DOCUMENT}
                    ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
                    currentDocumentUrl={currentRucUrl}
                    onUploadComplete={(id) => setRucDocumentId(id)}
                    onRemove={() => setRucDocumentId(undefined)}
                    label="Subir RUC (PDF)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Documento de acreditación del administrador *
                  </label>
                  <DocumentUpload
                    documentType={AssetTypeEnum.DOCUMENT}
                    ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
                    currentDocumentUrl={currentManagerDocUrl}
                    onUploadComplete={(id) => setManagerDocumentId(id)}
                    onRemove={() => setManagerDocumentId(undefined)}
                    label="Subir documento (PDF)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Planilla de servicio básico *
                  </label>
                  <DocumentUpload
                    documentType={AssetTypeEnum.DOCUMENT}
                    ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
                    currentDocumentUrl={currentServiceBillUrl}
                    onUploadComplete={(id) => setServiceBillId(id)}
                    onRemove={() => setServiceBillId(undefined)}
                    label="Subir planilla (PDF)"
                  />
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>
                    Licencia de funcionamiento *
                  </label>
                  <DocumentUpload
                    documentType={AssetTypeEnum.DOCUMENT}
                    ownerType={AssetOwnerEnum.SPACE_DOCUMENT}
                    currentDocumentUrl={currentOperatingLicenseUrl}
                    onUploadComplete={(id) => setOperatingLicenseId(id)}
                    onRemove={() => setOperatingLicenseId(undefined)}
                    label="Subir licencia (PDF)"
                  />
                </div>
              </section>
            </>
          )}

          {/* Botones de acción (siempre visibles) */}
          <div className={styles.actions}>
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? spaceToEdit
                  ? "Actualizando..."
                  : "Registrando..."
                : spaceToEdit
                  ? "Actualizar Espacio"
                  : "Registrar Espacio"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
