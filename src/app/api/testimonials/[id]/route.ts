// app/api/testimonials/[id]/route.ts
import { NextResponse } from "next/server"

// GET - Fetch single testimonial
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const { id } = params
    
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }
    
    const response = await fetch(`${apiUrl}/api/testimonials/${id}`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })
    
    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Testimonial Fetch Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch testimonial", details: error.message },
      { status: 500 }
    )
  }
}

// PUT - Update testimonial
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const { id } = params
    
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }
    
    console.log(`Updating testimonial ${id}:`, body)
    
    const response = await fetch(`${apiUrl}/api/testimonials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log("Update success:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Testimonials Update Error:", error)
    return NextResponse.json(
      { error: "Failed to update testimonial", details: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Delete testimonial
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const { id } = params
    
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }
    
    console.log(`Deleting testimonial ${id}`)
    
    const response = await fetch(`${apiUrl}/api/testimonials/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error("Backend error:", errorText)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log("Delete success:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Testimonials Delete Error:", error)
    return NextResponse.json(
      { error: "Failed to delete testimonial", details: error.message },
      { status: 500 }
    )
  }
}
