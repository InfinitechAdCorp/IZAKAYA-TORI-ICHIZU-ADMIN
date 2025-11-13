"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit2, Plus, Search, Loader2, ArrowUpDown, Eye, MoreHorizontal, Upload, Star } from "lucide-react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  type ColumnDef,
  type ColumnFiltersState,
  type RowSelectionState,
  type SortingState,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table"
import Image from "next/image"

interface Chef {
  id: number
  name: string
  position: string
  specialty: string
  experience_years: number
  bio: string
  image_url?: string
  rating?: number
  created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export default function ChefsAdmin() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [selectedChef, setSelectedChef] = useState<Chef | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const { toast } = useToast()
  const isMobile = useIsMobile()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [formData, setFormData] = useState({
    name: "",
    position: "",
    specialty: "",
    experience_years: 0,
    bio: "",
    image: null as File | null,
    rating: 0,
  })
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const getImageUrl = (imageUrl?: string) => {
    if (!imageUrl) return "/placeholder.svg"
    if (imageUrl.startsWith("http")) return imageUrl
    return `${API_URL}${imageUrl}`
  }

  async function fetchChefs() {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/chefs`)
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setChefs(Array.isArray(data) ? data : data.data || [])
    } catch (error) {
      console.error("Error fetching chefs:", error)
      toast({
        title: "Error",
        description: "Failed to fetch chefs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChefs()
  }, [])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData({ ...formData, image: file })
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      position: "",
      specialty: "",
      experience_years: 0,
      bio: "",
      image: null,
      rating: 0,
    })
    setImagePreview(null)
    setEditingId(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsCreating(true)

    try {
      const form = new FormData()
      form.append("name", formData.name)
      form.append("position", formData.position)
      form.append("specialty", formData.specialty)
      form.append("experience_years", formData.experience_years.toString())
      form.append("bio", formData.bio)
      form.append("rating", formData.rating.toString())
      if (formData.image) {
        form.append("image", formData.image)
      }

      const url = editingId ? `${API_URL}/api/chefs/${editingId}` : `${API_URL}/api/chefs`
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: form,
      })

      if (!response.ok) throw new Error("Failed to save")

      toast({
        title: "Success",
        description: editingId ? "Chef updated successfully" : "Chef created successfully",
      })

      setIsCreateModalOpen(false)
      resetForm()
      setCurrentPage(1)
      fetchChefs()
    } catch (error) {
      console.error("Error saving chef:", error)
      toast({
        title: "Error",
        description: "Failed to save chef",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      const response = await fetch(`${API_URL}/api/chefs/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Chef deleted successfully",
      })

      fetchChefs()
    } catch (error) {
      console.error("Error deleting chef:", error)
      toast({
        title: "Error",
        description: "Failed to delete chef",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(chef: Chef) {
    setFormData({
      name: chef.name,
      position: chef.position,
      specialty: chef.specialty,
      experience_years: chef.experience_years,
      bio: chef.bio,
      image: null,
      rating: chef.rating || 0,
    })
    setImagePreview(getImageUrl(chef.image_url))
    setEditingId(chef.id)
    setIsCreateModalOpen(true)
  }

  const columns: ColumnDef<Chef>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="Select row" />,
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "image_url",
      header: "Image",
      cell: ({ row }) => (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0">
          <Image
            src={getImageUrl(row.original.image_url) || "/placeholder.svg"}
            alt={row.original.name}
            width={48}
            height={48}
            className="object-cover w-full h-full"
          />
        </div>
      ),
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-normal">
          Chef Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{row.original.name}</div>
          <div className="text-xs text-gray-500 sm:hidden truncate">{row.original.position}</div>
        </div>
      ),
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal hidden sm:flex"
        >
          Position
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="outline" className="text-xs hidden sm:inline-flex">
          {row.original.position}
        </Badge>
      ),
    },
    {
      accessorKey: "specialty",
      header: "Specialty",
      cell: ({ row }) => <div className="text-gray-600">{row.original.specialty}</div>,
    },
    {
      accessorKey: "experience_years",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-normal">
          Experience
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.original.experience_years} years</div>,
    },
    {
      accessorKey: "rating",
      header: "Rating",
      cell: ({ row }) => (
        <div>
          {row.original.rating ? (
            <span className="text-yellow-500">{"★".repeat(Math.round(row.original.rating))}</span>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
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
        const chef = row.original
        return (
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setSelectedChef(chef)} className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2">
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline">View</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
                {selectedChef && (
                  <>
                    <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 -m-6 mb-4 rounded-t-lg">
                      <DialogTitle className="text-xl font-bold">Chef Details</DialogTitle>
                      <DialogDescription className="text-orange-100">Complete information for this chef</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex flex-col lg:flex-row items-center lg:items-start gap-5">
                        <div className="w-60 h-60 rounded-xl overflow-hidden border-2 border-orange-200 shadow-lg flex-shrink-0">
                          <Image
                            src={getImageUrl(selectedChef.image_url) || "/placeholder.svg"}
                            alt={selectedChef.name}
                            width={300}
                            height={300}
                            className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 bg-white/70 backdrop-blur-md rounded-xl shadow-md p-6 sm:p-8 max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Chef Name</Label>
                              <p className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{selectedChef.name}</p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Position</Label>
                              <Badge
                                variant="outline"
                                className="text-xs sm:text-sm border-orange-300 text-orange-700 bg-orange-50 mt-1"
                              >
                                {selectedChef.position}
                              </Badge>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Specialty</Label>
                              <p className="text-sm sm:text-base text-gray-800 break-words">{selectedChef.specialty}</p>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div>
                              <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Experience</Label>
                              <p className="text-lg sm:text-xl font-bold text-orange-600">{selectedChef.experience_years} years</p>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Rating</Label>
                              <div className="text-yellow-500 text-lg sm:text-xl font-medium">
                                {selectedChef.rating ? "★".repeat(Math.round(selectedChef.rating)) : "Not rated"}
                              </div>
                            </div>

                            <div>
                              <Label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created On</Label>
                              <p className="text-sm sm:text-base text-gray-700">
                                {new Date(selectedChef.created_at).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "2-digit",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="gap-2 p-4 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm">
                        <Label className="text-sm font-medium text-gray-500">Biography</Label>
                        <p className="text-sm mt-1 p-3 rounded-md whitespace-pre-wrap">{selectedChef.bio}</p>
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
                <DropdownMenuItem onClick={() => handleEdit(chef)}>
                  <Edit2 className="mr-2 h-4 w-4" /> Edit Chef
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="text-red-600 focus:text-red-600 mr-2 h-4 w-4" />
                      Delete Chef
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the chef "{chef.name}" and remove them from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(chef.id)}
                        disabled={deletingId === chef.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === chef.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          "Delete Chef"
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
    data: chefs,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      globalFilter,
      rowSelection,
      sorting,
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
  })

  // Calculate pagination
  const filteredRows = table.getFilteredRowModel().rows
  const totalItems = filteredRows.length
  const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(totalItems / itemsPerPage)
  const startIndex = itemsPerPage === -1 ? 0 : (currentPage - 1) * itemsPerPage
  const endIndex = itemsPerPage === -1 ? totalItems : startIndex + itemsPerPage
  const paginatedRows = itemsPerPage === -1 ? filteredRows : filteredRows.slice(startIndex, endIndex)

  // Reset to page 1 when items per page changes or filter changes
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
                <span className="text-gray-700 font-medium">Loading chefs...</span>
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
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Chefs</span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Chefs Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your culinary team with excellence</p>
                </div>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100 overflow-hidden p-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className={`${!isMobile && "max-w-sm"} relative flex-1`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                        <Input
                          placeholder="Search chefs..."
                          value={globalFilter || ""}
                          onChange={(event) => setGlobalFilter(event.target.value)}
                          className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                        />
                      </div>

                      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={resetForm}
                            className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Add Chef</span>
                            <span className="sm:hidden">Add</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
                          <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 -m-6 mb-4 rounded-t-lg">
                            <DialogTitle className="text-xl font-bold">{editingId ? "Edit Chef" : "Add New Chef"}</DialogTitle>
                            <DialogDescription className="text-orange-100">Fill in the details for the chef profile.</DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-6 py-4">
                            <div className="grid grid-cols-1 gap-4">
                              <div>
                                <Label htmlFor="name" className="text-gray-700 font-medium">
                                  Chef Name
                                </Label>
                                <Input
                                  id="name"
                                  value={formData.name}
                                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  required
                                  disabled={isCreating}
                                  placeholder="e.g., Gordon Ramsay"
                                  className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="position" className="text-gray-700 font-medium">
                                    Position
                                  </Label>
                                  <Input
                                    id="position"
                                    value={formData.position}
                                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder="e.g., Head Chef"
                                    className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="specialty" className="text-gray-700 font-medium">
                                    Specialty
                                  </Label>
                                  <Input
                                    id="specialty"
                                    value={formData.specialty}
                                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                                    required
                                    disabled={isCreating}
                                    placeholder="e.g., Italian Cuisine"
                                    className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                  />
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="experience_years" className="text-gray-700 font-medium">
                                    Years of Experience
                                  </Label>
                                  <Input
                                    id="experience_years"
                                    type="number"
                                    min="0"
                                    value={formData.experience_years}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        experience_years: Number.parseInt(e.target.value),
                                      })
                                    }
                                    required
                                    disabled={isCreating}
                                    className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="rating" className="text-gray-700 font-medium">
                                    Rating (0-5)
                                  </Label>
                                  <Input
                                    id="rating"
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    value={formData.rating}
                                    onChange={(e) =>
                                      setFormData({
                                        ...formData,
                                        rating: Number.parseFloat(e.target.value),
                                      })
                                    }
                                    disabled={isCreating}
                                    className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="bio" className="text-gray-700 font-medium">
                                  Biography
                                </Label>
                                <Textarea
                                  id="bio"
                                  value={formData.bio}
                                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                  required
                                  rows={4}
                                  disabled={isCreating}
                                  placeholder="Tell us about the chef's background and achievements..."
                                  className="mt-1 resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                />
                              </div>

                              <div>
                                <Label htmlFor="image" className="text-gray-700 font-medium">
                                  Chef Image
                                </Label>
                                <div className="flex items-center gap-4 mt-1">
                                  <Input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    disabled={isCreating}
                                    className="flex-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isCreating}
                                    size="sm"
                                    className="border-orange-300 text-orange-600 hover:bg-orange-50"
                                  >
                                    <Upload className="w-4 h-4 mr-2" />
                                    Browse
                                  </Button>
                                </div>
                                {imagePreview && (
                                  <div className="mt-3">
                                    <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-orange-200 shadow-md">
                                      <Image
                                        src={imagePreview || "/placeholder.svg"}
                                        alt="Preview"
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            <DialogFooter className="gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsCreateModalOpen(false)
                                  resetForm()
                                }}
                                disabled={isCreating}
                                className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isCreating}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                              >
                                {isCreating ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {editingId ? "Updating..." : "Creating..."}
                                  </>
                                ) : (
                                  <>{editingId ? "Update Chef" : "Create Chef"}</>
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
                <CardContent className="p-0 bg-white">
                  <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} chefs
                      </div>
                      <div className="flex items-center gap-2">
                        <Label htmlFor="items-per-page" className="text-sm text-gray-600 whitespace-nowrap">
                          Items per page:
                        </Label>
                        <Select value={itemsPerPage === -1 ? "all" : itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                          <SelectTrigger id="items-per-page" className="w-[100px] border-orange-200 focus:border-orange-400 focus:ring-orange-400">
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
                              {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="border-b border-orange-200">
                                  {headerGroup.headers.map((header) => (
                                    <th key={header.id} className="text-left p-3 sm:p-4 text-sm font-semibold text-gray-700 tracking-wide">
                                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                  ))}
                                </tr>
                              ))}
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
                                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
                            <Search className="w-8 h-8 text-orange-500" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">No chefs found</p>
                          {globalFilter && <p className="text-sm mt-1 text-gray-500">Try adjusting your search terms</p>}
                        </div>
                      )}

                      {/* Pagination Controls */}
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
    </SidebarProvider>
  )
}
