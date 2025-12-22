import * as Yup from "yup"

export const registerValidationSchema = Yup.object({
  email: Yup.string().email("Email inválido").required("El email es requerido"),
  password: Yup.string()
    .matches(
      /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&\-_.+]{6,}$/,
      "La contraseña debe tener al menos 6 caracteres, incluyendo al menos una letra y un número",
    )
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .required("La contraseña es requerida"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
    .required("Confirma tu contraseña"),
  ciOrRuc: Yup.string()
    .matches(/^\d+$/, "El CI o RUC debe contener solo números")
    .min(10, "El CI o RUC debe tener al menos 10 dígitos")
    .max(13, "El CI o RUC debe tener como máximo 13 dígitos")
    .required("El CI o RUC es requerido"),
})
