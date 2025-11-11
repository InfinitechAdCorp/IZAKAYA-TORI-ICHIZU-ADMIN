"use client"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Upload, Flame, Leaf, Save, Star } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"

interface Product {
  id: number
  name: string
  description: string
  price: number | string
  image: string
  category: string
  is_spicy?: boolean
  is_vegetarian?: boolean
  is_featured?: boolean
  created_at: string
  updated_at: string
}

const categories = [
  "Appetizers",
  "Main Course",
  "Desserts",
  "Beverages",
  "Korean BBQ",
  "Noodles",
  "Rice Dishes",
  "Soups",
  "Sashimi",
  "Pasta",
  "Pizza",
]

// Helper function to get valid image URL
const getImageUrl = (imagePath: string): string => {
  if (!imagePath) {
    return "/placeholder-food.jpg"
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
  let fullPath = imagePath
  if (!imagePath.startsWith("images/products/")) {
    fullPath = `images/products/${imagePath}`
  }

  return `${API_BASE_URL}/${fullPath}`
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    is_spicy: false,
    is_vegetarian: false,
    is_featured: false,
  })
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Helper function to check authentication
  const checkAuth = (): string | null => {
    const token = localStorage.getItem("token")
    if (!token) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please login to continue.",
      })
      router.push("/admin/login")
      return null
    }
    return token
  }

  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      setIsTablet(window.innerWidth < 1024 || window.innerWidth  < 1279)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/product/${params.id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch product")
        }
        const productData = await response.json()
        setProduct(productData)

        // Populate form
        setFormData({
          name: productData.name || "",
          description: productData.description || "",
          price: productData.price ? productData.price.toString() : "",
          category: productData.category || "",
          is_spicy: productData.is_spicy || false,
          is_vegetarian: productData.is_vegetarian || false,
          is_featured: productData.is_featured || false,
        })
      } catch (error) {
        console.error("Failed to fetch product:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load product details",
        })
        router.push("/admin/product")
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchProduct()
    }
  }, [params.id, toast, router])

  // Handle form changes
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = checkAuth()
      if (!token) {
        setSaving(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("name", formData.name)
      formDataToSend.append("description", formData.description)
      formDataToSend.append("price", formData.price)
      formDataToSend.append("category", formData.category)
      formDataToSend.append("is_spicy", formData.is_spicy.toString())
      formDataToSend.append("is_vegetarian", formData.is_vegetarian.toString())
      formDataToSend.append("is_featured", formData.is_featured.toString())

      if (selectedImage) {
        formDataToSend.append("image", selectedImage)
      }

      // Add _method for Laravel to handle PUT request
      formDataToSend.append("_method", "PUT")

      const response = await fetch(`/api/product/${params.id}`, {
        method: "POST", // Use POST with _method for file uploads
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formDataToSend,
      })

      const result = await response.json()
      
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            variant: "destructive",
            title: "Session Expired",
            description: "Your session has expired. Please login again.",
          })
          localStorage.removeItem("token")
          localStorage.removeItem("user")
          router.push("/admin/login")
          return
        }
        throw new Error(result.message || "Failed to update product.")
      }

      toast({
        title: "Success",
        description: "Product updated successfully!",
      })

      router.push("/admin/product")
    } catch (error: any) {
      console.error("Error updating product:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "There was an error updating the product.",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-gray-700 font-medium">Loading product details...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  if (!product) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Product not found</h2>
                <Button
                  onClick={() => router.push("/admin/product")}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Products
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
      <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Edit Product
              </span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4 bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/admin/product")}
                    className="shrink-0 hover:bg-orange-100 text-orange-600"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Edit Product
                    </h1>
                    <p className="text-sm sm:text-base text-gray-600">Update product information</p>
                  </div>
                </div>
              </div>

              <Card className="bg-white/70 backdrop-blur-sm shadow-xl border-orange-100">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <span>Product Details</span>
                    {(formData.is_spicy || formData.is_vegetarian || formData.is_featured) && (
                      <div className="flex gap-1 ml-auto">
                        {formData.is_featured && (
                          <div className="bg-white/20 rounded-full p-1">
                            <Star className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {formData.is_spicy && (
                          <div className="bg-white/20 rounded-full p-1">
                            <Flame className="w-4 h-4 text-white" />
                          </div>
                        )}
                        {formData.is_vegetarian && (
                          <div className="bg-white/20 rounded-full p-1">
                            <Leaf className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-1">
                        <Label htmlFor="image" className="text-base font-medium text-gray-700">
                          Product Image
                        </Label>
                        <div className="mt-2 space-y-4">
                          <div className="w-full aspect-square max-w-xs mx-auto lg:mx-0 rounded-xl overflow-hidden border-2 border-dashed border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg">
                            <Image
                              src={imagePreview || getImageUrl(product.image)}
                              alt={product.name}
                              width={300}
                              height={300}
                              className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <div className="space-y-2">
                            <Input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageSelect}
                              disabled={saving}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fileInputRef.current?.click()}
                              disabled={saving}
                              className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 font-medium shadow-md"
                            >
                              <Upload className="w-4 h-4 mr-2" />
                              {selectedImage ? "Change Image" : "Upload New Image"}
                            </Button>
                            {selectedImage && (
                              <p className="text-xs text-gray-500 text-center bg-orange-50 p-2 rounded-lg">
                                New image selected: {selectedImage.name}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="sm:col-span-2">
                            <Label htmlFor="name" className="text-gray-700 font-medium">
                              Product Name *
                            </Label>
                            <Input
                              id="name"
                              name="name"
                              value={formData.name}
                              onChange={handleFormChange}
                              required
                              disabled={saving}
                              placeholder="e.g., Kimchi Fried Rice"
                              className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                          </div>

                          <div>
                            <Label htmlFor="price" className="text-gray-700 font-medium">
                              Price (₱) *
                            </Label>
                            <Input
                              id="price"
                              name="price"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.price}
                              onChange={handleFormChange}
                              required
                              disabled={saving}
                              placeholder="0.00"
                              className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                            />
                          </div>

                          <div>
                            <Label htmlFor="category" className="text-gray-700 font-medium">
                              Category *
                            </Label>
                            <Select value={formData.category} onValueChange={handleCategoryChange} disabled={saving}>
                              <SelectTrigger className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="description" className="text-gray-700 font-medium">
                            Description *
                          </Label>
                          <Textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            required
                            rows={4}
                            disabled={saving}
                            placeholder="Describe the dish, ingredients, and preparation..."
                            className="mt-1 resize-none border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          />
                        </div>

                        <div className="space-y-4">
                          <Label className="text-base font-medium text-gray-700">Properties</Label>
                          <div className={`${isMobile ? "grid grid-cols-1 sm:grid-cols-3 gap-4": isTablet ? "flex flex-wrap gap-4" : "flex sm:flex-cols-1 gap-4"}`}>
                            <div className={`${!isMobile && "w-42"} flex items-center space-x-3 p-3 border-2 border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200`}>
                              <Switch
                                id="is_featured"
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => handleSwitchChange("is_featured", checked)}
                                disabled={saving}
                              />
                              <Label
                                htmlFor="is_featured"
                                className="flex items-center cursor-pointer text-gray-700 font-medium"
                              >
                                <Star className="w-4 h-4 text-yellow-500" />
                                Featured
                              </Label>
                            </div>

                            <div className={`${!isMobile && "w-42"} flex items-center space-x-3 p-3 border-2 border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200`}>
                               <Switch
                                id="is_spicy"
                                checked={formData.is_spicy}
                                onCheckedChange={(checked) => handleSwitchChange("is_spicy", checked)}
                                disabled={saving}
                              />
                              <Label
                                htmlFor="is_spicy"
                                className="flex items-center cursor-pointer text-gray-700 font-medium"
                              >
                                <Flame className="w-4 h-4 text-red-500" />
                                Spicy
                              </Label>
                            </div>

                            <div className={`${!isMobile && "w-42"} flex items-center space-x-3 p-3 border-2 border-orange-200 rounded-lg bg-gradient-to-r from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 transition-all duration-200`}>
                              <Switch
                                id="is_vegetarian"
                                checked={formData.is_vegetarian}
                                onCheckedChange={(checked) => handleSwitchChange("is_vegetarian", checked)}
                                disabled={saving}
                              />
                              <Label
                                htmlFor="is_vegetarian"
                                className="flex items-center cursor-pointer text-gray-700 font-medium"
                              >
                                <Leaf className="w-4 h-4 text-green-500" />
                                Vegetarian
                              </Label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-orange-200">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/product")}
                        disabled={saving}
                        className="w-full sm:w-auto order-2 sm:order-1 border-orange-300 text-orange-600 hover:bg-orange-50"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving}
                        className="w-full sm:w-auto sm:ml-auto order-1 sm:order-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Updating Product...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Update Product
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-orange-100 to-red-100 border-orange-200 shadow-lg">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Product ID</Label>
                      <p className="font-mono text-gray-800 font-medium">{product.id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Created</Label>
                      <p className="text-gray-800 font-medium">
                        {new Date(product.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">
                        Last Updated
                      </Label>
                      <p className="text-gray-800 font-medium">
                        {new Date(product.updated_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Status</Label>
                      <p className="text-green-600 font-bold">Active</p>
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
