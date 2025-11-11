import { NextRequest, NextResponse } from 'next/server'

const LARAVEL_API_BASE = process.env.LARAVEL_API_URL || 'http://localhost:8000/api'

export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('Authorization')
    
    if (!authToken) {
      return NextResponse.json(
        { success: false, message: 'Authorization token required' },
        { status: 401 }
      )
    }

    const url = new URL(request.url)
    const searchParams = url.searchParams
    
    const laravelUrl = new URL(`${LARAVEL_API_BASE}/order-items`)
    searchParams.forEach((value, key) => {
      laravelUrl.searchParams.append(key, value)
    })

    const response = await fetch(laravelUrl.toString(), {
      method: 'GET',
      headers: {
        'Authorization': authToken,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Failed to fetch order items' },
        { status: response.status }
      )
    }

    return NextResponse.json(data, { status: 200 })

  } catch (error) {
    console.error('Error fetching order items:', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}