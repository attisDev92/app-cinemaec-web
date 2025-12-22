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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

  // Si es una ruta protegida y no hay token, redirigir al login
  if (isProtectedRoute && !token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("redirect", pathname)
    return NextResponse.redirect(url)
  }

  // Si es una ruta de admin y no hay token, redirigir al login
  if (isAdminRoute && !token) {
    const url = new URL("/login", request.url)
    return NextResponse.redirect(url)
  }

  // Si el usuario está autenticado y trata de acceder a login o register, redirigir al dashboard
  if (token && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // TODO: Aquí se podría agregar lógica adicional para verificar hasMediaAgreement
  // cuando el backend proporcione esta información en el token o en una cookie separada
  // Por ahora, la verificación se hace en el componente cliente

  return NextResponse.next()
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
