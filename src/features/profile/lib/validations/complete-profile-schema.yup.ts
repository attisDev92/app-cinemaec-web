import * as Yup from "yup"
import { LegalStatus } from "@/features/profile/types"

export const completeProfileValidationSchema = Yup.object().shape({
  legalStatus: Yup.string()
    .oneOf(
      [LegalStatus.NATURAL_PERSON, LegalStatus.LEGAL_ENTITY],
      "Selecciona un tipo de persona válido",
    )
    .required("El tipo de persona es requerido"),

  fullName: Yup.string()
    .trim()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(100, "El nombre no puede exceder 100 caracteres")
    .matches(
      /^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+/,
      "Debe contener al menos un nombre y un apellido",
    )
    .required("El nombre completo es requerido"),

  legalName: Yup.string().when("legalStatus", {
    is: LegalStatus.LEGAL_ENTITY,
    then: (schema) =>
      schema
        .trim()
        .min(3, "La razón social debe tener al menos 3 caracteres")
        .max(100, "La razón social no puede exceder 100 caracteres")
        .required("La razón social es requerida"),
    otherwise: (schema) => schema.notRequired(),
  }),

  tradeName: Yup.string().when("legalStatus", {
    is: LegalStatus.LEGAL_ENTITY,
    then: (schema) =>
      schema
        .trim()
        .min(3, "El nombre comercial debe tener al menos 3 caracteres")
        .max(100, "El nombre comercial no puede exceder 100 caracteres")
        .required("El nombre comercial es requerido"),
    otherwise: (schema) => schema.notRequired(),
  }),

  birthdate: Yup.string().when("legalStatus", {
    is: LegalStatus.NATURAL_PERSON,
    then: (schema) =>
      schema.test("is-adult", "Debes ser mayor de 18 años", (value) => {
        if (!value) return true // Optional field
        const date = new Date(value)
        const today = new Date()
        const age = today.getFullYear() - date.getFullYear()
        const monthDiff = today.getMonth() - date.getMonth()
        if (
          monthDiff < 0 ||
          (monthDiff === 0 && today.getDate() < date.getDate())
        ) {
          return age - 1 >= 18
        }
        return age >= 18
      }),
    otherwise: (schema) => schema.notRequired(),
  }),

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
    .max(200, "La dirección no puede exceder 200 caracteres")
    .required("La dirección es requerida"),

  phone: Yup.string()
    .trim()
    .matches(/^\d{10}$/, "El teléfono debe tener exactamente 10 dígitos")
    .required("El teléfono es requerido"),
})
