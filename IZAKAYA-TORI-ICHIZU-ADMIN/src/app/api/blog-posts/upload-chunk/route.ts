export const config = {
  maxDuration: 300,
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: Request) {
  try {
    console.log("[v0] Upload chunk request received")
    console.log("[v0] API_URL:", API_URL)

    const formData = await request.formData()
    const chunk = formData.get("chunk") as Blob
    const chunkIndex = formData.get("chunkIndex") as string
    const totalChunks = formData.get("totalChunks") as string
    const uploadId = formData.get("uploadId") as string
    const fileName = formData.get("fileName") as string
    const fileType = formData.get("fileType") as string

    console.log("[v0] Chunk data:", { chunkIndex, totalChunks, uploadId, fileName, fileType, chunkSize: chunk?.size })

    if (!chunk || !chunkIndex || !totalChunks || !uploadId) {
      console.log("[v0] Missing required fields")
      return Response.json({ error: "Missing required fields" }, { status: 400 })
    }

    const laravelFormData = new FormData()
    laravelFormData.append("chunk", chunk)
    laravelFormData.append("chunkIndex", chunkIndex)
    laravelFormData.append("totalChunks", totalChunks)
    laravelFormData.append("uploadId", uploadId)
    laravelFormData.append("fileName", fileName)
    laravelFormData.append("fileType", fileType)

    console.log("[v0] Sending to Laravel:", `${API_URL}/api/blog-posts/upload-chunk`)

    const response = await fetch(`${API_URL}/api/blog-posts/upload-chunk`, {
      method: "POST",
      body: laravelFormData,
      signal: AbortSignal.timeout(120000),
    })

    console.log("[v0] Laravel response status:", response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Laravel error response:", errorText)

      let errorMessage = "Failed to upload chunk to backend"
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.message || errorJson.error || errorText
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`
      }

      return Response.json(
        {
          error: errorMessage,
          status: response.status,
          details: errorText,
        },
        { status: 500 },
      )
    }

    const data = await response.json()
    console.log("[v0] Chunk upload successful:", data)
    return Response.json(data)
  } catch (error) {
    console.error("[v0] Chunk upload error:", error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    return Response.json(
      {
        error: "Failed to upload chunk",
        details: errorMessage,
      },
      { status: 500 },
    )
  }
}
