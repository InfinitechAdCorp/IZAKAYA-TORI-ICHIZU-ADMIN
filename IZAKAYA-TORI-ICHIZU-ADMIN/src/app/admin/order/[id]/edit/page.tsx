"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  Save,
  Loader2,
  Package,
  User,
  MapPin,
  CreditCard,
  FileText,
  Trash2,
  Plus,
  Minus,
  Star,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

// Order data types
interface OrderItem {
  id: number
  name: string
  description: string
  price: number
  quantity: number
  category: string
  is_spicy: boolean
  is_vegetarian: boolean
  image_url: string
}

interface Order {
  id: number
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string
  delivery_address: string
  delivery_city: string
  delivery_zip_code: string
  payment_method: string
  status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  subtotal: number
  delivery_fee: number
  total_amount: number
  notes?: string
  receipt_file?: string
  items: OrderItem[]
  created_at: string
  updated_at: string
}

const orderStatuses = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800" },
  { value: "preparing", label: "Preparing", color: "bg-orange-100 text-orange-800" },
  { value: "ready", label: "Ready", color: "bg-green-100 text-green-800" },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800" },
]

const paymentMethods = [
  { value: "cash", label: "Cash on Delivery" },
  { value: "gcash", label: "GCash" },
  { value: "paypal", label: "PayPal" },
  { value: "bpi", label: "BPI Online" },
  { value: "maya", label: "Maya" },
]

export default function EditOrderPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [order, setOrder] = useState<Order | null>(null)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch order data
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          router.push("/login")
          return
        }

        const response = await fetch(`/api/orders/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "X-Admin-Request": "true",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch order")
        }

        const result = await response.json()
        if (result.success) {
          setOrder(result.data)
        } else {
          throw new Error(result.message || "Failed to fetch order")
        }
      } catch (error) {
        console.error("Error fetching order:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load order details",
        })
        router.push("/admin/order")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrder()
    }
  }, [params.id, router, toast])

  const handleSave = async () => {
    if (!order) return

    setSaving(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Admin-Request": "true",
        },
        body: JSON.stringify({
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          delivery_city: order.delivery_city,
          delivery_zip_code: order.delivery_zip_code,
          payment_method: order.payment_method,
          status: order.status,
          delivery_fee: order.delivery_fee,
          notes: order.notes,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to update order")
      }

      toast({
        title: "Success",
        description: "Order updated successfully!",
      })

      router.push("/admin/order")
    } catch (error: any) {
      console.error("Error updating order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update order",
      })
    } finally {
      setSaving(false)
    }
  }

  const updateItemQuantity = (itemIndex: number, newQuantity: number) => {
    if (!order || newQuantity < 0) return

    const updatedItems = [...order.items]
    updatedItems[itemIndex].quantity = newQuantity

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total_amount = subtotal + order.delivery_fee

    setOrder({
      ...order,
      items: updatedItems,
      subtotal,
      total_amount,
    })
  }

  const removeItem = (itemIndex: number) => {
    if (!order) return

    const updatedItems = order.items.filter((_, index) => index !== itemIndex)

    // Recalculate totals
    const subtotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
    const total_amount = subtotal + order.delivery_fee

    setOrder({
      ...order,
      items: updatedItems,
      subtotal,
      total_amount,
    })
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen">
              <div className="flex flex-col items-center gap-4 p-8 bg-white rounded-2xl shadow-lg">
                <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Loading Order</h3>
                  <p className="text-gray-600">Please wait while we fetch the order details...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (!order) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2 text-gray-900">Order Not Found</h2>
                <p className="text-gray-600 mb-6">The requested order could not be found or may have been deleted.</p>
                <Button
                  onClick={() => router.push("/admin/order")}
                  className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Orders
                </Button>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 via-red-50 to-orange-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b bg-white/80 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold">Edit Order</span>
              </div>
            </div>
          )}

          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-6">
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                  <div className="flex items-start gap-4">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/admin/order")}
                      className="hover:bg-orange-50 border-orange-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
                          Order #{order.order_number}
                        </h1>
                        <Badge className={`${orderStatuses.find((s) => s.value === order.status)?.color} px-3 py-1`}>
                          {orderStatuses.find((s) => s.value === order.status)?.label}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Created{" "}
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {order.customer_name}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="text-right">
                      <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                        ₱{order.total_amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">Total Amount</div>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      size="lg"
                      className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="xl:col-span-2 space-y-6">
                  <Card className="shadow-sm border-orange-100 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900">Customer Information</div>
                          <div className="text-sm font-normal text-gray-600">Personal details and contact info</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="customer_name" className="text-sm font-semibold text-gray-700">
                            Customer Name
                          </Label>
                          <Input
                            id="customer_name"
                            value={order.customer_name}
                            onChange={(e) => setOrder({ ...order, customer_name: e.target.value })}
                            className="border-orange-200 focus:border-red-400 focus:ring-red-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="customer_email" className="text-sm font-semibold text-gray-700">
                            Email Address
                          </Label>
                          <Input
                            id="customer_email"
                            type="email"
                            value={order.customer_email}
                            onChange={(e) => setOrder({ ...order, customer_email: e.target.value })}
                            className="border-orange-200 focus:border-red-400 focus:ring-red-400/20"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customer_phone" className="text-sm font-semibold text-gray-700">
                          Phone Number
                        </Label>
                        <Input
                          id="customer_phone"
                          value={order.customer_phone}
                          onChange={(e) => setOrder({ ...order, customer_phone: e.target.value })}
                          className="border-orange-200 focus:border-red-400 focus:ring-red-400/20"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-orange-100 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900">Delivery Information</div>
                          <div className="text-sm font-normal text-gray-600">Address and location details</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-5">
                      <div className="space-y-2">
                        <Label htmlFor="delivery_address" className="text-sm font-semibold text-gray-700">
                          Delivery Address
                        </Label>
                        <Textarea
                          id="delivery_address"
                          value={order.delivery_address}
                          onChange={(e) => setOrder({ ...order, delivery_address: e.target.value })}
                          rows={3}
                          className="border-orange-200 focus:border-red-400 focus:ring-red-400/20 resize-none"
                          placeholder="Enter complete delivery address..."
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="delivery_city" className="text-sm font-semibold text-gray-700">
                            City
                          </Label>
                          <Input
                            id="delivery_city"
                            value={order.delivery_city}
                            onChange={(e) => setOrder({ ...order, delivery_city: e.target.value })}
                            className="border-orange-200 focus:border-red-400 focus:ring-red-400/20"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="delivery_zip_code" className="text-sm font-semibold text-gray-700">
                            ZIP Code
                          </Label>
                          <Input
                            id="delivery_zip_code"
                            value={order.delivery_zip_code}
                            onChange={(e) => setOrder({ ...order, delivery_zip_code: e.target.value })}
                            className="border-orange-200 focus:border-red-400 focus:ring-red-400/20"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-orange-100 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3 text-lg">
                          <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="text-gray-900">Order Items</div>
                            <div className="text-sm font-normal text-gray-600">
                              {order.items.length} items in this order
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800 px-3 py-1">
                          {order.items.length} Items
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="group bg-gradient-to-r from-gray-50 to-orange-50/30 hover:from-orange-50 hover:to-red-50/30 rounded-xl p-5 border border-orange-100 hover:border-orange-200 transition-all duration-200"
                          >
                            <div className="flex items-center gap-5">
                              <div className="relative">
                                <div className="w-20 h-20 rounded-xl overflow-hidden shadow-sm">
                                  <Image
                                    src={item.image_url || "/placeholder.svg?height=80&width=80&query=delicious food"}
                                    alt={item.name}
                                    width={80}
                                    height={80}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-200"
                                  />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                                  <Star className="w-3 h-3 text-white" />
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-gray-900 text-lg mb-1">{item.name}</h4>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <Badge variant="outline" className="text-xs border-orange-200 text-orange-700">
                                    {item.category}
                                  </Badge>
                                  {item.is_spicy && (
                                    <Badge className="text-xs bg-red-100 text-red-700 hover:bg-red-200">🌶️ Spicy</Badge>
                                  )}
                                  {item.is_vegetarian && (
                                    <Badge className="text-xs bg-green-100 text-green-700 hover:bg-green-200">
                                      🌱 Vegetarian
                                    </Badge>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-lg font-bold text-gray-900">₱{item.price.toFixed(2)}</div>
                                  <div className="text-sm text-gray-500">per item</div>
                                </div>

                                <div className="flex items-center gap-2 bg-white rounded-lg p-2 shadow-sm border border-orange-100">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateItemQuantity(index, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <Input
                                    type="number"
                                    value={item.quantity}
                                    onChange={(e) => updateItemQuantity(index, Number.parseInt(e.target.value) || 0)}
                                    className="w-16 h-8 text-center border-orange-200 focus:border-red-400"
                                    min="1"
                                  />
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => updateItemQuantity(index, item.quantity + 1)}
                                    className="h-8 w-8 p-0 border-orange-200 hover:bg-orange-50 hover:border-orange-300"
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                </div>

                                <div className="text-right min-w-[100px]">
                                  <div className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                    ₱{(item.price * item.quantity).toFixed(2)}
                                  </div>
                                  <div className="text-sm text-gray-500">subtotal</div>
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(index)}
                                  className="h-10 w-10 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="shadow-sm border-orange-100 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-3 text-lg">
                        <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                          <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-gray-900">Special Notes</div>
                          <div className="text-sm font-normal text-gray-600">Additional instructions or requests</div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Textarea
                        placeholder="Add any special notes, dietary restrictions, or delivery instructions..."
                        value={order.notes || ""}
                        onChange={(e) => setOrder({ ...order, notes: e.target.value })}
                        rows={4}
                        className="border-orange-200 focus:border-red-400 focus:ring-red-400/20 resize-none"
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-6">
                  {/* Order Status */}
                  <Card className="shadow-sm border-orange-100 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CheckCircle2 className="w-5 h-5 text-red-600" />
                        Order Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Select
                        value={order.status}
                        onValueChange={(value) => setOrder({ ...order, status: value as any })}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-red-400 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {orderStatuses.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              <div className="flex items-center gap-2">
                                <div
                                  className={`w-3 h-3 rounded-full ${
                                    status.color.includes("yellow")
                                      ? "bg-yellow-400"
                                      : status.color.includes("blue")
                                        ? "bg-blue-400"
                                        : status.color.includes("orange")
                                          ? "bg-orange-400"
                                          : status.color.includes("green")
                                            ? "bg-green-400"
                                            : "bg-red-400"
                                  }`}
                                />
                                {status.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  {/* Payment Method */}
                  <Card className="shadow-sm border-orange-100 hover:shadow-md transition-shadow duration-200">
                    <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <CreditCard className="w-5 h-5 text-orange-600" />
                        Payment Method
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <Select
                        value={order.payment_method}
                        onValueChange={(value) => setOrder({ ...order, payment_method: value })}
                      >
                        <SelectTrigger className="border-orange-200 focus:border-red-400 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method.value} value={method.value}>
                              {method.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </CardContent>
                  </Card>

                  <Card className="shadow-lg border-orange-200 bg-gradient-to-br from-white to-orange-50/30">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg border-b border-green-100">
                      <CardTitle className="flex items-center gap-2 text-lg text-green-800">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                          <Package className="w-4 h-4 text-white" />
                        </div>
                        Order Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="font-semibold text-lg">₱{order.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600">Delivery Fee:</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">₱</span>
                            <Input
                              type="number"
                              value={order.delivery_fee}
                              onChange={(e) => {
                                const newDeliveryFee = Number.parseFloat(e.target.value) || 0
                                setOrder({
                                  ...order,
                                  delivery_fee: newDeliveryFee,
                                  total_amount: order.subtotal + newDeliveryFee,
                                })
                              }}
                              className="w-24 h-9 text-right border-orange-200 focus:border-red-400"
                              step="0.01"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-orange-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-lg font-semibold text-gray-900">Total Amount:</span>
                          <div className="text-right">
                            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                              ₱{order.total_amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">Final amount</div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
