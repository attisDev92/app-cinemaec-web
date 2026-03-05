import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const protectedRoutes = [
  "/profile",
  "/movies",
  "/settings",
  "/home",
  "/rea-spaces",
]

const adminRoutes = ["/admin"]

const publicRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get("token")?.value

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )
  const isAdminRoute = adminRoutes.some((route) => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some((route) => pathname === route)

  if ((isProtectedRoute || isAdminRoute) && !token) {
    const url = new URL("/login", request.url)
    if (isProtectedRoute) {
      url.searchParams.set("redirect", pathname)
    }
    return NextResponse.redirect(url)
  }

  if (token && isPublicRoute && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/home", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}
