import { environment } from "@/config/environment"

const API_URL = environment.apiUrl.replace(/\/+$/, "")

const buildUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.replace(/^\/+/, "")
  return `${API_URL}/${cleanEndpoint}`
}

class ApiClient {
  async patch<T>(
    endpoint: string,
    data: unknown,
    includeAuth = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
      includeAuth,
    )
  }
  private getHeaders(includeAuth = true): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }

    if (includeAuth) {
      const token = localStorage.getItem("token")
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    return headers
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true,
  ): Promise<T> {
    const response = await fetch(buildUrl(endpoint), {
      ...options,
      headers: {
        ...this.getHeaders(includeAuth),
        ...options.headers,
      },
    })

    if (!response.ok) {
      // Si es 401 Unauthorized, limpiar sesión y redirigir al login
      if (response.status === 401 && includeAuth) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        localStorage.removeItem("tokenExpiresAt")

        // Redirigir al login solo si no estamos ya en páginas públicas
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") &&
          !window.location.pathname.startsWith("/register") &&
          !window.location.pathname.startsWith("/forgot-password") &&
          !window.location.pathname.startsWith("/reset-password")
        ) {
          window.location.href = "/login?session=expired"
        }
      }

      const error = await response.json().catch(() => ({
        message: "Error al procesar la solicitud",
      }))

      // Registrar error en consola para debugging
      console.error("❌ API Error:", {
        endpoint,
        status: response.status,
        statusText: response.statusText,
        error,
      })

      // Extraer el mensaje de error (puede venir en diferentes formatos)
      const errorMessage =
        error.message ||
        error.error ||
        (Array.isArray(error.errors) && error.errors.length > 0
          ? error.errors.join(", ")
          : undefined) ||
        `Error ${response.status}: ${response.statusText}`

      throw {
        message: errorMessage,
        statusCode: response.status,
        errors: error.errors,
        details: error,
      }
    }

    return response.json()
  }

  async get<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" }, includeAuth)
  }

  async post<T>(
    endpoint: string,
    data: unknown,
    includeAuth = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
      includeAuth,
    )
  }

  async put<T>(
    endpoint: string,
    data: unknown,
    includeAuth = true,
  ): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
      includeAuth,
    )
  }

  async delete<T>(endpoint: string, includeAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" }, includeAuth)
  }
}

export const apiClient = new ApiClient()
