import * as Yup from "yup"
import { SpaceType } from "@/shared/types"

// Regex más estricta para validación de email
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

export const registerSpaceValidationSchema = Yup.object().shape({
  // Información básica
  name: Yup.string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(200, "El nombre no puede exceder 200 caracteres")
    .required("El nombre del espacio es requerido"),

  type: Yup.string()
    .oneOf(Object.values(SpaceType), "Selecciona un tipo de espacio válido")
    .required("El tipo de espacio es requerido"),

  description: Yup.string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(1000, "La descripción no puede exceder 1000 caracteres")
    .required("La descripción es requerida"),

  target: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos un grupo etario")
    .required("El público objetivo es requerido"),

  mainActivity: Yup.string()
    .trim()
    .required("La actividad principal es requerida"),

  mainActivityOther: Yup.string()
    .trim()
    .when("mainActivity", {
      is: "Otros (especifique)",
      then: (schema) =>
        schema
          .min(3, "Especifica la actividad principal (mínimo 3 caracteres)")
          .max(200, "La actividad principal no puede exceder 200 caracteres")
          .required("Debes especificar la actividad principal"),
      otherwise: (schema) => schema.notRequired(),
    }),

  otherActivities: Yup.array().of(Yup.string()).default([]),

  commercialActivities: Yup.array().of(Yup.string()).default([]),

  capacity: Yup.number()
    .min(1, "La capacidad debe ser al menos 1")
    .max(100000, "La capacidad no puede exceder 100000")
    .required("La capacidad es requerida"),

  // Ubicación
  province: Yup.string()
    .trim()
    .min(3, "La provincia debe tener al menos 3 caracteres")
    .max(50, "La provincia no puede exceder 50 caracteres")
    .required("La provincia es requerida"),

  city: Yup.string()
    .trim()
    .min(3, "La ciudad debe tener al menos 3 caracteres")
    .max(50, "La ciudad no puede exceder 50 caracteres")
    .required("La ciudad es requerida"),

  address: Yup.string()
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(300, "La dirección no puede exceder 300 caracteres")
    .required("La dirección es requerida"),

  latitude: Yup.number()
    .min(-90, "La latitud debe estar entre -90 y 90")
    .max(90, "La latitud debe estar entre -90 y 90")
    .test(
      "not-zero",
      "Selecciona una ubicación en el mapa",
      (value) => value !== 0,
    )
    .required("La latitud es requerida"),

  longitude: Yup.number()
    .min(-180, "La longitud debe estar entre -180 y 180")
    .max(180, "La longitud debe estar entre -180 y 180")
    .test(
      "not-zero",
      "Selecciona una ubicación en el mapa",
      (value) => value !== 0,
    )
    .required("La longitud es requerida"),

  email: Yup.string()
    .trim()
    .email("Ingresa un email válido")
    .matches(EMAIL_REGEX, "El formato del email no es válido")
    .required("El email de contacto es requerido"),

  phone: Yup.string()
    .trim()
    .matches(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos")
    .required("El teléfono de contacto es requerido"),

  ruc: Yup.string()
    .trim()
    .matches(/^[0-9]{13}$/, "El RUC debe tener exactamente 13 dígitos")
    .required("El RUC es requerido"),

  // Personal administrativo
  managerName: Yup.string()
    .trim()
    .min(3, "El nombre del administrador debe tener al menos 3 caracteres")
    .max(100, "El nombre del administrador no puede exceder 100 caracteres")
    .required("El nombre del administrador es requerido"),

  managerPhone: Yup.string()
    .trim()
    .matches(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos")
    .required("El teléfono del administrador es requerido"),

  managerEmail: Yup.string()
    .trim()
    .email("Ingresa un email válido")
    .matches(EMAIL_REGEX, "El formato del email no es válido")
    .required("El email del administrador es requerido"),

  // Personal técnico
  technicianInCharge: Yup.string()
    .trim()
    .min(3, "El nombre del técnico debe tener al menos 3 caracteres")
    .max(100, "El nombre del técnico no puede exceder 100 caracteres")
    .required("El nombre del técnico es requerido"),

  technicianRole: Yup.string()
    .trim()
    .min(3, "El cargo del técnico debe tener al menos 3 caracteres")
    .max(100, "El cargo del técnico no puede exceder 100 caracteres")
    .required("El cargo del técnico es requerido"),

  technicianPhone: Yup.string()
    .trim()
    .matches(/^[0-9]{10}$/, "El teléfono debe tener 10 dígitos")
    .required("El teléfono del técnico es requerido"),

  technicianEmail: Yup.string()
    .trim()
    .email("Ingresa un email válido")
    .matches(EMAIL_REGEX, "El formato del email no es válido")
    .required("El email del técnico es requerido"),

  // Infraestructura
  projectionEquipment: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos un equipo de proyección")
    .required("Los equipos de proyección son requeridos"),

  soundEquipment: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos un equipo de sonido")
    .required("Los equipos de sonido son requeridos"),

  screen: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos una opción de pantalla")
    .required("La información de pantalla es requerida"),

  // Servicios y operación
  boxofficeRegistration: Yup.string()
    .trim()
    .min(5, "El sistema de taquilla debe tener al menos 5 caracteres")
    .max(200, "El sistema de taquilla no puede exceder 200 caracteres")
    .required("El sistema de registro de taquilla es requerido"),

  accessibilities: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos una opción de accesibilidad")
    .required("Las opciones de accesibilidad son requeridas"),

  services: Yup.array()
    .of(Yup.string())
    .min(1, "Selecciona al menos un servicio")
    .required("Los servicios son requeridos"),

  operatingHistory: Yup.string()
    .trim()
    .min(10, "El historial operativo debe tener al menos 10 caracteres")
    .max(500, "El historial operativo no puede exceder 500 caracteres")
    .required("El historial operativo es requerido"),

  // Documentos (validados en el submit)
  logoId: Yup.number().notRequired(),
  photosId: Yup.array().of(Yup.number()).default([]),
  ciDocument: Yup.number().notRequired(),
  rucDocument: Yup.number().notRequired(),
  managerDocument: Yup.number().notRequired(),
  serviceBill: Yup.number().notRequired(),
  operatingLicense: Yup.number().notRequired(),
})
