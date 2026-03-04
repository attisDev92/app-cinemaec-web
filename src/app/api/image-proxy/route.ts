import { NextRequest, NextResponse } from "next/server"

const ALLOWED_HOSTS = new Set([
  "storage.googleapis.com",
  "firebasestorage.googleapis.com",
])

export async function GET(request: NextRequest) {
  const imageUrl = request.nextUrl.searchParams.get("url")

  if (!imageUrl) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    return new NextResponse("Invalid url", { status: 400 })
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return new NextResponse("Host not allowed", { status: 400 })
  }

  try {
    const upstream = await fetch(parsed.toString(), {
      cache: "no-store",
    })

    if (!upstream.ok) {
      return new NextResponse("Unable to fetch image", {
        status: upstream.status,
      })
    }

    const contentType = upstream.headers.get("content-type") || "image/jpeg"
    const buffer = await upstream.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
      },
    })
  } catch {
    return new NextResponse("Image proxy failed", { status: 500 })
  }
}
