import { type NextRequest, NextResponse } from "next/server"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

// GET - Fetch all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Build query parameters
    const queryParams = new URLSearchParams()
    
    // Add all search parameters to the Laravel API call
    searchParams.forEach((value, key) => {
      queryParams.append(key, value)
    })
    
    const apiUrl = `${API_BASE_URL}/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    
    console.log("Fetching from:", apiUrl)
    
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch products" },
        { status: response.status },
      )
    }
    
    const data = await response.json()
    
    // Handle paginated response - extract the data array
    const products = data.data || data
    
    // Transform image paths - Laravel now returns full URLs, just pass them through
    const productsWithFullImageUrls = Array.isArray(products) 
      ? products.map(product => ({
          ...product,
          // Image URL is already complete from Laravel, no transformation needed
          image: product.image || null
        }))
      : products
    
    return NextResponse.json(productsWithFullImageUrls, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    })
  } catch (error) {
    console.error("Error fetching products:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")
    
    const formData = await request.formData()
    
    // Create a new FormData object to send to Laravel
    const laravelFormData = new FormData()
    
    // Extract and append all form fields
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const price = formData.get("price") as string
    const category = formData.get("category") as string
    const isSpicy = formData.get("is_spicy") as string
    const isVegetarian = formData.get("is_vegetarian") as string
    const isFeatured = formData.get("is_featured") as string
    const image = formData.get("image") as File
    
    laravelFormData.append("name", name)
    laravelFormData.append("description", description)
    laravelFormData.append("price", price)
    laravelFormData.append("category", category)
    laravelFormData.append("is_spicy", isSpicy === "true" ? "1" : "0")
    laravelFormData.append("is_vegetarian", isVegetarian === "true" ? "1" : "0")
    laravelFormData.append("is_featured", isFeatured === "true" ? "1" : "0")
    
    if (image && image.size > 0) {
      laravelFormData.append("image", image)
    }
    
    // Build headers
    const headers: HeadersInit = {}
    if (token) {
      headers["Authorization"] = token
    }
    
    const response = await fetch(`${API_BASE_URL}/api/products`, {
      method: "POST",
      headers,
      body: laravelFormData,
    })
    
    const responseData = await response.json()
    
    if (!response.ok) {
      return NextResponse.json(
        {
          message: responseData.message || "Failed to create product",
          errors: responseData.errors || null,
        },
        { status: response.status },
      )
    }
    
    return NextResponse.json(responseData, { status: 201 })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
