import { ApiResponse, PaginatedResponse, Order, OrderItem } from '@/types'

const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || ''}/api`

class ApiClient {
  getReservations() {
    throw new Error("Method not implemented.")
  }
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Request failed')
    }

    return response.json()
  }

  // Orders
  async getOrders(params?: Record<string, string>): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const searchParams = new URLSearchParams(params)
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request(`/orders${query}`)
  }

  async getOrder(id: number): Promise<ApiResponse<{ order: Order }>> {
    return this.request(`/orders/${id}`)
  }

  async createOrder(orderData: {
    items: Array<{
      name: string
      description?: string
      price: number
      quantity: number
      category?: string
      is_spicy?: boolean
      is_vegetarian?: boolean
      image_url?: string
    }>
    payment_method: string
    delivery_address: string
    delivery_city: string
    delivery_zip_code: string
    customer_name: string
    customer_email: string
    customer_phone: string
    receipt_file?: string
    notes?: string
  }): Promise<ApiResponse<{ order: Order }>> {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })
  }

  // Order Items
  async getOrderItems(params?: Record<string, string>): Promise<ApiResponse<PaginatedResponse<OrderItem>>> {
    const searchParams = new URLSearchParams(params)
    const query = searchParams.toString() ? `?${searchParams.toString()}` : ''
    return this.request(`/order-items${query}`)
  }
}

export const apiClient = new ApiClient()
