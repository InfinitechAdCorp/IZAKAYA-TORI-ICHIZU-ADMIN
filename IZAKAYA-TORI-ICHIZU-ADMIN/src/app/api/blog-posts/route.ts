const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/api/blog-posts`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch blog posts from backend")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Blog API Error:", error)
    return Response.json({ error: "Failed to fetch blog posts" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    // Forward the FormData directly to Laravel backend
    const response = await fetch(`${API_URL}/api/blog-posts`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to create blog post")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Blog API Error:", error)
    return Response.json({ error: "Failed to create blog post" }, { status: 500 })
  }
}
