const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/api/blog-posts/${id}`, {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch blog post')
    }
    
    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error fetching blog post:', error)
    return Response.json({ error: "Failed to fetch blog post" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const formData = await request.formData()

    // Create new FormData with _method for Laravel
    const laravelFormData = new FormData()
    laravelFormData.append("_method", "PUT")
    
    for (const [key, value] of formData.entries()) {
      laravelFormData.append(key, value)
    }

    const response = await fetch(`${API_URL}/api/blog-posts/${id}`, {
      method: "POST",
      body: laravelFormData,
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to update' }))
      return Response.json(error, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error updating blog post:', error)
    return Response.json({ error: "Failed to update blog post" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const response = await fetch(`${API_URL}/api/blog-posts/${id}`, {
      method: "DELETE",
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Failed to delete' }))
      return Response.json(error, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error('Error deleting blog post:', error)
    return Response.json({ error: "Failed to delete blog post" }, { status: 500 })
  }
}
