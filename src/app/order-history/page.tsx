"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import OrderDetailsModal from "@/components/modal/order-details-modal"
import {
  ArrowLeft,
  Clock,
  CheckCircle,
  Truck,
  Package,
  MapPin,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  date: string
  status: "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  total: number
  deliveryAddress: string
  trackingNumber?: string
  estimatedDelivery?: string
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrderId, setSelectedOrderId] = useState<string | "all">("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all")
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null)
  const ordersPerPage = 4

  useEffect(() => {
    const mockOrders: Order[] = [
      {
        id: "ORD-001",
        date: "2024-01-15",
        status: "delivered",
        items: [
          { id: "1", name: "Bulgogi Bowl", price: 14.99, quantity: 2 },
          { id: "2", name: "Kimchi Fried Rice", price: 12.99, quantity: 1 },
        ],
        total: 45.96,
        deliveryAddress: "123 Main St, City, State 12345",
        trackingNumber: "TRK123456789",
        estimatedDelivery: "2024-01-16",
      },
      {
        id: "ORD-002",
        date: "2024-01-10",
        status: "shipped",
        items: [
          { id: "3", name: "Korean BBQ Platter", price: 24.99, quantity: 1 },
          { id: "4", name: "Japchae Noodles", price: 13.99, quantity: 1 },
        ],
        total: 42.97,
        deliveryAddress: "456 Oak Ave, City, State 12345",
        trackingNumber: "TRK987654321",
        estimatedDelivery: "2024-01-12",
      },
      {
        id: "ORD-003",
        date: "2024-01-08",
        status: "preparing",
        items: [{ id: "5", name: "Bibimbap", price: 16.99, quantity: 1 }],
        total: 19.98,
        deliveryAddress: "789 Pine St, City, State 12345",
        estimatedDelivery: "2024-01-09",
      },
      {
        id: "ORD-004",
        date: "2024-01-05",
        status: "confirmed",
        items: [{ id: "6", name: "Korean Fried Chicken", price: 18.99, quantity: 1 }],
        total: 22.98,
        deliveryAddress: "321 Elm St, City, State 12345",
        estimatedDelivery: "2024-01-06",
      },
      {
        id: "ORD-005",
        date: "2024-01-03",
        status: "delivered",
        items: [{ id: "7", name: "Tteokbokki", price: 11.99, quantity: 2 }],
        total: 26.97,
        deliveryAddress: "555 Maple Dr, City, State 12345",
        trackingNumber: "TRK555666777",
        estimatedDelivery: "2024-01-04",
      },
      {
        id: "ORD-006",
        date: "2024-01-01",
        status: "delivered",
        items: [{ id: "8", name: "Korean Corn Dogs", price: 8.99, quantity: 3 }],
        total: 29.96,
        deliveryAddress: "777 Cedar Ln, City, State 12345",
        trackingNumber: "TRK888999000",
        estimatedDelivery: "2024-01-02",
      },
    ]
    setOrders(mockOrders)
  }, [])

  const getOrderCounts = () => {
    const counts = {
      confirmed: orders.filter((order) => order.status === "confirmed").length,
      preparing: orders.filter((order) => order.status === "preparing").length,
      shipped: orders.filter((order) => order.status === "shipped").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
    }
    return counts
  }

  const handleViewDetails = (order: Order) => {
    setSelectedOrderDetails(order)
  }

  const handleStatusFilter = (status: Order["status"]) => {
    setStatusFilter(status)
    setSelectedOrderId("all") // Reset order filter when filtering by status
    setCurrentPage(1) // Reset to first page
  }

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />
      case "preparing":
        return <Clock className="w-4 h-4" />
      case "shipped":
        return <Truck className="w-4 h-4" />
      case "delivered":
        return <Package className="w-4 h-4" />
      case "cancelled":
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-400/20 text-blue-300 border-blue-400/30"
      case "preparing":
        return "bg-yellow-400/20 text-yellow-300 border-yellow-400/30"
      case "shipped":
        return "bg-green-400/20 text-green-300 border-green-400/30"
      case "delivered":
        return "bg-emerald-400/20 text-emerald-300 border-emerald-400/30"
      case "cancelled":
        return "bg-red-400/20 text-red-300 border-red-400/30"
      default:
        return "bg-gray-400/20 text-gray-300 border-gray-400/30"
    }
  }

  const filteredOrders = orders
    .filter((order) => {
      const matchesOrderId = selectedOrderId === "all" || order.id === selectedOrderId
      const matchesStatus = statusFilter === "all" || order.status === statusFilter
      return matchesOrderId && matchesStatus
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)
  const startIndex = (currentPage - 1) * ordersPerPage
  const endIndex = startIndex + ordersPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedOrderId, statusFilter])

  const renderTrackingProgress = (status: Order["status"]) => {
    const steps = ["confirmed", "preparing", "shipped", "delivered"]
    const stepLabels = ["Confirmed", "Preparing", "Shipped", "Delivered"]
    const currentIndex = steps.indexOf(status)

    return (
      <div className="w-full max-w-md">
        <div className="relative flex items-center justify-between mb-2">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-yellow-600 -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-4 h-0.5 bg-green-500 -translate-y-1/2 transition-all duration-500"
            style={{
              width: currentIndex > 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : "0%",
              maxWidth: "calc(100% - 32px)",
            }}
          ></div>

          {steps.map((step, index) => (
            <div
              key={step}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index <= currentIndex
                  ? "bg-green-500 border-green-500 text-white"
                  : "bg-gray-600 border-gray-500 text-gray-400"
              }`}
            >
              {index <= currentIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 bg-current rounded-full" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          {stepLabels.map((label, index) => (
            <div key={index} className="text-xs text-gray-400 text-center w-8">
              {label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  const orderCounts = getOrderCounts()

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-yellow-900 via-orange-800 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-900 via-orange-800 to-black"></div>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-yellow-400/10 rounded-full blur-xl animate-pulse"></div>
        <div
          className="absolute top-40 right-20 w-24 h-24 bg-orange-500/20 rounded-full blur-lg animate-bounce"
          style={{ animationDuration: "3s" }}
        ></div>
        <div
          className="absolute bottom-32 left-1/4 w-40 h-40 bg-red-500/10 rounded-full blur-2xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>

        <div className="absolute top-1/4 right-10 w-16 h-16 opacity-10">
          <svg viewBox="0 0 60 60" className="w-full h-full text-yellow-400 animate-pulse">
            <circle cx="30" cy="30" r="3" fill="currentColor" />
            <circle cx="30" cy="15" r="2" fill="currentColor" opacity="0.8" />
            <circle cx="45" cy="30" r="2" fill="currentColor" opacity="0.8" />
            <circle cx="30" cy="45" r="2" fill="currentColor" opacity="0.8" />
            <circle cx="15" cy="30" r="2" fill="currentColor" opacity="0.8" />
          </svg>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-white hover:bg-white/10 hover:text-yellow-400 transition-colors bg-black/20 border border-white/20"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Homepage
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-white drop-shadow-lg">
            <span className="text-yellow-400 drop-shadow-lg">Track My</span> Orders
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 backdrop-blur-sm border-blue-400/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Confirmed or In Process</p>
                  <p className="text-2xl font-bold text-white">{orderCounts.confirmed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-blue-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilter("confirmed")}
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 p-0 h-auto mt-2 font-medium"
              >
                View
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border-yellow-400/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">Kitchen Preparation</p>
                  <p className="text-2xl font-bold text-white">{orderCounts.preparing}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilter("preparing")}
                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/20 p-0 h-auto mt-2 font-medium"
              >
                View
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border-green-400/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">Shipped or Out for Delivery</p>
                  <p className="text-2xl font-bold text-white">{orderCounts.shipped}</p>
                </div>
                <Truck className="w-8 h-8 text-green-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilter("shipped")}
                className="text-green-400 hover:text-green-300 hover:bg-green-500/20 p-0 h-auto mt-2 font-medium"
              >
                View
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 backdrop-blur-sm border-emerald-400/30 shadow-xl">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-300 text-sm font-medium">Delivered</p>
                  <p className="text-2xl font-bold text-white">{orderCounts.delivered}</p>
                </div>
                <Package className="w-8 h-8 text-emerald-400" />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleStatusFilter("delivered")}
                className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 p-0 h-auto mt-2 font-medium"
              >
                View
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-white">Filter by Order #:</label>
            <select
              value={selectedOrderId}
              onChange={(e) => {
                setSelectedOrderId(e.target.value)
                setStatusFilter("all") // Reset status filter when filtering by order
              }}
              className="p-2 rounded bg-black/40 text-white border border-yellow-400/40"
            >
              <option value="all">Show All</option>
              {orders
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((order) => (
                  <option key={order.id} value={order.id}>
                    {order.id} - {new Date(order.date).toLocaleDateString()}
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-white">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as Order["status"] | "all")
                setSelectedOrderId("all") // Reset order filter when filtering by status
              }}
              className="p-2 rounded bg-black/40 text-white border border-yellow-400/40"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {(statusFilter !== "all" || selectedOrderId !== "all") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatusFilter("all")
                setSelectedOrderId("all")
              }}
              className="border-red-400/50 text-black-300 hover:bg-red-400/20"
            >
              Clear Filters
            </Button>
          )}
        </div>

        {filteredOrders.length > 0 && (
          <div className="mb-4 flex justify-between items-center">
            <p className="text-gray-300 text-sm">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredOrders.length)} of {filteredOrders.length} orders
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-yellow-400/50 text-black-400 hover:bg-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-white text-sm px-3">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-yellow-400/50 text-black-400 hover:bg-yellow-400/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="text-center py-12">
              <div className="text-gray-300 mb-4">
                <Truck className="w-12 h-12 mx-auto mb-4 opacity-50 text-yellow-400" />
                <p className="text-lg text-white">No orders yet</p>
                <p className="text-sm">Your order history will appear here once you place your first order.</p>
              </div>
              <Link href="/menu">
                <Button className="mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl">
                  Browse Menu
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {paginatedOrders.map((order) => (
              <Card
                key={order.id}
                className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl hover:bg-white/15 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg text-yellow-400">Order #{order.id}</CardTitle>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-300">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                        {order.trackingNumber && (
                          <div className="text-sm text-gray-300">
                            <span className="text-yellow-400">Tracking:</span> {order.trackingNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge className={`flex items-center gap-1 border ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-white font-medium">Order Status</h4>
                      <span className="text-sm text-green-400">Our Truck Delivery</span>
                    </div>
                    {renderTrackingProgress(order.status)}
                    {order.estimatedDelivery && (
                      <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded">
                        <p className="text-blue-300 text-sm">
                          <strong>Message:</strong> Your order will be delivered by{" "}
                          {new Date(order.estimatedDelivery).toLocaleDateString()}.
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-white">{item.name}</div>
                          <div className="text-xs text-gray-400">
                            Qty: {item.quantity} × ₱{item.price.toFixed(2)}
                          </div>
                        </div>
                        <div className="font-medium text-yellow-400">₱{(item.price * item.quantity).toFixed(2)}</div>
                      </div>
                    ))}
                  </div>

                  <Separator className="bg-white/20" />

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="text-sm text-gray-300">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="w-4 h-4 text-yellow-400" />
                        <span className="font-medium text-white">Ship To:</span>
                      </div>
                      <p className="ml-6">{order.deliveryAddress}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Order Total</p>
                      <p className="text-xl font-semibold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        ₱{order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDetails(order)}
                      className="text-gray-300 bg-white/10 hover:bg-white/10 hover:text-white"
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <OrderDetailsModal order={selectedOrderDetails} onClose={() => setSelectedOrderDetails(null)} />
      </div>
    </div>
  )
}

export default OrderHistory
