import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    // Get token from Authorization header (sent from frontend)
    const authHeader = request.headers.get("authorization")
    
    console.log("=== GET Reservations ===")
    console.log("Auth Header:", authHeader ? "Present" : "Missing")
    console.log("API URL:", apiUrl)
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    
    if (authHeader) {
      headers["Authorization"] = authHeader
      console.log("✅ Authorization header forwarded")
    } else {
      console.warn("⚠️ No authorization header - will fetch public reservations only")
    }
    
    const response = await fetch(`${apiUrl}/api/reservations`, {
      method: "GET",
      headers,
      cache: 'no-store', // Disable caching to ensure fresh data
    })
    
    console.log("Laravel Response Status:", response.status)
    
    const responseText = await response.text()
    console.log("Laravel Response (raw):", responseText.substring(0, 500)) // Log first 500 chars
    
    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText }
      }
      console.error("❌ Laravel Error:", errorData)
      throw new Error(`Failed to fetch reservations: ${response.status}`)
    }
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error("Failed to parse response as JSON:", responseText)
      throw new Error("Invalid response from server")
    }
    
    // Log the data structure
    console.log("Data structure:", {
      hasSuccess: 'success' in data,
      hasData: 'data' in data,
      isArray: Array.isArray(data),
      dataIsArray: data.data ? Array.isArray(data.data) : false,
      count: data.data ? data.data.length : (Array.isArray(data) ? data.length : 0),
      debug: data.debug
    })
    
    // If there's data, log the statuses
    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
      const statuses = data.data.map((r: any) => r.status)
      const statusCounts = statuses.reduce((acc: any, status: string) => {
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
      console.log("Status breakdown:", statusCounts)
      console.log("Sample reservation:", data.data[0])
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("❌ Reservations GET API Error:", error)
    return NextResponse.json(
      { 
        error: "Failed to fetch reservations",
        message: error instanceof Error ? error.message : "Unknown error"
      }, 
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    // Get auth token from Authorization header (sent from frontend)
    const authHeader = request.headers.get("authorization")
    
    console.log("=== POST Reservation to Laravel ===")
    console.log("Auth Header:", authHeader ? "Present" : "Missing")
    console.log("Body:", body)
    console.log("API URL:", `${apiUrl}/api/reservations`)
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }
    
    if (authHeader) {
      headers["Authorization"] = authHeader
      console.log("✅ Authorization header forwarded to Laravel")
    } else {
      console.warn("⚠️ No authorization header - reservation will be created as guest")
    }
    
    const response = await fetch(`${apiUrl}/api/reservations`, {
      method: "POST",
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
      console.error("❌ Laravel Error Response:", data)
      throw new Error(data.message || "Failed to create reservation")
    }
    
    console.log("✅ Success Response:", data)
    
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("❌ Reservation POST API Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create reservation",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
