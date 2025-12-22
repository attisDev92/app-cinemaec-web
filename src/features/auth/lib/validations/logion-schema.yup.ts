import * as Yup from "yup"

export const loginValidationSchema = Yup.object({
  email: Yup.string().email("Email inválido").required("El email es requerido"),
  password: Yup.string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
})
