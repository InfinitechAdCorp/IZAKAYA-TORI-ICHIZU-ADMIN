import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// Helper function to get auth token from request
function getAuthToken(request: NextRequest): string | null {
  // First check Authorization header
  const authHeader = request.headers.get("authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.replace("Bearer ", "")
    console.log("[API Route] Found token in Authorization header")
    return token
  }
  
  // Then check cookies
  const cookieToken = request.cookies.get("token")?.value || request.cookies.get("auth_token")?.value
  if (cookieToken) {
    console.log("[API Route] Found token in cookies")
    return cookieToken
  }
  
  console.log("[API Route] No token found in headers or cookies")
  return null
}

// GET - Fetch single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-cache",
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch product" },
        { status: response.status }
      )
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST - Update product (with _method: PUT for Laravel)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request)
    
    if (!token) {
      console.error("[API Route] No auth token found in POST request")
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
    }

    console.log("[API Route] Updating product:", params.id)
    
    const formData = await request.formData()
    
    const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })
    
    const responseData = await response.json()
    
    if (!response.ok) {
      console.error("[API Route] Update failed:", responseData)
      return NextResponse.json(
        {
          message: responseData.message || "Failed to update product",
          errors: responseData.errors || null,
        },
        { status: response.status }
      )
    }
    
    console.log("[API Route] Update successful")
    return NextResponse.json(responseData)
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request)
    
    if (!token) {
      console.error("[API Route] No auth token found in DELETE request")
      console.error("[API Route] Authorization header:", request.headers.get("authorization"))
      console.error("[API Route] Cookies:", request.cookies.getAll())
      return NextResponse.json({ message: "Unauthorized - No authentication token provided" }, { status: 401 })
    }

    console.log("[API Route] Deleting product:", params.id)
    console.log("[API Route] Using token (first 20 chars):", token.substring(0, 20) + "...")
    
    const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("[API Route] Delete failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      })
      
      // Provide more specific error messages
      if (response.status === 401) {
        return NextResponse.json(
          { message: "Authentication failed - Invalid or expired token" },
          { status: 401 }
        )
      }
      
      return NextResponse.json(
        { message: errorData.message || "Failed to delete product" },
        { status: response.status }
      )
    }
    
    const data = await response.json().catch(() => ({ 
      success: true,
      message: "Product deleted successfully" 
    }))
    
    console.log("[API Route] Delete successful:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[API Route] Error deleting product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
