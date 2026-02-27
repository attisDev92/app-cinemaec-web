import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rutas que requieren autenticación
const protectedRoutes = [
  "/profile",
  "/movies",
  "/settings",
  "/home",
  "/rea-spaces",
]

// Rutas de admin
const adminRoutes = ["/admin"]

// Rutas que requieren que el perfil esté completo pero no necesitan el acuerdo de medios
const profileRoutes = ["/complete-profile", "/media-agreement"]

// Rutas públicas que no requieren autenticación
const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const withNoStoreHeaders = (response: NextResponse) => {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, max-age=0, must-revalidate",
    )
    response.headers.set("CDN-Cache-Control", "no-store")
    response.headers.set("Netlify-CDN-Cache-Control", "no-store")
    return response
  }

  // Obtener el token de las cookies o headers
  const token = request.cookies.get("token")?.value

  // Verificar si es una ruta protegida
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isProfileRoute = profileRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return withNoStoreHeaders(NextResponse.redirect(url))
  }

  // Si es una ruta de admin y no hay token, redirigir al login
  if (isAdminRoute && !token) {
    const url = new URL("/login", request.url)
    return withNoStoreHeaders(NextResponse.redirect(url))
  }

  // Si el usuario está autenticado y trata de acceder a login o register
  // redirigir al admin si es admin, o al dashboard si es user/editor
  if (token && (pathname === "/login" || pathname === "/register")) {
    // Aquí idealmente deberíamos decodificar el token para ver el role
    // Por ahora redirigimos al dashboard y dejamos que el cliente maneje
    return withNoStoreHeaders(
      NextResponse.redirect(new URL("/home", request.url)),
    )
  }

  return withNoStoreHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
