"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  LogIn,
  Calendar,
  Users,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ChefHat,
  MessageSquare,
  Eye,
  Filter,
  Utensils,
} from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api"
import type { Order } from "@/types"
import { toast } from "@/hooks/use-toast"

// Event type
interface Event {
  id: number
  name: string
  email: string
  userId?: number
  eventType: string
  guests: number
  preferredDate: string
  preferredTime: string
  venueArea: string
  status?: string
  created_at: string
  updated_at?: string
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [reservations, setReservations] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [filteredReservations, setFilteredReservations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<"orders" | "events" | "reservations">("orders")
  const [activeFilter, setActiveFilter] = useState<string>("all")
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)

  useEffect(() => {
    const checkAuthAndFetchData = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user_data")

      if (!token) {
        setLoading(false)
        return
      }

      if (userData) {
        try {
          setUser(JSON.parse(userData))
        } catch (error) {
          console.error("Error parsing user data:", error)
        }
      }

      try {
        // Fetch orders
        const ordersResponse = await apiClient.getOrders()
        if (ordersResponse.success && ordersResponse.data) {
          const ordersData = Array.isArray(ordersResponse.data)
            ? ordersResponse.data
            : ordersResponse.data.data || ordersResponse.data.orders || []
          setOrders(ordersData)
          setFilteredOrders(ordersData)
        }

        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL
          const userData = JSON.parse(localStorage.getItem("user_data") || "{}")
          const userId = userData?.id

          const eventsUrl = userId ? `${apiUrl}/api/events?user_id=${userId}` : `${apiUrl}/api/events`

          const eventsResponse = await fetch(eventsUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (eventsResponse.ok) {
            const eventsData = await eventsResponse.json()
            const eventsList = Array.isArray(eventsData) ? eventsData : eventsData.data || []
            setEvents(eventsList)
            setFilteredEvents(eventsList)
          }
        } catch (error) {
          console.error("Error fetching events:", error)
        }

        // Fetch reservations
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL
          const reservationsResponse = await fetch(`${apiUrl}/api/reservations`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          if (reservationsResponse.ok) {
            const reservationsData = await reservationsResponse.json()
            const resData = Array.isArray(reservationsData) ? reservationsData : reservationsData.data || []
            setReservations(resData)
            setFilteredReservations(resData)
          }
        } catch (error) {
          console.error("Error fetching reservations:", error)
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    checkAuthAndFetchData()
  }, [])

  useEffect(() => {
    if (activeTab === "orders") {
      if (activeFilter === "all") {
        setFilteredOrders(orders)
      } else {
        setFilteredOrders(orders.filter((order) => order.order_status === activeFilter))
      }
    } else if (activeTab === "events") {
      if (activeFilter === "all") {
        setFilteredEvents(events)
      } else {
        setFilteredEvents(events.filter((event) => event.status === activeFilter))
      }
    } else {
      if (activeFilter === "all") {
        setFilteredReservations(reservations)
      } else {
        setFilteredReservations(reservations.filter((res) => res.status === activeFilter))
      }
    }
  }, [activeFilter, orders, events, reservations, activeTab])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />
      case "confirmed":
      case "preparing":
        return <ChefHat className="w-4 h-4" />
      case "ready":
      case "out_for_delivery":
        return <Truck className="w-4 h-4" />
      case "delivered":
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "cancelled":
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      case "confirmed":
      case "preparing":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "ready":
      case "out_for_delivery":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30"
      case "delivered":
      case "completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "cancelled":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-500/30"
    }
  }

  const getStatusCount = (status: string) => {
    if (activeTab === "orders") {
      if (status === "all") return orders.length
      return orders.filter((order) => order.order_status === status).length
    } else if (activeTab === "events") {
      if (status === "all") return events.length
      return events.filter((event) => event.status === status).length
    } else {
      if (status === "all") return reservations.length
      return reservations.filter((res) => res.status === status).length
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700 font-semibold text-lg">Loading your history...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-white shadow-2xl border-0">
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-black text-gray-900 mb-3">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Please log in to view your order history, events, and reservations.</p>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="w-full">
                <Button className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-6 text-lg shadow-lg">
                  <LogIn className="w-5 h-5 mr-2" />
                  Login to Continue
                </Button>
              </Link>
              <Link href="/register" className="w-full">
                <Button
                  variant="outline"
                  className="w-full border-2 border-orange-300 text-orange-600 hover:bg-orange-50 font-semibold py-6 text-lg bg-transparent"
                >
                  Create Account
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentData =
    activeTab === "orders" ? filteredOrders : activeTab === "events" ? filteredEvents : filteredReservations

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-2">
                Your{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                  History
                </span>
              </h1>
              <p className="text-gray-600 text-lg">Track your orders, events, and reservations</p>
            </div>
            <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-2xl shadow-lg border border-orange-100">
              <User className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs text-gray-500">Welcome back,</p>
                <p className="font-bold text-gray-900">{user.name}</p>
              </div>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex gap-3 mb-6 flex-wrap">
            <button
              onClick={() => {
                setActiveTab("orders")
                setActiveFilter("all")
              }}
              className={`flex-1 min-w-fit py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "orders"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-md"
              }`}
            >
              <Package className="w-5 h-5 inline-block mr-2 mb-1" />
              Orders ({orders.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("events")
                setActiveFilter("all")
              }}
              className={`flex-1 min-w-fit py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "events"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-md"
              }`}
            >
              <Utensils className="w-5 h-5 inline-block mr-2 mb-1" />
              Events ({events.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("reservations")
                setActiveFilter("all")
              }}
              className={`flex-1 min-w-fit py-4 px-6 rounded-2xl font-bold text-lg transition-all ${
                activeTab === "reservations"
                  ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50 shadow-md"
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2 mb-1" />
              Reservations ({reservations.length})
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl shadow-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-gray-700">Filter by Status</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                  activeFilter === "all"
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                All ({getStatusCount("all")})
              </button>
              {activeTab === "orders" ? (
                <>
                  <button
                    onClick={() => setActiveFilter("pending")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "pending"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Pending ({getStatusCount("pending")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("confirmed")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "confirmed"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Confirmed ({getStatusCount("confirmed")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("preparing")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "preparing"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Preparing ({getStatusCount("preparing")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("out_for_delivery")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "out_for_delivery"
                        ? "bg-purple-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Delivery ({getStatusCount("out_for_delivery")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("delivered")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "delivered"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Delivered ({getStatusCount("delivered")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("cancelled")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "cancelled"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Cancelled ({getStatusCount("cancelled")})
                  </button>
                </>
              ) : activeTab === "events" ? (
                <>
                  <button
                    onClick={() => setActiveFilter("pending")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "pending"
                        ? "bg-amber-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Pending ({getStatusCount("pending")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("confirmed")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "confirmed"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Confirmed ({getStatusCount("confirmed")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("completed")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "completed"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Completed ({getStatusCount("completed")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("cancelled")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "cancelled"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Cancelled ({getStatusCount("cancelled")})
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveFilter("confirmed")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "confirmed"
                        ? "bg-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Confirmed ({getStatusCount("confirmed")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("completed")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "completed"
                        ? "bg-emerald-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Completed ({getStatusCount("completed")})
                  </button>
                  <button
                    onClick={() => setActiveFilter("cancelled")}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all ${
                      activeFilter === "cancelled"
                        ? "bg-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    Cancelled ({getStatusCount("cancelled")})
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        {currentData.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <Card className="max-w-lg w-full bg-white shadow-2xl border-0">
              <CardContent className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  {activeTab === "orders" ? (
                    <Package className="w-12 h-12 text-orange-600" />
                  ) : activeTab === "events" ? (
                    <Utensils className="w-12 h-12 text-orange-600" />
                  ) : (
                    <Calendar className="w-12 h-12 text-orange-600" />
                  )}
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-3">
                  {activeTab === "orders"
                    ? "No Orders Yet"
                    : activeTab === "events"
                      ? "No Events Yet"
                      : "No Reservations Yet"}
                </h2>
                <p className="text-gray-600 mb-8 text-lg">
                  {activeTab === "orders"
                    ? "Start exploring our delicious menu and place your first order!"
                    : activeTab === "events"
                      ? "Book your first event and celebrate with us!"
                      : "Make your first reservation and enjoy our authentic Japanese cuisine!"}
                </p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-6 px-8 text-lg shadow-lg"
                >
                  <Link href={activeTab === "orders" ? "/menu" : activeTab === "events" ? "/events" : "/reservations"}>
                    {activeTab === "orders"
                      ? "Browse Menu"
                      : activeTab === "events"
                        ? "Book Event"
                        : "Make Reservation"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTab === "orders"
              ? filteredOrders.map((order) => {
                  const orderStatus = order.order_status || "pending"
                  const orderItems = order.order_items || []
                  const isExpanded = expandedOrder === order.order_number

                  return (
                    <Card
                      key={order.id}
                      className="bg-white shadow-xl py-0 hover:shadow-2xl transition-all border-0 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-black text-lg">{order.order_number}</h3>
                            <p className="text-orange-100 text-sm">
                              {new Date(order.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <Badge className={`${getStatusColor(orderStatus)} flex items-center gap-2 px-3 py-1 border`}>
                            {getStatusIcon(orderStatus)}
                            <span className="capitalize font-semibold">{orderStatus.replace("_", " ")}</span>
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Order Items */}
                        <div className="mb-4">
                          <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-orange-600" />
                            Items ({orderItems.length})
                          </h4>
                          <div className="space-y-2">
                            {(isExpanded ? orderItems : orderItems.slice(0, 2)).map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between items-center p-3 bg-orange-50 rounded-xl border border-orange-100"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{item.name}</p>
                                  <p className="text-sm text-gray-600">
                                    {item.quantity} × ₱{item.price}
                                  </p>
                                </div>
                                <p className="font-black text-orange-600 text-lg">
                                  ₱{item.subtotal || item.price * item.quantity}
                                </p>
                              </div>
                            ))}
                            {!isExpanded && orderItems.length > 2 && (
                              <button
                                onClick={() => setExpandedOrder(order.order_number)}
                                className="text-orange-600 font-semibold text-sm hover:text-orange-700 flex items-center gap-1"
                              >
                                <Eye className="w-4 h-4" />
                                View {orderItems.length - 2} more items
                              </button>
                            )}
                            {isExpanded && orderItems.length > 2 && (
                              <button
                                onClick={() => setExpandedOrder(null)}
                                className="text-orange-600 font-semibold text-sm hover:text-orange-700"
                              >
                                Show less
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Details */}
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Payment:</span>
                            <span className="font-semibold text-gray-900 capitalize">{order.payment_method}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600">Delivery:</span>
                            <span className="font-semibold text-gray-900">{order.delivery_city}</span>
                          </div>
                        </div>

                        <Separator className="my-4" />

                        {/* Total */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold">₱{order.subtotal}</span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee:</span>
                            <span className="font-semibold">₱{order.delivery_fee}</span>
                          </div>
                          <div className="flex justify-between text-xl font-black pt-2 border-t-2 border-orange-100">
                            <span className="text-gray-900">Total:</span>
                            <span className="text-orange-600">₱{order.total_amount}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              : activeTab === "events"
                ? filteredEvents.map((event) => (
                    <Card
                      key={event.id}
                      className="bg-white shadow-xl hover:shadow-2xl py-0 transition-all border-0 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-black text-lg">Event #{event.id}</h3>
                            <p className="text-orange-100 text-sm">
                              {new Date(event.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge
                            className={`${getStatusColor(event.status || "pending")} flex items-center gap-2 px-3 py-1 border`}
                          >
                            {getStatusIcon(event.status || "pending")}
                            <span className="capitalize font-semibold">
                              {(event.status || "pending").replace("_", " ")}
                            </span>
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Event Details */}
                        <div className="space-y-4">
                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-orange-600" />
                                  <span className="text-xs text-gray-600 font-semibold">Date</span>
                                </div>
                                <p className="font-bold text-gray-900">
                                  {new Date(event.preferredDate).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-orange-600" />
                                  <span className="text-xs text-gray-600 font-semibold">Time</span>
                                </div>
                                <p className="font-bold text-gray-900">{event.preferredTime}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Guests:</span>
                              <span className="font-bold text-gray-900">{event.guests} people</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Utensils className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Event Type:</span>
                              <span className="font-bold text-gray-900 capitalize">{event.eventType}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Venue:</span>
                              <span className="font-bold text-gray-900 capitalize">
                                {event.venueArea ? event.venueArea.replace("_", " ") : "Not specified"}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Name:</span>
                              <span className="font-bold text-gray-900">{event.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Email:</span>
                              <span className="font-semibold text-gray-900">{event.email}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                : filteredReservations.map((reservation) => (
                    <Card
                      key={reservation.id}
                      className="bg-white shadow-xl hover:shadow-2xl py-0 transition-all border-0 overflow-hidden"
                    >
                      <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-white font-black text-lg">Reservation #{reservation.id}</h3>
                            <p className="text-orange-100 text-sm">
                              {new Date(reservation.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <Badge
                            className={`${getStatusColor(reservation.status)} flex items-center gap-2 px-3 py-1 border`}
                          >
                            {getStatusIcon(reservation.status)}
                            <span className="capitalize font-semibold">{reservation.status}</span>
                          </Badge>
                        </div>
                      </div>

                      <CardContent className="p-6">
                        {/* Reservation Details */}
                        <div className="space-y-4">
                          <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-orange-600" />
                                  <span className="text-xs text-gray-600 font-semibold">Date</span>
                                </div>
                                <p className="font-bold text-gray-900">
                                  {new Date(reservation.date).toLocaleDateString("en-US", {
                                    month: "long",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </p>
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Clock className="w-4 h-4 text-orange-600" />
                                  <span className="text-xs text-gray-600 font-semibold">Time</span>
                                </div>
                                <p className="font-bold text-gray-900">{reservation.time}</p>
                              </div>
                            </div>
                          </div>

                          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                            <div className="flex items-center gap-2">
                              <Users className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Guests:</span>
                              <span className="font-bold text-gray-900">{reservation.guests} people</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <User className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Name:</span>
                              <span className="font-bold text-gray-900">{reservation.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Email:</span>
                              <span className="font-semibold text-gray-900">{reservation.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-5 h-5 text-gray-500" />
                              <span className="text-gray-600">Phone:</span>
                              <span className="font-semibold text-gray-900">{reservation.phone}</span>
                            </div>
                          </div>

                          {reservation.special_requests && (
                            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                              <div className="flex items-start gap-2">
                                <MessageSquare className="w-5 h-5 text-amber-600 mt-1 flex-shrink-0" />
                                <div>
                                  <p className="text-xs text-gray-600 font-semibold mb-1">Special Requests</p>
                                  <p className="text-gray-900">{reservation.special_requests}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <Button
            asChild
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold py-6 px-10 text-lg shadow-lg rounded-2xl"
          >
            <Link href={activeTab === "orders" ? "/menu" : activeTab === "events" ? "/events" : "/reservations"}>
              {activeTab === "orders"
                ? "Order More Food"
                : activeTab === "events"
                  ? "Book New Event"
                  : "Make New Reservation"}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Orders
