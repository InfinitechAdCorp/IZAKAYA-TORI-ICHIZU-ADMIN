"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MoreHorizontal,
  Eye,
  Search,
  Loader2,
  ArrowUpDown,
  Edit,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  User,
  Phone,
  MapPin,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
} from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

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
  order_status: "pending" | "confirmed" | "preparing" | "ready" | "delivered" | "cancelled"
  subtotal: number
  delivery_fee: number
  total_amount: number
  notes?: string
  receipt_file?: string
  order_items: OrderItem[]
  created_at: string
  updated_at: string
}

const orderStatuses = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  { value: "preparing", label: "Preparing", color: "bg-orange-100 text-orange-800", icon: Package },
  { value: "ready", label: "Ready", color: "bg-green-100 text-green-800", icon: CheckCircle },
  { value: "delivered", label: "Delivered", color: "bg-green-100 text-green-800", icon: Truck },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
]

const paymentMethods = [
  { value: "cash", label: "Cash on Delivery" },
  { value: "gcash", label: "GCash" },
  { value: "paypal", label: "PayPal" },
  { value: "bpi", label: "BPI Online" },
  { value: "maya", label: "Maya" },
]

export default function OrdersAdminPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // DataTable states
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>("all")

  // State for mobile detection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null)

  // Helper function to safely calculate total revenue
  const calculateTotalRevenue = (orders: Order[]): string => {
    if (!Array.isArray(orders) || orders.length === 0) {
      return "0.00"
    }

    try {
      const total = orders.reduce((sum, order) => {
        const orderTotal = typeof order.total_amount === "number" ? order.total_amount : 0
        return sum + orderTotal
      }, 0)

      return total.toFixed(2)
    } catch (error) {
      console.error("Error calculating total revenue:", error)
      return "0.00"
    }
  }

  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    const statusInfo = orderStatuses.find((s) => s.value === status)
    if (!statusInfo) return null

    const Icon = statusInfo.icon
    return (
      <Badge className={`text-xs px-2 py-1 ${statusInfo.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  // Helper function to get payment method badge
  const getPaymentMethodBadge = (method: string) => {
    const methodInfo = paymentMethods.find((m) => m.value === method)
    return (
      <Badge variant="outline" className="text-xs">
        {methodInfo?.label || method}
      </Badge>
    )
  }

  // Fetch single order with full details including items
  const fetchOrderDetails = async (orderId: number) => {
    setLoadingOrderDetails(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Admin-Request": "true",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch order details: ${response.status}`)
      }

      const result = await response.json()
      console.log("Order details response:", result)

      if (result.success && result.data) {
        setSelectedOrder(result.data)
      } else {
        throw new Error(result.message || "Failed to fetch order details")
      }
    } catch (error) {
      console.error("Error fetching order details:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load order details",
      })
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  // Update order status
  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingStatus(orderId)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
          "X-Admin-Request": "true",
        },
        body: JSON.stringify({ order_status: newStatus }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to update order status.")
      }

      toast({
        title: "Success",
        description: "Order status updated successfully!",
      })

      fetchOrders()
    } catch (error: any) {
      console.error("Error updating order status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error updating the order status.",
      })
    } finally {
      setUpdatingStatus(null)
    }
  }

  // Delete order
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return

    setDeleting(true)
    try {
      const token = localStorage.getItem("auth_token")
      if (!token) {
        throw new Error("Authentication token not found")
      }

      const response = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Admin-Request": "true",
          "Content-Type": "application/json",
        },
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || "Failed to delete order.")
      }

      toast({
        title: "Success",
        description: "Order deleted successfully!",
      })

      setDeleteDialogOpen(false)
      setOrderToDelete(null)
      fetchOrders()
    } catch (error: any) {
      console.error("Error deleting order:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error deleting the order.",
      })
    } finally {
      setDeleting(false)
    }
  }

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access orders.",
        })
        router.push("/login")
        return
      }

      let url = "/api/orders?per_page=100"

      // Add filters to URL
      const params = new URLSearchParams()
      if (statusFilter !== "all") params.append("order_status", statusFilter)
      if (paymentMethodFilter !== "all") params.append("payment_method", paymentMethodFilter)
      if (globalFilter) params.append("search", globalFilter)

      if (params.toString()) {
        url += `&${params.toString()}`
      }

      console.log("Fetching orders from:", url)

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Admin-Request": "true",
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Orders API error response:", errorText)

        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          router.push("/login")
          return
        }

        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const result = await response.json()
      console.log("Orders API response:", result)

      if (result.success) {
        const ordersData = result.data || []
        console.log("Setting orders:", ordersData)

        if (Array.isArray(ordersData)) {
          const validatedOrders = ordersData.map((order) => ({
            ...order,
            total: typeof order.total === "number" ? order.total : 0,
            subtotal: typeof order.subtotal === "number" ? order.subtotal : 0,
            delivery_fee: typeof order.delivery_fee === "number" ? order.delivery_fee : 0,
            order_items: Array.isArray(order.order_items) ? order.order_items : [],
          }))

          setOrders(validatedOrders)
        } else {
          console.error("Orders data is not an array:", ordersData)
          setOrders([])
        }
      } else {
        throw new Error(result.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to load orders. Please check your authentication.",
      })

      setOrders([])

      if (error instanceof Error && error.message.includes("401")) {
        localStorage.removeItem("auth_token")
        router.push("/login")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [statusFilter, paymentMethodFilter])

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (globalFilter !== undefined) {
        fetchOrders()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [globalFilter])

  // Define columns for DataTable
  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "order_number",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal"
        >
          Order #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">#{row.original.order_number}</div>
          <div className="text-xs text-gray-500 sm:hidden truncate">{row.original.customer_name}</div>
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal hidden sm:flex"
        >
          Customer
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0 hidden sm:block">
          <div className="font-medium text-gray-900 truncate">{row.original.customer_name}</div>
          <div className="text-xs text-gray-500 truncate">{row.original.customer_email}</div>
        </div>
      ),
    },
    {
      accessorKey: "order_status",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal"
        >
          Status
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => getStatusBadge(row.original.order_status),
    },
    {
      accessorKey: "payment_method",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal hidden lg:flex"
        >
          Payment
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="hidden lg:block">{getPaymentMethodBadge(row.original.payment_method)}</div>,
    },
    {
      accessorKey: "total",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal"
        >
          Total
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="font-semibold text-middle">₱{(row.original.total_amount || 0).toFixed(2)}</div>
      ),
    },
    {
      accessorKey: "created_at",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal hidden lg:flex"
        >
          Created
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm hidden lg:block">
          {new Date(row.original.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "2-digit",
            year: "numeric",
          })}
        </div>
      ),
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const order = row.original
        return (
          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchOrderDetails(order.id)}
                  className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline">View</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-3xl overflow-y-auto">
                {loadingOrderDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                  </div>
                ) : selectedOrder ? (
                  <>
                    <SheetHeader>
                      <SheetTitle>Order Details - #{selectedOrder.order_number}</SheetTitle>
                      <SheetDescription>Complete information for this order</SheetDescription>
                    </SheetHeader>
                    <div className="mt-6 space-y-6">
                      {/* Order Status and Quick Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            {getStatusBadge(selectedOrder.order_status)}
                            {getPaymentMethodBadge(selectedOrder.payment_method)}
                          </div>
                          <p className="text-sm text-gray-600">
                            Order placed on{" "}
                            {new Date(selectedOrder.created_at).toLocaleDateString("en-US", {
                              month: "long",
                              day: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            ₱
                            {(typeof selectedOrder.total_amount === "number" ? selectedOrder.total_amount : 0).toFixed(
                              2,
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Subtotal: ₱
                            {(typeof selectedOrder.subtotal === "number" ? selectedOrder.subtotal : 0).toFixed(2)} +
                            Delivery: ₱
                            {(typeof selectedOrder.delivery_fee === "number" ? selectedOrder.delivery_fee : 0).toFixed(
                              2,
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Information */}
                        <Card>
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <User className="w-5 h-5" />
                              Customer Information
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Name</Label>
                              <p className="font-medium">{selectedOrder.customer_name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Email</Label>
                              <p className="text-sm">{selectedOrder.customer_email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <p className="text-sm">{selectedOrder.customer_phone}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Delivery Information */}
                        <Card>
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <MapPin className="w-5 h-5" />
                              Delivery Address
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <p className="text-sm">{selectedOrder.delivery_address}</p>
                            <p className="text-sm">
                              {selectedOrder.delivery_city}, {selectedOrder.delivery_zip_code}
                            </p>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Order Items */}
                      <Card>
                        <CardHeader className="pb-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Package className="w-5 h-5" />
                            Order Items ({selectedOrder.order_items?.length || 0})
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {(selectedOrder.order_items || []).map((item, index) => (
                              <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-base truncate">{item.name}</h4>
                                  <p className="text-xs text-gray-500 truncate mb-2">{item.description}</p>
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs">
                                      {item.category}
                                    </Badge>
                                    {item.is_spicy && (
                                      <Badge variant="destructive" className="text-xs">
                                        🌶️ Spicy
                                      </Badge>
                                    )}
                                    {item.is_vegetarian && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        🌱 Veg
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right flex flex-col gap-1">
                                  <div className="text-sm text-gray-600">
                                    ₱{(typeof item.price === "number" ? item.price : 0).toFixed(2)} ×{" "}
                                    {item.quantity || 0}
                                  </div>
                                  <div className="font-bold text-lg text-gray-900">
                                    ₱
                                    {((typeof item.price === "number" ? item.price : 0) * (item.quantity || 0)).toFixed(
                                      2,
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Additional Notes */}
                      {selectedOrder.notes && (
                        <Card>
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-lg">Special Notes</h3>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm p-3 bg-gray-50 rounded-md whitespace-pre-wrap">
                              {selectedOrder.notes}
                            </p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </>
                ) : null}
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Order Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {orderStatuses.map((status) => (
                  <DropdownMenuItem
                    key={status.value}
                    onClick={() => handleStatusUpdate(order.id, status.value)}
                    disabled={updatingStatus === order.id || order.order_status === status.value}
                  >
                    <status.icon className="mr-2 h-4 w-4" />
                    Mark as {status.label}
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />
                {/* <DropdownMenuItem onClick={() => router.push(`/admin/order/${order.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Order
                </DropdownMenuItem> */}
               <DropdownMenuItem
                  onClick={() => {
                    setOrderToDelete(order)
                    setDeleteDialogOpen(true)
                  }}
                  className="text-red-600 focus:text-white focus:bg-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Order
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  // Initialize table instance
  const table = useReactTable({
    data: orders,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      rowSelection,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
  })

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-gray-700 font-medium">Loading orders...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Orders
              </span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Orders
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">
                    Manage customer orders and track delivery status
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Showing all orders from all customers (Admin View)</p>
                </div>
                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600 font-medium">Total Revenue:</span>
                    <span className="font-bold text-green-600 text-lg">₱{calculateTotalRevenue(orders)}</span>
                  </div>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {orderStatuses.slice(0, 4).map((status) => {
                  const count = orders.filter((order) => order.order_status === status.value).length
                  const Icon = status.icon
                  return (
                    <Card
                      key={status.value}
                      className="p-4 bg-white/70 backdrop-blur-sm shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{status.label}</p>
                          <p className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                            {count}
                          </p>
                        </div>
                        <div className="bg-gradient-to-r from-orange-100 to-red-100 p-2 rounded-lg">
                          <Icon className="w-6 h-6 text-orange-600" />
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>

              {/* Filters and Search */}
              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100 overflow-hidden p-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                        <Input
                          placeholder="Search orders..."
                          value={globalFilter || ""}
                          onChange={(event) => setGlobalFilter(event.target.value)}
                          className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50"
                        />
                      </div>

                      <div className="flex gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                          <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-white/50">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            {orderStatuses.map((status) => (
                              <SelectItem key={status.value} value={status.value}>
                                {status.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                          <SelectTrigger className="w-32 bg-white/20 border-white/30 text-white focus:bg-white/30 focus:border-white/50">
                            <SelectValue placeholder="Payment" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Payments</SelectItem>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-0 bg-white">
                  <div className="p-6 pt-4">
                    <div className="text-sm text-gray-600 mb-4 font-medium">
                      Showing {table.getFilteredRowModel().rows.length} of {orders.length} orders
                    </div>
                    <div className="w-full">
                      <div className="rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[800px]">
                            <thead className="bg-gradient-to-r from-orange-100 to-red-100">
                              <tr className="border-b border-orange-200">
                                {table.getHeaderGroups().map((headerGroup) =>
                                  headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className="text-left p-2 sm:p-3 text-xs sm:text-sm font-semibold text-gray-700"
                                    >
                                      {header.isPlaceholder ? null : (
                                        <div>
                                          {typeof header.column.columnDef.header === "function"
                                            ? header.column.columnDef.header(header.getContext())
                                            : header.column.columnDef.header}
                                        </div>
                                      )}
                                    </th>
                                  )),
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {table.getRowModel().rows.map((row, index) => (
                                <tr
                                  key={row.id}
                                  className={`border-b border-orange-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 ${index % 2 === 0 ? "bg-white" : "bg-orange-25"}`}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-2 sm:p-3 text-xs sm:text-sm">
                                      {typeof cell.column.columnDef.cell === "function"
                                        ? cell.column.columnDef.cell(cell.getContext())
                                        : (cell.getValue() as React.ReactNode)}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                      {table.getRowModel().rows.length === 0 && (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-orange-200 mt-4">
                          <div className="bg-gradient-to-r from-orange-100 to-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package className="w-8 h-8 text-orange-500" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">No orders found</p>
                          {globalFilter && (
                            <p className="text-sm mt-1 text-gray-500">Try adjusting your search terms or filters</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this order?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete order{" "}
              <span className="font-semibold">#{orderToDelete?.order_number}</span> from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Order
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
