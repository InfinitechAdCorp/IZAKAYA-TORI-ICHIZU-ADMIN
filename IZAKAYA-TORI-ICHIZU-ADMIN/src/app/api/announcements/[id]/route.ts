// app/api/announcements/[id]/route.ts

import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// PUT - Update an announcement
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!API_URL) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    const body = await request.json()
    
    // Log for debugging
    console.log('Updating announcement:', params.id, body)
    
    const response = await fetch(`${API_URL}/api/announcements/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        title: body.title,
        content: body.content,
        is_active: body.isActive, // Make sure this matches your Laravel controller expectation
      }),
    })

    // Get response text first for debugging
    const responseText = await response.text()
    console.log('Laravel response:', response.status, responseText)

    if (!response.ok) {
      // Try to parse error message
      let errorMessage = response.statusText
      try {
        const errorData = JSON.parse(responseText)
        errorMessage = errorData.message || errorMessage
      } catch (e) {
        // If not JSON, use the text
        errorMessage = responseText || errorMessage
      }
      throw new Error(`Failed to update announcement: ${errorMessage}`)
    }

    // Parse the successful response
    const data = JSON.parse(responseText)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating announcement:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update announcement" }, 
      { status: 500 }
    )
  }
}

// DELETE - Delete an announcement
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!API_URL) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    const response = await fetch(`${API_URL}/api/announcements/${params.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })

    if (!response.ok) {
      const responseText = await response.text()
      throw new Error(`Failed to delete announcement: ${responseText || response.statusText}`)
    }

    return NextResponse.json({ message: "Announcement deleted" })
  } catch (error) {
    console.error("Error deleting announcement:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete announcement" }, 
      { status: 500 }
    )
  }
}
