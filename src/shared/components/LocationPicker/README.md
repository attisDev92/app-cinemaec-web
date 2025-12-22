# LocationPicker Component

Componente reutilizable de selección de ubicación con mapa interactivo, geocodificación y geocodificación inversa.

## Características

- 🗺️ **Mapa interactivo** con OpenStreetMap
- 🔍 **Búsqueda de direcciones** con geocodificación
- 📍 **Pin arrastrable** para ajustar ubicación
- 🎯 **Clic en mapa** para colocar pin
- 🔄 **Geocodificación inversa** para obtener dirección desde coordenadas
- 📱 **Responsive** y adaptable a diferentes tamaños de pantalla

## Uso

```tsx
import {
  LocationPicker,
  LocationData,
} from "@/shared/components/LocationPicker"

function MyForm() {
  const [location, setLocation] = useState<LocationData>({
    address: "",
    latitude: 0,
    longitude: 0,
  })

  return (
    <LocationPicker
      label="Ubicación del evento"
      value={location}
      onChange={setLocation}
      province="Pichincha"
      city="Quito"
      error={errors.location}
      required
    />
  )
}
```

## Props

| Prop       | Tipo                               | Requerido | Descripción                               |
| ---------- | ---------------------------------- | --------- | ----------------------------------------- |
| `label`    | `string`                           | No        | Etiqueta del campo (default: "Ubicación") |
| `value`    | `LocationData`                     | Sí        | Objeto con address, latitude, longitude   |
| `onChange` | `(location: LocationData) => void` | Sí        | Callback cuando cambia la ubicación       |
| `province` | `string`                           | No        | Provincia para búsqueda contextual        |
| `city`     | `string`                           | No        | Ciudad para búsqueda contextual           |
| `error`    | `string`                           | No        | Mensaje de error a mostrar                |
| `required` | `boolean`                          | No        | Si el campo es requerido (default: false) |

## LocationData Interface

```typescript
interface LocationData {
  address: string // Dirección completa
  latitude: number // Coordenada de latitud
  longitude: number // Coordenada de longitud
}
```

## Integración con Formik

```tsx
<LocationPicker
  label="Dirección y Ubicación"
  value={{
    address: values.address,
    latitude: values.latitude,
    longitude: values.longitude,
  }}
  onChange={(location) => {
    setFieldValue("address", location.address)
    setFieldValue("latitude", location.latitude)
    setFieldValue("longitude", location.longitude)
  }}
  province={values.province}
  city={values.city}
  error={touched.address && errors.address ? errors.address : undefined}
  required
/>
```

## Validación con Yup

```typescript
const schema = Yup.object().shape({
  address: Yup.string()
    .min(5, "Mínimo 5 caracteres")
    .required("La dirección es requerida"),

  latitude: Yup.number()
    .min(-90)
    .max(90)
    .test("not-zero", "Selecciona una ubicación", (value) => value !== 0)
    .required("Requerido"),

  longitude: Yup.number()
    .min(-180)
    .max(180)
    .test("not-zero", "Selecciona una ubicación", (value) => value !== 0)
    .required("Requerido"),
})
```

## Funcionalidades

### 1. Búsqueda de Dirección

- Escribe una dirección en el campo de búsqueda
- Presiona Enter o clic en "Buscar"
- El mapa se centra y coloca un pin en la ubicación encontrada

### 2. Clic en Mapa

- Haz clic en cualquier punto del mapa
- El pin se coloca en ese punto
- Se obtiene la dirección mediante geocodificación inversa

### 3. Arrastrar Pin

- Arrastra el pin a cualquier ubicación
- Al soltar, se actualiza la dirección automáticamente

### 4. Contexto de Provincia/Ciudad

- Si se proporcionan `province` y `city`, la búsqueda se contextualiza
- Mejora la precisión de las búsquedas

## Servicios Utilizados

- **OpenStreetMap**: Tiles del mapa
- **Nominatim**: Geocodificación y geocodificación inversa
- **Leaflet**: Librería de mapas interactivos

## Notas Técnicas

- Usa `dynamic import` para evitar problemas de SSR con Leaflet
- Los iconos de Leaflet se cargan desde CDN
- El marcador es arrastrable por defecto
- La geocodificación inversa se ejecuta automáticamente al mover el pin

## Estilos Personalizables

El componente usa CSS modules con variables CSS globales:

- Colores del tema global
- Espaciados consistentes
- Bordes y sombras del design system
- Transiciones suaves

## Dependencias

```json
{
  "leaflet": "^1.9.x",
  "react-leaflet": "^4.x",
  "@types/leaflet": "^1.9.x"
}
```
