import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.message) {
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, and message are required fields. 이름, 이메일, 메시지는 필수 항목입니다.',
          errors: {
            name: !body.name ? ['Name is required'] : [],
            email: !body.email ? ['Email is required'] : [],
            message: !body.message ? ['Message is required'] : [],
          }
        },
        { status: 400 }
      )
    }

    // Send to Laravel backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        phone: body.phone || '',
        subject: body.subject || '',
        message: body.message,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data, { status: 201 })

  } catch (error) {
    console.error('Contact API Error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send message. Please try again later. 메시지 전송에 실패했습니다. 나중에 다시 시도해 주세요.',
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json(
    {
      success: true,
      message: 'Izakaya Tori Ichizu Restaurant Contact API is running! 연락처 API가 작동 중입니다!',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}