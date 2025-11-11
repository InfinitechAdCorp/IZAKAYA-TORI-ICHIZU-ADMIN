"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontal,
  Eye,
  Search,
  Loader2,
  ArrowUpDown,
  Mail,
  Phone,
  MapPin,
  Calendar,
  UserCheck,
  UsersIcon,
  ShoppingBag,
  UserX,
  Send,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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

// User data types
interface User {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  city?: string
  zip_code?: string
  role: string
  created_at: string
  updated_at: string
}

interface Order {
  id: number
  order_number: string
  user_id: number
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

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const [userOrders, setUserOrders] = useState<Order[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showOrdersDialog, setShowOrdersDialog] = useState(false)
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailSubject, setEmailSubject] = useState("")
  const [emailMessage, setEmailMessage] = useState("")
  const [sendingEmail, setSendingEmail] = useState(false)
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null)
  const [deactivatingUser, setDeactivatingUser] = useState(false)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to access users.",
        })
        router.push("/login")
        return
      }

      let url = "/api/users?per_page=100&role=customer"

      if (globalFilter) {
        url += `&search=${encodeURIComponent(globalFilter)}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("auth_token")
          router.push("/login")
          return
        }
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const usersData = result.data || []
        setUsers(Array.isArray(usersData) ? usersData : [])
      } else {
        throw new Error(result.message || "Failed to fetch users")
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load users.",
      })
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (globalFilter !== undefined) {
        fetchUsers()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [globalFilter])

  const fetchUserOrders = async (userId: number) => {
    try {
      setLoadingOrders(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to view orders.",
        })
        return
      }

      const response = await fetch(`/api/orders?user_id=${userId}&per_page=100`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        const ordersData = Array.isArray(result.data) ? result.data : result.data?.data || []
        setUserOrders(ordersData)
      } else {
        throw new Error(result.message || "Failed to fetch orders")
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to load user orders.",
      })
      setUserOrders([])
    } finally {
      setLoadingOrders(false)
    }
  }

  const handleViewOrders = (user: User) => {
    setSelectedUser(user)
    setShowOrdersDialog(true)
    fetchUserOrders(user.id)
  }

  const handleSendEmail = (user: User) => {
    setSelectedUser(user)
    setEmailSubject("")
    setEmailMessage("")
    setShowEmailDialog(true)
  }

  const sendEmail = async () => {
    if (!selectedUser || !emailSubject || !emailMessage) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in both subject and message.",
      })
      return
    }

    try {
      setSendingEmail(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to send emails.",
        })
        return
      }

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedUser.email,
          subject: emailSubject,
          message: emailMessage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      toast({
        title: "Email Sent",
        description: `Email successfully sent to ${selectedUser.name}`,
      })

      setShowEmailDialog(false)
      setEmailSubject("")
      setEmailMessage("")
    } catch (error) {
      console.error("Failed to send email:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send email.",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleDeactivateUser = (user: User) => {
    setUserToDeactivate(user)
    setShowDeactivateDialog(true)
  }

  const deactivateUser = async () => {
    if (!userToDeactivate) return

    try {
      setDeactivatingUser(true)
      const token = localStorage.getItem("auth_token")

      if (!token) {
        toast({
          variant: "destructive",
          title: "Authentication Required",
          description: "Please log in to deactivate users.",
        })
        return
      }

      const response = await fetch(`/api/users/${userToDeactivate.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "deactivated",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Unknown error" }))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      toast({
        title: "User Deactivated",
        description: `${userToDeactivate.name} has been deactivated successfully.`,
      })

      setShowDeactivateDialog(false)
      setUserToDeactivate(null)
      fetchUsers()
    } catch (error) {
      console.error("Failed to deactivate user:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deactivate user.",
      })
    } finally {
      setDeactivatingUser(false)
    }
  }

  const columns: ColumnDef<User>[] = [
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
      accessorKey: "id",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal"
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-semibold text-gray-900">#{row.original.id}</div>,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal"
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium text-gray-900 truncate">{row.original.name}</div>
          <div className="text-xs text-gray-500 truncate">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }) => <div className="text-sm hidden lg:block">{row.original.phone || "N/A"}</div>,
    },
    {
      accessorKey: "city",
      header: "City",
      cell: ({ row }) => <div className="text-sm hidden lg:block">{row.original.city || "N/A"}</div>,
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs">
          {row.original.role}
        </Badge>
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
          Joined
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
        const user = row.original
        return (
          <div className="flex items-center gap-1">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedUser(user)}
                  className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline">View</span>
                </Button>
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
                {selectedUser && (
                  <>
                    <SheetHeader>
                      <SheetTitle className="md:text-xl">User Details - {selectedUser.name}</SheetTitle>
                      <SheetDescription className="text-md">Complete information for this user</SheetDescription>
                    </SheetHeader>
                    <div className="space-y-6">
                      <Card className="mx-5">
                        <CardHeader className="pb-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <UserCheck className="w-5 h-5" />
                            Personal Information
                          </h3>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Full Name</p>
                              <p className="font-medium">{selectedUser.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Role</p>
                              <Badge variant="outline">{selectedUser.role}</Badge>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <p>{selectedUser.email}</p>
                          </div>
                          {selectedUser.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <p>{selectedUser.phone}</p>
                            </div>
                          )}
                          {selectedUser.address && (
                            <div className="flex items-start gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div>
                                <p>{selectedUser.address}</p>
                                {selectedUser.city && selectedUser.zip_code && (
                                  <p className="text-gray-500">
                                    {selectedUser.city}, {selectedUser.zip_code}
                                  </p>
                                )}
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm pt-2 border-t">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <p className="text-gray-600">
                              Joined on{" "}
                              {new Date(selectedUser.created_at).toLocaleDateString("en-US", {
                                month: "long",
                                day: "2-digit",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}
              </SheetContent>
            </Sheet>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleViewOrders(user)}>
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  View Orders
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSendEmail(user)}>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={() => handleDeactivateUser(user)}>
                  <UserX className="mr-2 h-4 w-4" />
                  Deactivate User
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: users,
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
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-60"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-gray-700 font-medium">Loading users...</span>
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
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-60"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Users
              </span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Users
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer accounts and information</p>
                </div>
                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
                  <div className="flex items-center gap-2 text-sm">
                    <UsersIcon className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-600 font-medium">Total Customers:</span>
                    <span className="font-bold text-orange-600 text-lg">{users.length}</span>
                  </div>
                </div>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100 overflow-hidden p-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                        <Input
                          placeholder="Search users..."
                          value={globalFilter || ""}
                          onChange={(event) => setGlobalFilter(event.target.value)}
                          className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <CardContent className="p-0 bg-white">
                  <div className="px-6 pb-6">
                    <div className="text-sm text-gray-600 mb-4 font-medium">
                      Showing {table.getFilteredRowModel().rows.length} of {users.length} users
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
                            <UsersIcon className="w-8 h-8 text-orange-500" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">No users found</p>
                          {globalFilter && <p className="text-sm mt-1 text-gray-500">Try adjusting your search terms</p>}
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

      <Dialog open={showOrdersDialog} onOpenChange={setShowOrdersDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Orders for {selectedUser?.name}</DialogTitle>
            <DialogDescription>View all orders placed by this customer</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {loadingOrders ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="ml-2 text-gray-600">Loading orders...</span>
              </div>
            ) : userOrders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ShoppingBag className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p>No orders found for this user</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userOrders.map((order) => (
                  <Card key={order.id} className="border-orange-200">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-semibold text-lg">Order #{order.order_number}</p>
                            <Badge
                              variant={
                                order.status === "delivered"
                                  ? "default"
                                  : order.status === "cancelled"
                                    ? "destructive"
                                    : "outline"
                              }
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <p>{order.delivery_address}</p>
                            </div>
                            {order.delivery_city && (
                              <p className="ml-6 text-xs">
                                {order.delivery_city}, {order.delivery_zip_code}
                              </p>
                            )}
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <p>{order.customer_phone}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <p className="text-xs">
                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-xl text-orange-600">₱{order.total_amount.toFixed(2)}</p>
                          <p className="text-xs text-gray-500 mt-1">Subtotal: ₱{order.subtotal.toFixed(2)}</p>
                          <p className="text-xs text-gray-500">Delivery: ₱{order.delivery_fee.toFixed(2)}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {order.payment_method}
                          </Badge>
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-orange-100">
                          <p className="text-sm font-semibold mb-2 text-gray-700">Order Items ({order.items.length})</p>
                          <div className="space-y-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center gap-3 text-sm bg-orange-50 p-2 rounded">
                                <div className="flex-1">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-xs text-gray-600">{item.description}</p>
                                  <div className="flex gap-1 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {item.category}
                                    </Badge>
                                    {item.is_spicy && (
                                      <Badge variant="destructive" className="text-xs">
                                        Spicy
                                      </Badge>
                                    )}
                                    {item.is_vegetarian && (
                                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                        Veg
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-medium">₱{item.price.toFixed(2)}</p>
                                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                  <p className="font-semibold text-orange-600">
                                    ₱{(item.price * item.quantity).toFixed(2)}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {order.notes && (
                        <div className="mt-4 pt-4 border-t border-orange-100">
                          <p className="text-sm font-semibold mb-1 text-gray-700">Special Notes:</p>
                          <p className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">{order.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {selectedUser?.name}</DialogTitle>
            <DialogDescription>Compose and send an email to this customer</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="email-to">To</Label>
              <Input id="email-to" value={selectedUser?.email || ""} disabled className="mt-1" />
            </div>
            <div>
              <Label htmlFor="email-subject">Subject</Label>
              <Input
                id="email-subject"
                placeholder="Enter email subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email-message">Message</Label>
              <Textarea
                id="email-message"
                placeholder="Enter your message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                className="mt-1 min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setShowEmailDialog(false)} disabled={sendingEmail}>
              Cancel
            </Button>
            <Button onClick={sendEmail} disabled={sendingEmail || !emailSubject || !emailMessage}>
              {sendingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate the user account for <strong>{userToDeactivate?.name}</strong>. The user will no
              longer be able to access their account, but their data will be preserved. You can reactivate this user
              later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivatingUser}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deactivateUser}
              disabled={deactivatingUser}
              className="bg-red-600 hover:bg-red-700"
            >
              {deactivatingUser ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deactivating...
                </>
              ) : (
                "Deactivate User"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  )
}
