"use client"
import { useState, useEffect } from "react"
import type { MenuItem } from "@/types"
import MenuItemCard from "@/components/ui/menu-item-card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function MenuPage() {
  const [products, setProducts] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/product")
        if (!response.ok) throw new Error("Failed to fetch products")
        const data = await response.json()

        const transformedProducts: MenuItem[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: typeof product.price === "string" ? Number.parseFloat(product.price) : product.price,
          category: product.category,
          image: product.image,
          isSpicy: product.is_spicy || false,
          isVegetarian: product.is_vegetarian || false,
        }))

        setProducts(transformedProducts)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : "Failed to fetch products")
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))]
  const filtered = selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
          <Loader2 className="h-6 w-6 animate-spin text-yellow-400" />
          <span className="text-yellow-100 font-medium">Loading menu...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-yellow-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-sm px-6 py-4 rounded-xl">
          <p className="text-yellow-100 font-medium mb-2">Failed to load menu</p>
          <p className="text-yellow-200/80 text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-orange-900 to-yellow-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">Izakaya Menu</h1>
          <p className="text-yellow-200 text-lg md:text-xl">Authentic Japanese izakaya flavors delivered fresh</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className={`${
                selectedCategory === category
                  ? "bg-yellow-400 text-black hover:bg-yellow-300"
                  : "bg-orange-600/30 text-yellow-100 border-orange-400/50 hover:bg-orange-600/50"
              } transition-all duration-200`}
            >
              {category}
            </Button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-yellow-200/80 text-lg">
              {selectedCategory === "All"
                ? "No menu items available"
                : `No items found in ${selectedCategory} category`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {filtered.map((product) => (
              <MenuItemCard key={product.id} item={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
