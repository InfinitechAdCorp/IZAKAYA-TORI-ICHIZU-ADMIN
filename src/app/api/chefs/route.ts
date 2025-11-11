export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/chefs`, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch chefs from backend")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Chefs API Error:", error)
    return Response.json({ error: "Failed to fetch chefs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const formData = await request.formData()

    console.log("Sending to:", `${apiUrl}/api/chefs`)
    console.log("FormData entries:", Array.from(formData.entries()))

    const response = await fetch(`${apiUrl}/api/chefs`, {
      method: "POST",
      body: formData,
    })

    const responseText = await response.text()
    console.log("Backend response status:", response.status)
    console.log("Backend response text:", responseText)

    if (!response.ok) {
      let errorData
      try {
        errorData = JSON.parse(responseText)
      } catch {
        errorData = { message: responseText || "Unknown error" }
      }
      console.error("Backend error:", errorData)
      return Response.json({ 
        error: "Failed to create chef", 
        details: errorData 
      }, { status: response.status })
    }

    const data = JSON.parse(responseText)
    return Response.json(data)
  } catch (error) {
    console.error("Create Chef Error:", error)
    return Response.json({ error: "Failed to create chef", details: String(error) }, { status: 500 })
  }
}