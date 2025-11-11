import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: "Email and password are required..",
          errors: {
            email: !body.email ? ["Email is required"] : [],
            password: !body.password ? ["Password is required"] : [],
          },
        },
        { status: 400 },
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const fullUrl = `${apiUrl}/api/auth/login`

    const requestData = {
      email: body.email.trim().toLowerCase(),
      password: body.password,
    }

    // Send to Laravel backend
    const response = await fetch(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(requestData),
    })

    let data
    const responseText = await response.text()

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("[v0] Failed to parse response as JSON:", parseError)

      return NextResponse.json(
        {
          success: false,
          message: "Invalid response from server. Server may be down or returning HTML error page.",
          error: "Invalid JSON response",
          rawResponse: responseText.substring(0, 500),
          debug: {
            url: fullUrl,
            status: response.status,
            statusText: response.statusText,
          },
        },
        { status: 502 },
      )
    }

    // Return the response with the same status code
    return NextResponse.json(data, {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
      },
    })
  } catch (error: unknown) {
    console.error("[v0] Login error:", error instanceof Error ? error.message : String(error))

    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes("fetch")) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Cannot connect to the server. 서버에 연결할 수 없습니다.",
          error: "Connection failed",
          debug: {
            errorType: "NetworkError",
            errorMessage: error instanceof Error ? error.message : String(error),
            apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
          },
        },
        { status: 503 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Login failed. Please try again later. 로그인에 실패했습니다. 나중에 다시 시도해 주세요.",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
