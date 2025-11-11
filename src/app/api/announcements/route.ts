// File: app/api/announcements/route.ts

export async function GET(request: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }

    const response = await fetch(`${apiUrl}/api/announcements`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Backend error response:", errorData)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Announcements Fetch Error:", error)
    return Response.json(
      { error: "Failed to fetch announcements" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }

    const response = await fetch(`${apiUrl}/api/announcements`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("Backend error response:", errorData)
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data, { status: 201 })
  } catch (error) {
    console.error("Announcements Create Error:", error)
    return Response.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    )
  }
}