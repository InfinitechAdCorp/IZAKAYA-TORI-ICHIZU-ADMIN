"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import {
  Mail,
  Reply,
  Trash2,
  Eye,
  Search,
  Loader2,
  ArrowUpDown,
  MoreHorizontal,
  MessageSquare,
  User,
  Calendar,
  Phone,
} from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
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

interface Contact {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  created_at: string
  replied?: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

const REPLY_TEMPLATES = [
  {
    title: "Thank You - General",
    content: "Thank you for reaching out to us! We appreciate your inquiry and will get back to you within 24 hours.",
  },
  {
    title: "Reservation Inquiry",
    content:
      "Thank you for your interest in making a reservation at our restaurant. We would be happy to accommodate your party. Please let us know your preferred date and time, and we'll confirm availability.",
  },
  {
    title: "Event Inquiry",
    content:
      "Thank you for considering us for your special event! We offer customized catering and private event services. Our team will contact you shortly to discuss your requirements and provide a quote.",
  },
  {
    title: "Menu/Delivery Question",
    content:
      "Thank you for your question! We offer delivery within a 5-mile radius with a ₱500 minimum order. Our full menu is available on our website. Please let us know if you need any additional information.",
  },
  {
    title: "Feedback",
    content:
      "Thank you for taking the time to share your feedback with us. We truly value your input and will use it to improve our service. We look forward to seeing you again soon!",
  },
]

export default function AdminContact() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [replyDialogOpen, setReplyDialogOpen] = useState(false)
  const [replyMessage, setReplyMessage] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { toast } = useToast()

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [globalFilter, setGlobalFilter] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  async function fetchContacts() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/contacts`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch`)
      }

      const data = await response.json()

      let contactsArray = []
      if (data?.data?.data && Array.isArray(data.data.data)) {
        contactsArray = data.data.data
      } else if (Array.isArray(data?.data)) {
        contactsArray = data.data
      } else if (Array.isArray(data)) {
        contactsArray = data
      }

      setContacts(contactsArray)
    } catch (error) {
      console.error("Error fetching contacts:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch contacts",
        variant: "destructive",
      })
      setContacts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const openReplyDialog = (contact: Contact) => {
    setSelectedContact(contact)
    setReplyMessage("")
    setSelectedTemplate("")
    setReplyDialogOpen(true)
  }

  const handleTemplateSelect = (template: (typeof REPLY_TEMPLATES)[0]) => {
    setSelectedTemplate(template.title)
    setReplyMessage(template.content)
  }

  const handleSendReply = async () => {
    if (!selectedContact || !replyMessage.trim()) {
      toast({
        title: "Error",
        description: "Please enter a reply message",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/contact/reply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: selectedContact.email,
          name: selectedContact.name,
          subject: `Re: ${selectedContact.subject}`,
          message: replyMessage,
          originalMessage: selectedContact.message,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Reply sent successfully!",
        })
        setReplyDialogOpen(false)
        setSelectedContact(null)
        setReplyMessage("")
        setSelectedTemplate("")
      } else {
        throw new Error(data.message || "Failed to send reply")
      }
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send reply",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to delete: ${response.status}`)
      }

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Inquiry deleted successfully",
        })
        fetchContacts()
      } else {
        throw new Error(data.message || "Failed to delete")
      }
    } catch (error) {
      console.error("Error deleting contact:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete inquiry",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const columns: ColumnDef<Contact>[] = [
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
          <div className="font-semibold text-gray-900 truncate">{row.original.name}</div>
          <div className="text-xs text-gray-500 sm:hidden truncate">{row.original.email}</div>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => <div className="text-sm text-gray-600 hidden sm:block truncate">{row.original.email}</div>,
    },
    {
      accessorKey: "subject",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal hidden md:flex"
        >
          Subject
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-gray-600 max-w-xs truncate hidden md:block">{row.original.subject}</div>
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
          Date
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
        const contact = row.original
        return (
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedContact(contact)}
                  className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2"
                >
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline">View</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
                {selectedContact && (
                  <>
                    <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 -m-6 mb-4 rounded-t-lg">
                      <DialogTitle className="text-xl font-bold">Contact Inquiry Details</DialogTitle>
                      <DialogDescription className="text-orange-100">Complete information for this inquiry</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <User className="w-5 h-5" />
                              Contact Information
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Name</Label>
                              <p className="font-medium">{selectedContact.name}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Email</Label>
                              <p className="text-sm">{selectedContact.email}</p>
                            </div>
                            {selectedContact.phone && (
                              <div>
                                <Label className="text-sm font-medium text-gray-500">Phone</Label>
                                <p className="text-sm">{selectedContact.phone}</p>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <MessageSquare className="w-5 h-5" />
                              Inquiry Details
                            </h3>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Subject</Label>
                              <p className="font-medium">{selectedContact.subject}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-gray-500">Submitted On</Label>
                              <p className="text-sm">{formatDate(selectedContact.created_at)}</p>
                            </div>
                            {selectedContact.replied && (
                              <div>
                                <Badge className="bg-green-100 text-green-800">
                                  <Reply className="w-3 h-3 mr-1" />
                                  Replied
                                </Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader className="pb-3">
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            <Mail className="w-5 h-5" />
                            Message
                          </h3>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap p-3 bg-gray-50 rounded-md">
                            {selectedContact.message}
                          </p>
                        </CardContent>
                      </Card>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => openReplyDialog(selectedContact)}
                          className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                        >
                          <Reply className="w-4 h-4 mr-2" />
                          Send Reply
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DialogContent>
            </Dialog>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => openReplyDialog(contact)}>
                  <Reply className="mr-2 h-4 w-4" /> Send Reply
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTitle asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="text-red-600 focus:text-red-600 mr-2 h-4 w-4" />
                      Delete Inquiry
                    </DropdownMenuItem>
                  </AlertDialogTitle>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the inquiry from "{contact.name}" and
                        remove it from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(contact.id)}
                        disabled={deletingId === contact.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === contact.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Inquiry"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      },
    },
  ]

  const table = useReactTable({
    data: contacts,
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

  const filteredRows = table.getFilteredRowModel().rows
  const totalItems = filteredRows.length
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage
  const paginatedRows = itemsPerPage === -1 ? filteredRows : filteredRows.slice(startIndex, endIndex)

  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage, globalFilter])

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(value === "all" ? -1 : parseInt(value))
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-60"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-gray-700 font-medium">Loading inquiries...</span>
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
                Contact Inquiries
              </span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Contact Inquiries Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Manage customer inquiries and send replies</p>
                </div>
                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-5 h-5 text-orange-500" />
                    <span className="text-gray-600 font-medium">Total Inquiries:</span>
                    <span className="font-bold text-orange-600 text-lg">{contacts.length}</span>
                  </div>
                </div>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100 overflow-hidden p-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className={`${!isMobile && "max-w-sm"} relative flex-1`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                        <Input
                          placeholder="Search inquiries..."
                          value={globalFilter || ""}
                          onChange={(event) => setGlobalFilter(event.target.value)}
                          className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                        />
                      </div>

                      <Button
                        size="sm"
                        onClick={fetchContacts}
                        className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Loader2 className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Refresh</span>
                        <span className="sm:hidden">Refresh</span>
                      </Button>
                    </div>
                  </div>
                </div>
                <CardContent className="p-0 bg-white">
                  <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} inquiries
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="items-per-page" className="text-sm text-gray-600 whitespace-nowrap">
                          Items per page:
                        </Label>
                        <Select
                          value={itemsPerPage === -1 ? "all" : itemsPerPage.toString()}
                          onValueChange={handleItemsPerPageChange}
                        >
                          <SelectTrigger
                            id="items-per-page"
                            className="w-[100px] border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                            <SelectItem value="100">100</SelectItem>
                            <SelectItem value="all">All</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="w-full">
                      <div className="rounded-lg border border-orange-200 overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[600px]">
                            <thead className="bg-gradient-to-r from-orange-100 to-red-100">
                              <tr className="border-b border-orange-200">
                                {table.getHeaderGroups().map((headerGroup) =>
                                  headerGroup.headers.map((header) => (
                                    <th
                                      key={header.id}
                                      className="text-left p-3 sm:p-4 text-sm font-semibold text-gray-700 tracking-wide"
                                    >
                                      {header.isPlaceholder ? null : (
                                        <div className="flex items-center gap-2">
                                          {typeof header.column.columnDef.header === "function"
                                            ? header.column.columnDef.header(header.getContext())
                                            : header.column.columnDef.header}
                                        </div>
                                      )}
                                    </th>
                                  ))
                                )}
                              </tr>
                            </thead>
                            <tbody>
                              {paginatedRows.map((row, index) => (
                                <tr
                                  key={row.id}
                                  className={`border-b border-orange-100 hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50 transition-all duration-200 ${
                                    index % 2 === 0 ? "bg-white" : "bg-orange-25"
                                  }`}
                                >
                                  {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id} className="p-3 sm:p-4 text-sm">
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
                            <Mail className="w-8 h-8 text-orange-500" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">No inquiries found</p>
                          {globalFilter && (
                            <p className="text-sm mt-1 text-gray-500">Try adjusting your search terms</p>
                          )}
                        </div>
                      )}

                      {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t border-orange-200">
                          <div className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(1)}
                              disabled={currentPage === 1}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                            >
                              First
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                              disabled={currentPage === 1}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                            >
                              Previous
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                              disabled={currentPage === totalPages}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                            >
                              Next
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setCurrentPage(totalPages)}
                              disabled={currentPage === totalPages}
                              className="border-orange-300 text-orange-600 hover:bg-orange-50 disabled:opacity-50"
                            >
                              Last
                            </Button>
                          </div>
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

      {/* Reply Dialog */}
      <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reply to {selectedContact?.name}</DialogTitle>
            <DialogDescription>Send a reply to this customer inquiry</DialogDescription>
          </DialogHeader>
          {selectedContact && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 p-4 rounded-lg border-2 border-orange-200">
                <p className="text-sm font-semibold text-gray-700 mb-2">Original Message:</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedContact.message}</p>
              </div>

              <div>
                <Label className="text-sm font-semibold text-gray-700 mb-2 block">Quick Templates:</Label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto border border-orange-200 rounded-lg p-2">
                  {REPLY_TEMPLATES.map((template, idx) => (
                    <Button
                      key={idx}
                      variant={selectedTemplate === template.title ? "default" : "outline"}
                      className={`justify-start text-left h-auto py-2 px-3 ${
                        selectedTemplate === template.title
                          ? "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                          : "border-orange-200 hover:bg-orange-50"
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-semibold text-sm">{template.title}</span>
                        <span className="text-xs text-gray-500 line-clamp-1">{template.content}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="reply-message" className="text-sm font-semibold text-gray-700 mb-2 block">
                  Your Reply:
                </Label>
                <Textarea
                  id="reply-message"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply message here..."
                  rows={8}
                  className="resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                />
              </div>

              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  This reply will be sent to: <strong>{selectedContact.email}</strong>
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReplyDialogOpen(false)}
              disabled={isSending}
              className="border-orange-300 text-orange-600 hover:bg-orange-50"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendReply}
              disabled={isSending || !replyMessage.trim()}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isSending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reply
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}
