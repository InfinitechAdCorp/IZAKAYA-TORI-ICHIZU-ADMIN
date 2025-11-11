export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const formData = await request.formData()

    const response = await fetch(`${apiUrl}/api/chefs/${params.id}`, {
      method: "PUT",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("Backend error:", errorData)
      return Response.json({ 
        error: "Failed to update chef", 
        details: errorData 
      }, { status: response.status })
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Update Chef Error:", error)
    return Response.json({ error: "Failed to update chef" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL

    const response = await fetch(`${apiUrl}/api/chefs/${params.id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
      console.error("Backend error:", errorData)
      return Response.json({ 
        error: "Failed to delete chef", 
        details: errorData 
      }, { status: response.status })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error("Delete Chef Error:", error)
    return Response.json({ error: "Failed to delete chef" }, { status: 500 })
  }
}