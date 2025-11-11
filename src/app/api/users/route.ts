import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("[API] ========================================")
  console.log("[API] API Route /api/users HIT!")
  console.log("[API] Request URL:", request.url)
  console.log("[API] ========================================")

  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")
    console.log("[API] Token present:", !!token)

    if (!token) {
      console.log("[API] No token - returning 401")
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const page = searchParams.get("page") || "1"
    const perPage = searchParams.get("per_page") || "50"
    const role = searchParams.get("role") || "customer"
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "active"

    console.log("[API] Query params:", { page, perPage, role, search, status })

    const params = new URLSearchParams({
      page,
      per_page: perPage,
      role,
      status, // Filter by status
    })

    if (search) {
      params.append("search", search)
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const url = `${baseUrl}/api/users?${params.toString()}`

    console.log("[API] Fetching from Laravel:", url)

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      cache: "no-store",
    })

    console.log("[API] Laravel response status:", response.status)

    if (!response.ok) {
      console.log("[API] Laravel returned error:", response.status)
      const errorText = await response.text()
      console.log("[API] Error details:", errorText)
      return NextResponse.json(
        { success: false, message: `Backend returned ${response.status}` },
        { status: response.status },
      )
    }

    const data = await response.json()
    console.log("[API] Successfully fetched users, count:", data.data?.length || 0)

    return NextResponse.json(data)
  } catch (error) {
    console.error("[API] Error in /api/users:", error)
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
