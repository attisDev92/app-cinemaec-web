import { redirect } from "next/navigation"

// Redirect /auth/reset-password to the existing /reset-password page while preserving query params
export default async function AuthResetPasswordRedirect({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  const params = new URLSearchParams()

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v))
      return
    }

    if (value !== undefined) {
      params.set(key, value)
    }
  })

  const query = params.toString()
  const target = `/reset-password${query ? `?${query}` : ""}`

  redirect(target)
}
