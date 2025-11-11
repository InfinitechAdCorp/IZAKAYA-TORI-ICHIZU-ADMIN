import { NextResponse } from "next/server"

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const LARAVEL_API_TOKEN = process.env.LARAVEL_API_TOKEN

async function fetchProductCount() {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  }

  // Add authorization header if token is available
  if (LARAVEL_API_TOKEN) {
    headers.Authorization = `Bearer ${LARAVEL_API_TOKEN}`
  }

  const url = `${LARAVEL_API_BASE}/api/count`
  console.log("[v0] Fetching from URL:", url)
  console.log("[v0] Has auth token:", !!LARAVEL_API_TOKEN)

  try {
    const response = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(10000),
    })

    console.log("[v0] Response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Laravel API error (${response.status}):`, errorText)
      throw new Error(`HTTP ${response.status}: ${errorText}`)
    }

    return response.json()
  } catch (error) {
    console.error("[v0] Fetch error details:", error)
    throw error
  }
}

export async function GET() {
  try {
    console.log("[v0] Product count endpoint called")
    console.log("[v0] LARAVEL_API_BASE:", LARAVEL_API_BASE)

    const data = await fetchProductCount()
    console.log("[v0] Product count fetched successfully:", data)

    return NextResponse.json({
      success: true,
      data: data,
      totalProducts: data.total || data.count || 0,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error("[v0] Product count API error:", errorMessage)

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product count from Laravel API",
        message: errorMessage,
        debug: {
          apiUrl: LARAVEL_API_BASE,
          hasToken: !!LARAVEL_API_TOKEN,
          hint: "Make sure NEXT_PUBLIC_API_URL is set in environment variables and your Laravel API is running",
        },
        totalProducts: 0,
      },
      { status: 500 },
    )
  }
}
