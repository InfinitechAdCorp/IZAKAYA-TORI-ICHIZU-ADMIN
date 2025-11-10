import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication token is required. 인증 토큰이 필요합니다.",
        },
        { status: 401 },
      )
    }

    // Send to Laravel backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error("Get User API Error:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Failed to get user information. 사용자 정보를 가져올 수 없습니다.",
      },
      { status: 500 },
    )
  }
}
