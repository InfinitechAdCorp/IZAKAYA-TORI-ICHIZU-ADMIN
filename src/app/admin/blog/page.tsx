"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Edit, Plus, X, Play, Eye, Search, ArrowUpDown, Loader2, Upload, MoreHorizontal } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
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
  AlertDialogTrigger,
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

const scrollbarStyles = `
  /* Scrollbar width */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  /* Scrollbar track */
  ::-webkit-scrollbar-track {
    border-radius: 9999px;
  }

  /* Scrollbar thumb */
  ::-webkit-scrollbar-thumb {
    background-color: #9ca3af;
    border-radius: 9999px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background-color: #6b7280;
  }

  /* Firefox scrollbar */
  scrollbar-width: thin;
  scrollbar-color: #9ca3af #f3f4f6;
`;

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  video_url?: string
  thumbnail_url?: string
  created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export default function BlogPostsAdmin() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)
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

  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    video: null as File | null,
    thumbnail: null as File | null,
  })

  const [videoPreview, setVideoPreview] = useState<string | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + "..."
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsUploading(true)

    try {
      const form = new FormData()
      form.append("title", formData.title)
      form.append("excerpt", formData.excerpt)
      form.append("content", formData.content)
      form.append("author", formData.author)

      if (formData.video) {
        form.append("video", formData.video)
      }

      if (formData.thumbnail) {
        form.append("thumbnail", formData.thumbnail)
      }

      const url = editingId ? `/api/blog-posts/${editingId}` : "/api/blog-posts"
      const method = editingId ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        body: form,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to save")
      }

      toast({
        title: "Success",
        description: editingId ? "Blog post updated successfully" : "Blog post created successfully",
      })
      setIsCreateModalOpen(false)
      resetForm()
      fetchPosts()
    } catch (error) {
      console.error("Error saving post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      video: null,
      thumbnail: null,
    })
    setVideoPreview(null)
    setThumbnailPreview(null)
    setEditingId(null)
  }

  async function handleDelete(id: number) {
    setDeletingId(id)
    try {
      const response = await fetch(`/api/blog-posts/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Delete failed:", errorText)
        throw new Error("Failed to delete")
      }

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      })

      fetchPosts()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  function handleEdit(post: BlogPost) {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      author: post.author,
      video: null,
      thumbnail: null,
    })
    setVideoPreview(post.video_url ? `${API_URL}${post.video_url}` : null)
    setThumbnailPreview(post.thumbnail_url ? `${API_URL}${post.thumbnail_url}` : null)
    setEditingId(post.id)
    setIsCreateModalOpen(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  async function fetchPosts() {
    try {
      setLoading(true)
      const response = await fetch("/api/blog-posts")
      if (!response.ok) throw new Error("Failed to fetch")
      const data = await response.json()
      setPosts(data)
    } catch (error) {
      console.error("Error fetching posts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch blog posts",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  const columns: ColumnDef<BlogPost>[] = [
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
      accessorKey: "thumbnail_url",
      header: "Thumbnail",
      cell: ({ row }) => (
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg overflow-hidden flex-shrink-0 relative">
          {row.original.thumbnail_url ? (
            <>
              <img src={`${API_URL}${row.original.thumbnail_url}`} alt={row.original.title} className="object-cover w-full h-full" />
              {row.original.video_url && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Play className="w-4 h-4 text-white" />
                </div>
              )}
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-orange-100 to-red-100 flex items-center justify-center">
              <span className="text-xs text-gray-500">No img</span>
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="p-0 h-auto font-normal">
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-semibold text-gray-900 truncate">{truncateText(row.original.title, 60)}</div>
          <div className="text-xs text-gray-500 sm:hidden truncate">{row.original.author}</div>
        </div>
      ),
    },
    {
      accessorKey: "author",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="p-0 h-auto font-normal hidden sm:flex"
        >
          Author
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="text-sm hidden sm:block">{row.original.author}</div>,
    },
    {
      accessorKey: "excerpt",
      header: "Excerpt",
      cell: ({ row }) => <div className="text-sm text-gray-600 max-w-xs hidden md:block">{truncateText(row.original.excerpt, 60)}</div>,
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
        const post = row.original
        return (
          <div className="flex items-center gap-1">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPost(post)} className="h-8 w-8 p-0 sm:h-auto sm:w-auto sm:px-2">
                  <Eye className="h-4 w-4" />
                  <span className="ml-1 sr-only sm:not-sr-only hidden sm:inline">View</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[100vh] max-h-[90vh] md:max-w-[700px] overflow-y-hidden bg-gradient-to-br from-orange-50 to-red-50">
                {selectedPost && (
                  <>
                    <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 -m-6 mb-4 rounded-t-lg">
                      <DialogTitle className="text-xl font-bold">{selectedPost.title}</DialogTitle>
                      <DialogDescription className="text-orange-100">
                        By {selectedPost.author} • {new Date(selectedPost.created_at).toLocaleDateString()}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4 max-h-[60vh] overflow-y-auto">
                      <style>{scrollbarStyles}</style>
                      {selectedPost.video_url && (
                        <div className="mr-2 rounded-lg overflow-hidden bg-black">
                          <video
                            src={`${API_URL}${selectedPost.video_url}`}
                            controls
                            className="w-full max-h-96 object-contain"
                            poster={selectedPost.thumbnail_url ? `${API_URL}${selectedPost.thumbnail_url}` : undefined}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      )}
                      {!selectedPost.video_url && selectedPost.thumbnail_url && (
                        <div className="mr-2 rounded-lg overflow-hidden">
                          <img src={`${API_URL}${selectedPost.thumbnail_url}`} alt={selectedPost.title} className="w-full object-cover" />
                        </div>
                      )}
                        <div className="gap-4 p-4 mr-2 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm">
                          <Label className="text-sm font-medium text-gray-500">Excerpt</Label>
                          <p className="text-sm mt-1 p-3 rounded-md">{selectedPost.excerpt}</p>
                        </div>
                        <div className="gap-4 p-4 mr-2 rounded-lg bg-white/70 backdrop-blur-sm shadow-sm">
                          <Label className="text-sm font-medium text-gray-500">Content</Label>
                          <p className="text-sm mt-1 p-3 rounded-md whitespace-pre-wrap">{selectedPost.content}</p>
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
                <DropdownMenuItem onClick={() => handleEdit(post)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Trash2 className="text-red-600 focus:text-red-600 mr-2 h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the blog post "{post.title}" and remove it from the system.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(post.id)}
                        disabled={deletingId === post.id}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deletingId === post.id ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Deleting...
                          </>
                        ) : (
                          <span className="text-white">Delete Post</span>
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
    data: posts,
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
                <span className="text-gray-700 font-medium">Loading blog posts...</span>
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
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Blog Posts</span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-full space-y-4 sm:space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                    Blog Posts Management
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">Manage and create your blog content</p>
                </div>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100 overflow-hidden p-0">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <div className="flex flex-col gap-4 p-4">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                      <div className={`${!isMobile && "max-w-sm"} relative flex-1`}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/70" />
                        <Input
                          placeholder="Search blog posts..."
                          value={globalFilter || ""}
                          onChange={(event) => setGlobalFilter(event.target.value)}
                          className="pl-9 pr-3 py-2 w-full bg-white/20 border-white/30 text-white placeholder:text-white/70 focus:bg-white/30 focus:border-white/50 transition-all duration-200"
                        />
                      </div>

                      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            onClick={() => setIsCreateModalOpen(true)}
                            className="shrink-0 bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            <span className="hidden sm:inline">Add Blog Post</span>
                            <span className="sm:hidden">Add</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
                          <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 -m-6 mb-4 rounded-t-lg">
                            <DialogTitle className="text-xl font-bold">{editingId ? "Edit Post" : "Create New Post"}</DialogTitle>
                            <DialogDescription className="text-orange-100">
                              {editingId ? "Update post details" : "Create a new post for your customers"}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label htmlFor="title" className="text-gray-700 font-medium">
                                  Title
                                </Label>
                                <Input
                                  id="title"
                                  placeholder="Enter post title"
                                  value={formData.title}
                                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                  required
                                  disabled={isUploading}
                                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="author" className="text-gray-700 font-medium">
                                  Author
                                </Label>
                                <Input
                                  id="author"
                                  placeholder="Enter author name"
                                  value={formData.author}
                                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                  required
                                  disabled={isUploading}
                                  className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                                />
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="excerpt" className="text-gray-700 font-medium">
                                Excerpt
                              </Label>
                              <Textarea
                                id="excerpt"
                                placeholder="Short summary of your post (appears in previews)"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                                required
                                disabled={isUploading}
                                rows={3}
                                className="resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="content" className="text-gray-700 font-medium">
                                Content
                              </Label>
                              <Textarea
                                id="content"
                                placeholder="Full blog post content"
                                value={formData.content}
                                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                required
                                disabled={isUploading}
                                rows={8}
                                className="resize-none font-mono text-sm border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                              />
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Featured Video (Optional)</Label>
                                <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors cursor-pointer">
                                  <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null
                                      setFormData({ ...formData, video: file })
                                      if (file) {
                                        const url = URL.createObjectURL(file)
                                        setVideoPreview(url)
                                      }
                                    }}
                                    disabled={isUploading}
                                    className="hidden"
                                    id="video-upload"
                                  />
                                  <label htmlFor="video-upload" className="cursor-pointer block">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                                    <p className="text-sm font-medium text-gray-700">
                                      {formData.video
                                        ? formData.video.name
                                        : videoPreview
                                        ? "Current video - click to change"
                                        : "Click to upload video"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">MP4, WebM, OGG up to 100MB</p>
                                  </label>
                                </div>
                                {videoPreview && (
                                  <div className="mt-3 relative rounded-lg overflow-hidden bg-black">
                                    <video src={videoPreview} controls className="w-full max-h-60 object-contain">
                                      Your browser does not support the video tag.
                                    </video>
                                  </div>
                                )}
                              </div>

                              <div className="space-y-2">
                                <Label className="text-gray-700 font-medium">Video Thumbnail (Optional)</Label>
                                <div className="border-2 border-dashed border-orange-200 rounded-lg p-6 text-center hover:border-orange-300 transition-colors cursor-pointer">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0] || null
                                      setFormData({ ...formData, thumbnail: file })
                                      if (file) {
                                        const url = URL.createObjectURL(file)
                                        setThumbnailPreview(url)
                                      }
                                    }}
                                    disabled={isUploading}
                                    className="hidden"
                                    id="thumbnail-upload"
                                  />
                                  <label htmlFor="thumbnail-upload" className="cursor-pointer block">
                                    <Upload className="w-8 h-8 mx-auto mb-2 text-orange-500" />
                                    <p className="text-sm font-medium text-gray-700">
                                      {formData.thumbnail
                                        ? formData.thumbnail.name
                                        : thumbnailPreview
                                        ? "Current thumbnail - click to change"
                                        : "Click to upload thumbnail"}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                                  </label>
                                </div>
                                {thumbnailPreview && (
                                  <div className="mt-3 rounded-lg overflow-hidden h-40">
                                    <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            </div>

                            <DialogFooter className="gap-2 mb-5">
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                  setIsCreateModalOpen(false)
                                  resetForm()
                                }}
                                disabled={isUploading}
                                className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-50"
                              >
                                Cancel
                              </Button>
                              <Button
                                type="submit"
                                disabled={isUploading}
                                className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                              >
                                {isUploading ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {editingId ? "Updating..." : "Creating..."}
                                  </>
                                ) : editingId ? (
                                  "Update Post"
                                ) : (
                                  "Create Post"
                                )}
                              </Button>
                            </DialogFooter>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
                <CardContent className="bg-white">
                  <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                      <div className="text-sm text-gray-600 font-medium">
                        Showing {startIndex + 1} to {Math.min(endIndex, totalItems)} of {totalItems} posts
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
                              <tr className="border-b border-orange-200">
                                {table.getHeaderGroups().map((headerGroup) =>
                                  headerGroup.headers.map((header) => (
                                    <th key={header.id} className="text-left p-3 sm:p-4 text-sm font-semibold text-gray-700 tracking-wide">
                                      {header.isPlaceholder ? null : (
                                        <div className="flex items-center gap-2">
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
                            <Search className="w-8 h-8 text-orange-500" />
                          </div>
                          <p className="text-lg font-medium text-gray-700">No blog posts found</p>
                          {globalFilter && <p className="text-sm mt-1 text-gray-500">Try adjusting your search terms</p>}
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
    </SidebarProvider>
  )
}
