export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    
    if (!apiUrl) {
      throw new Error("NEXT_PUBLIC_API_URL is not defined")
    }

    const response = await fetch(`${apiUrl}/api/testimonials`, {
      headers: {
        "Content-Type": "application/json",
      },
      // Disable cache for fresh data
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Testimonials API Error:", error)
    return Response.json(
      { error: "Failed to fetch testimonials" },
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

    const response = await fetch(`${apiUrl}/api/testimonials`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Testimonials Submit Error:", error)
    return Response.json(
      { error: "Failed to submit testimonial" },
      { status: 500 }
    )
  }
}

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

    const response = await fetch(`${apiUrl}/api/testimonials/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Testimonials Update Error:", error)
    return Response.json(
      { error: "Failed to update testimonial" },
      { status: 500 }
    )
  }
}

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

    const response = await fetch(`${apiUrl}/api/testimonials/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}: ${response.statusText}`)
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Testimonials Delete Error:", error)
    return Response.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    )
  }
}