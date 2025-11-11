export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const response = await fetch(`${apiUrl}/api/promos`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch promos from backend")
    }

    const data = await response.json()
    return Response.json(data)
  } catch (error) {
    console.error("Promos API Error:", error)
    return Response.json({ error: "Failed to fetch promos" }, { status: 500 })
  }
}
