import { type NextRequest, NextResponse } from "next/server"
import { sendBookingStatusEmail } from "@/lib/email"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const eventId = params.id

    const token = request.headers.get("authorization")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = token
    }

    const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
      method: "GET",
      headers,
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, message: errorData.message || `Failed to fetch event` },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch event" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const eventId = params.id
    const body = await request.json()

    const token = request.headers.get("authorization")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = token
    }

    // Store the reason separately as it's not part of the backend update
    const declineReason = body.reason

    const updatePayload = {
      ...(body.status && { status: body.status }),
      ...(body.name && { name: body.name }),
      ...(body.email && { email: body.email }),
      ...(body.eventType && { eventType: body.eventType }),
      ...(body.guests && { guests: body.guests }),
      ...(body.preferredDate && { preferredDate: body.preferredDate }),
      ...(body.preferredTime && { preferredTime: body.preferredTime }),
      ...(body.venueArea && { venueArea: body.venueArea }),
      ...(body.notes && { notes: body.notes }),
    }

    console.log("[v0] Sending PATCH request to:", `${apiUrl}/api/events/${eventId}`)
    console.log("[v0] Payload:", updatePayload)

    const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(updatePayload),
    })

    const responseData = await response.json().catch(() => ({}))
    console.log("[v0] Backend response status:", response.status)
    console.log("[v0] Backend response data:", responseData)

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: responseData.message || responseData.error || "Failed to update event" },
        { status: response.status },
      )
    }

    // Get the updated event data
    const eventData = responseData.data || responseData

    // Send email notification if status is confirmed or cancelled
    if (body.status && (body.status === 'confirmed' || body.status === 'cancelled')) {
      try {
        console.log("[v0] Sending email notification for status:", body.status)
        
        await sendBookingStatusEmail({
          to: eventData.email,
          customerName: eventData.name,
          eventId: parseInt(eventId),
          eventType: eventData.event_type || eventData.eventType,
          guests: eventData.guests,
          preferredDate: eventData.preferred_date || eventData.preferredDate,
          preferredTime: eventData.preferred_time || eventData.preferredTime,
          venueArea: eventData.venueArea || eventData.venue_area,
          status: body.status,
          reason: body.status === 'cancelled' ? declineReason : undefined,
        })

        console.log("[v0] Email notification sent successfully")
      } catch (emailError) {
        console.error("[v0] Failed to send email notification:", emailError)
        // Don't fail the request if email fails, just log it
        // The status update was successful, email is a bonus feature
      }
    }

    return NextResponse.json({ success: true, data: responseData })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ success: false, message: "Failed to update event" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const eventId = params.id

    const token = request.headers.get("authorization")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (token) {
      headers["Authorization"] = token
    }

    const response = await fetch(`${apiUrl}/api/events/${eventId}`, {
      method: "DELETE",
      headers,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json(
        { success: false, message: errorData.message || "Failed to delete event" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ success: false, message: "Failed to delete event" }, { status: 500 })
  }
}
