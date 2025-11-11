import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('=== REGISTRATION DEBUG START ===')
    console.log('Request body received:', body)
    
    // Validate required fields
    if (!body.name || !body.email || !body.password || !body.password_confirmation) {
      console.log('Validation failed - missing required fields')
      return NextResponse.json(
        {
          success: false,
          message: 'Name, email, password, and password confirmation are required. 이름, 이메일, 비밀번호, 비밀번호 확인은 필수 항목입니다.',
          errors: {
            name: !body.name ? ['Name is required'] : [],
            email: !body.email ? ['Email is required'] : [],
            password: !body.password ? ['Password is required'] : [],
            password_confirmation: !body.password_confirmation ? ['Password confirmation is required'] : [],
          }
        },
        { status: 400 }
      )
    }

    // Password validation
    if (body.password !== body.password_confirmation) {
      console.log('Password confirmation mismatch')
      return NextResponse.json(
        {
          success: false,
          message: 'Passwords do not match. 비밀번호가 일치하지 않습니다.',
          errors: {
            password_confirmation: ['The password confirmation does not match.']
          }
        },
        { status: 400 }
      )
    }

    if (body.password.length < 8) {
      console.log('Password too short')
      return NextResponse.json(
        {
          success: false,
          message: 'Password must be at least 8 characters long. 비밀번호는 8자 이상이어야 합니다.',
          errors: {
            password: ['The password must be at least 8 characters.']
          }
        },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const fullUrl = `${apiUrl}/api/auth/register`
    
    console.log('Attempting to connect to Laravel API at:', fullUrl)
    
    const requestData = {
      name: body.name.trim(),
      email: body.email.trim().toLowerCase(),
      phone: body.phone?.trim() || '',
      address: body.address?.trim() || '',
      city: body.city?.trim() || '',
      zip_code: body.zip_code?.trim() || '',
      password: body.password,
      password_confirmation: body.password_confirmation,
    }
    
    console.log('Sending data to Laravel:', { ...requestData, password: '[HIDDEN]', password_confirmation: '[HIDDEN]' })
    
    // Send to Laravel backend
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestData),
    })

    console.log('Laravel API response status:', response.status)
    console.log('Laravel API response headers:', Object.fromEntries(response.headers.entries()))

    let data
    const responseText = await response.text()
    console.log('Laravel API raw response:', responseText)
    
    try {
      data = JSON.parse(responseText)
      console.log('Laravel API parsed response:', data)
    } catch (parseError) {
      console.error('Failed to parse Laravel response as JSON:', parseError)
      console.log('Response was not valid JSON, raw text:', responseText)
      
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from server. Server may be down or returning HTML error page.',
          error: 'Invalid JSON response',
          rawResponse: responseText.substring(0, 500), // First 500 chars for debugging
          debug: {
            url: fullUrl,
            status: response.status,
            statusText: response.statusText
          }
        },
        { status: 502 }
      )
    }

    console.log('=== REGISTRATION DEBUG END ===')

    // Return the response with the same status code
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    })

  } catch (error: unknown) {
    console.error('=== REGISTRATION ERROR ===')

    if (error instanceof Error) {
      console.error('Error type:', error.constructor.name)
      console.error('Error message:', error.message)
      console.error('Full error:', error)
      console.error('Stack trace:', error.stack)
    } else {
      console.error('Non-Error thrown:', error)
    }
    
    // Check if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Network/Connection error detected')
      return NextResponse.json(
        {
          success: false,
          message: 'Cannot connect to the server. Please make sure your Laravel backend is running on http://localhost:8000. 서버에 연결할 수 없습니다.',
          error: 'Connection failed to Laravel backend',
          debug: {
            errorType: 'NetworkError',
            errorMessage: error instanceof Error ? error.message : String(error),
            apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
          }
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json(
      {
        success: false,
        message: 'Registration failed. Please try again later. 회원가입에 실패했습니다. 나중에 다시 시도해 주세요.',
        error: error instanceof Error ? error.message : 'Unknown error',
        debug: {
          errorType: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack?.split('\n').slice(0, 5) : [],
        }
      },
      { status: 500 }
    )
  }
}
