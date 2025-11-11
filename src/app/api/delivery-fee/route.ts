// app/api/delivery-fee/route.ts
import { type NextRequest, NextResponse } from "next/server"

const LARAVEL_API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const authToken = request.headers.get("Authorization")
    const body = await request.json()

    if (!body.city) {
      return NextResponse.json(
        { success: false, message: "City is required" },
        { status: 400 }
      )
    }

    const response = await fetch(`${LARAVEL_API_BASE}/api/delivery-fee/calculate`, {
      method: "POST",
      headers: {
        ...(authToken && { Authorization: authToken }),
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        city: body.city,
        distance_km: body.distance_km || null,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Laravel API error:", data)
      return NextResponse.json(
        { success: false, message: data.message || "Failed to calculate delivery fee" },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("[v0] Error calculating delivery fee:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}