import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    
    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: 'Authentication token is required. 인증 토큰이 필요합니다.',
        },
        { status: 401 }
      )
    }

    // Send to Laravel backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Logout API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Logout failed. Please try again later. 로그아웃에 실패했습니다. 나중에 다시 시도해 주세요.',
      },
      { status: 500 }
    )
  }
}