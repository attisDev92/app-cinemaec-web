"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Formik, Form, Field } from "formik"
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
import { SpaceType, AssetTypeEnum, AssetOwnerEnum } from "@/shared/types"
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

interface FormValues {
  // Información básica
  name: string
  type: SpaceType
  province: string
  city: string
  address: string
  email: string
  phone: string
  latitude: number
  longitude: number
  description: string
  target: string
  mainActivity: string
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

export function RegisterSpaceForm() {
  const router = useRouter()
  const { profile } = useProfile()
  const isLegalEntity = profile?.legalStatus === LegalStatus.LEGAL_ENTITY

  const [logoId, setLogoId] = useState<number | undefined>()
  const [photosId, setPhotosId] = useState<number[]>([])
  const [ciDocumentId, setCiDocumentId] = useState<number | undefined>()
  const [rucDocumentId, setRucDocumentId] = useState<number | undefined>()
  const [managerDocumentId, setManagerDocumentId] = useState<
    number | undefined
  >()
  const [serviceBillId, setServiceBillId] = useState<number | undefined>()
  const [operatingLicenseId, setOperatingLicenseId] = useState<
    number | undefined
  >()

  const initialValues: FormValues = {
    name: "",
    type: SpaceType.THEATER,
    province: "",
    city: "",
    address: "",
    email: "",
    phone: "",
    latitude: 0,
    longitude: 0,
    description: "",
    target: "",
    mainActivity: "",
    otherActivities: [],
    commercialActivities: [],
    managerName: "",
    managerPhone: "",
    managerEmail: "",
    technicianInCharge: "",
    technicianRole: "",
    technicianPhone: "",
    technicianEmail: "",
    capacity: 0,
    projectionEquipment: [],
    soundEquipment: [],
    screen: [],
    boxofficeRegistration: "",
    accessibilities: [],
    services: [],
    operatingHistory: "",
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

      const createdSpace = await spaceService.createSpace({
        // Información básica
        name: values.name,
        type: values.type,
        province: values.province,
        city: values.city,
        address: values.address,
        email: values.email,
        phone: values.phone,
        coordinates: [values.latitude, values.longitude],
        description: values.description,
        target: values.target,
        mainActivity: values.mainActivity,
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
      })

      // Redirigir a la página del acuerdo REA con el ID del espacio creado
      router.push(`/rea-spaces/agreement/${createdSpace.id}`)
    } catch (error) {
      console.error("Error al registrar el espacio:", error)
      alert("Error al registrar el espacio. Por favor intenta nuevamente.")
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
                  <option value={SpaceType.MULTIPURPOSE}>Multipropósito</option>
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
              <label htmlFor="target" className={styles.label}>
                Público objetivo *
              </label>
              <Field
                type="text"
                id="target"
                name="target"
                className={styles.input}
                placeholder="Ej: Público general, estudiantes, familias..."
              />
              {errors.target && touched.target && (
                <div className={styles.error}>{errors.target}</div>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="mainActivity" className={styles.label}>
                Actividad principal *
              </label>
              <Field
                type="text"
                id="mainActivity"
                name="mainActivity"
                className={styles.input}
                placeholder="Ej: Proyección de películas, teatro en vivo, eventos culturales..."
              />
              {errors.mainActivity && touched.mainActivity && (
                <div className={styles.error}>{errors.mainActivity}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Otras actividades</label>
              <TagInput
                value={values.otherActivities}
                onChange={(tags) => setFieldValue("otherActivities", tags)}
                placeholder="Ej: Talleres, conferencias, exposiciones"
                maxLength={100}
              />
              {errors.otherActivities && touched.otherActivities && (
                <div className={styles.error}>{errors.otherActivities}</div>
              )}
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Actividades comerciales</label>
              <TagInput
                value={values.commercialActivities}
                onChange={(tags) => setFieldValue("commercialActivities", tags)}
                placeholder="Ej: Alquiler de espacios, venta de entradas, publicidad"
                maxLength={100}
              />
              {errors.commercialActivities && touched.commercialActivities && (
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
                <label htmlFor="technicianInCharge" className={styles.label}>
                  Nombre del técnico de proyección *
                </label>
                <Field
                  type="text"
                  id="technicianInCharge"
                  name="technicianInCharge"
                  className={styles.input}
                  placeholder="Ej: Carlos Mendoza"
                />
                {errors.technicianInCharge && touched.technicianInCharge && (
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
                  <div className={styles.error}>{errors.technicianRole}</div>
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
                  <div className={styles.error}>{errors.technicianPhone}</div>
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
                  <div className={styles.error}>{errors.technicianEmail}</div>
                )}
              </div>
            </div>
          </section>

          {/* Infraestructura */}
          <section className={styles.section}>
            <h2 className={styles.sectionTitle}>Infraestructura</h2>

            <div className={styles.field}>
              <label className={styles.label}>Equipos de proyección *</label>
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
              {errors.projectionEquipment && touched.projectionEquipment && (
                <div className={styles.error}>{errors.projectionEquipment}</div>
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
              <label htmlFor="boxofficeRegistration" className={styles.label}>
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
              <label className={styles.label}>Servicios adicionales *</label>
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
                <div className={styles.error}>{errors.operatingHistory}</div>
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
                onUploadComplete={(id) => setLogoId(id)}
                label="Subir logo"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Fotos del espacio *</label>
              <p>Subir mínimo 3 fotos: Sala en general, butacas, pantalla</p>
              <MultiImageUpload
                documentType={AssetTypeEnum.IMAGE}
                ownerType={AssetOwnerEnum.SPACE_PHOTO}
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
                onUploadComplete={(id) => setCiDocumentId(id)}
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
                onUploadComplete={(id) => setRucDocumentId(id)}
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
                onUploadComplete={(id) => setManagerDocumentId(id)}
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
                onUploadComplete={(id) => setServiceBillId(id)}
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
                onUploadComplete={(id) => setOperatingLicenseId(id)}
                label="Subir licencia (PDF)"
              />
            </div>
          </section>

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
              {isSubmitting ? "Registrando..." : "Registrar Espacio"}
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
