import { type NextRequest, NextResponse } from "next/server"

// GET single reservation by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const authHeader = request.headers.get("authorization")

    console.log(`GET Reservation ID: ${params.id}`)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (authHeader) {
      headers["Authorization"] = authHeader
    }

    const response = await fetch(`${apiUrl}/api/reservations/${params.id}`, {
      method: "GET",
      headers,
    })

    console.log("Laravel Response Status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Laravel Error:", errorData)
      throw new Error(`Failed to fetch reservation: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Reservation GET by ID API Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch reservation" },
      { status: 500 }
    )
  }
}

// UPDATE reservation by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const authHeader = request.headers.get("authorization")

    console.log("=== PUT Reservation to Laravel ===")
    console.log("Reservation ID:", params.id)
    console.log("Auth Header:", authHeader ? "Present" : "Missing")
    console.log("Body:", body)

    if (!authHeader) {
      console.error("⚠️ No authorization header provided!")
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "No authorization token provided",
        },
        { status: 401 }
      )
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
    }

    const response = await fetch(`${apiUrl}/api/reservations/${params.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    })

    console.log("Laravel Response Status:", response.status)

    const responseText = await response.text()
    console.log("Laravel Response Text:", responseText)

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse response as JSON:", responseText)
      throw new Error("Invalid response from server")
    }

    if (!response.ok) {
      console.error("Laravel Error Response:", data)
      
      // Return the Laravel error with proper status code
      return NextResponse.json(
        {
          success: false,
          error: data.error || "Failed to update reservation",
          message: data.message || "Unknown error",
        },
        { status: response.status }
      )
    }

    console.log("✅ Success Response:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Reservation PUT API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update reservation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// DELETE reservation by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const authHeader = request.headers.get("authorization")

    console.log("=== DELETE Reservation from Laravel ===")
    console.log("Reservation ID:", params.id)
    console.log("Auth Header:", authHeader ? "Present" : "Missing")

    if (!authHeader) {
      console.error("⚠️ No authorization header provided!")
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
          message: "No authorization token provided",
        },
        { status: 401 }
      )
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: authHeader,
    }

    const response = await fetch(`${apiUrl}/api/reservations/${params.id}`, {
      method: "DELETE",
      headers,
    })

    console.log("Laravel Response Status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("Laravel Error Response:", errorData)
      
      return NextResponse.json(
        {
          success: false,
          error: errorData.error || "Failed to delete reservation",
          message: errorData.message || "Unknown error",
        },
        { status: response.status }
      )
    }

    const data = await response.json().catch(() => ({
      success: true,
      message: "Reservation deleted successfully",
    }))

    console.log("✅ Delete Success:", data)

    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Reservation DELETE API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete reservation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}