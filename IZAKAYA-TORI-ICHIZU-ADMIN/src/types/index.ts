export interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: number
  order_id: number
  name: string
  description?: string
  price: number
  quantity: number
  category?: string
  is_spicy: boolean
  is_vegetarian: boolean
  image_url?: string
  subtotal: number
  created_at: string
  updated_at: string
  order?: {
    id: number
    order_number: string
    created_at: string
    order_status: string
  }
}

export interface Order {
  customer_id: number
  id: number
  user_id: number
  order_number: string
  total_amount: number
  subtotal: number
  delivery_fee: number
  payment_method: "cash" | "gcash" | "paypal" | "bpi" | "maya"
  payment_status: "pending" | "paid" | "failed" | "refunded"
  order_status: "pending" | "confirmed" | "preparing" | "ready" | "out_for_delivery" | "delivered" | "cancelled"
  delivery_address: string
  delivery_city: string
  delivery_zip_code: string
  customer_name: string
  customer_email: string
  customer_phone: string
  receipt_file?: string
  notes?: string
  delivered_at?: string
  created_at: string
  updated_at: string
  order_items?: OrderItem[]
  isFeatured?: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: string
  errors?: Record<string, string[]>
}

export interface CheckoutInfo {
  name: string
  email: string
  phone: string
  address: string
  city: string
  zipCode: string
  paymentMethod: string
}

export interface PaginatedResponse<T> {
  data: any
  orders: any
  items: T[]
  pagination: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
}

export interface MenuItem {
  id: string | number
  name: string
  description: string
  price: number
  category: string
  image: string
  isSpicy?: boolean
  isVegetarian?: boolean
  is_spicy?: boolean
  is_vegetarian?: boolean
  isFeatured?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number
}
