"use client"
import { useState } from "react"
import type React from "react"

import Image from "next/image"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Flame, Leaf } from "lucide-react"
import { useCartStore } from "@/store/cartStore"
import { toast } from "@/hooks/use-toast"
import type { MenuItem } from "@/types"

interface MenuItemModalProps {
  item: MenuItem
  children: React.ReactNode
}

const getImageUrl = (imagePath: unknown): string => {
  if (typeof imagePath !== "string" || imagePath.trim() === "") {
    return "/placeholder.svg"
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

export default function MenuItemModal({ item, children }: MenuItemModalProps) {
  const [open, setOpen] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  const handleAddToCart = () => {
    addItem(item)
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    })
    setOpen(false)
  }

  const isSpicy = item.isSpicy || item.is_spicy || false
  const isVegetarian = item.isVegetarian || item.is_vegetarian || false

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-md mx-auto bg-gradient-to-br from-green-800 via-emerald-700 to-green-700 border-0 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white text-center">{item.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <Image
                src={getImageUrl(item.image) || "/placeholder.svg"}
                alt={item.name}
                width={192}
                height={192}
                className="object-cover w-full h-full"
              />
            </div>
          </div>

          <div className="flex justify-center gap-2">
            {isSpicy && (
              <Badge variant="destructive" className="bg-red-600 text-white">
                <Flame className="w-4 h-4 mr-1" />
                Spicy
              </Badge>
            )}
            {isVegetarian && (
              <Badge variant="secondary" className="bg-green-500 text-white">
                <Leaf className="w-4 h-4 mr-1" />
                Vegetarian
              </Badge>
            )}
            <Badge variant="outline" className="border-white/30 text-white">
              {item.category}
            </Badge>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <p className="text-white/90 leading-relaxed text-center">{item.description}</p>
          </div>

          <div className="space-y-4">
            <div className="text-center">
              <span className="text-3xl font-bold text-white drop-shadow-lg">
                ₱{" "}
                {typeof item.price === "number"
                  ? item.price.toFixed(2)
                  : Number.parseFloat(String(item.price)).toFixed(2)}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              className="w-full text-lg py-6 bg-white/90 text-green-600 hover:bg-white hover:text-green-700 font-bold shadow-lg backdrop-blur-sm border border-white/30 transition-all duration-300"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
