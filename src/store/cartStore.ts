import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem, MenuItem } from "@/types"

interface CartStore {
  items: CartItem[]
  addItem: (item: MenuItem) => void
  removeItem: (itemId: string | number) => void
  updateQuantity: (itemId: string | number, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item: MenuItem) => {
        const items = get().items
        const existingItem = items.find((cartItem) => cartItem.id === item.id)

        // Normalize image before storing
        const normalizedImage =
          typeof item.image === "string" ? item.image : (item.image as any)?.src || "/placeholder.svg"

        if (existingItem) {
          set({
            items: items.map((cartItem) =>
              cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
            ),
          })
        } else {
          set({
            items: [...items, { ...item, image: normalizedImage, quantity: 1 }],
          })
        }
      },

      removeItem: (itemId: string | number) => {
        set({
          items: get().items.filter((item) => item.id !== itemId),
        })
      },

      updateQuantity: (itemId: string | number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId)
          return
        }

        set({
          items: get().items.map((item) => (item.id === itemId ? { ...item, quantity } : item)),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        return get().items.reduce((total, item) => total + item.price * item.quantity, 0)
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0)
      },
    }),
    {
      name: "Izakaya Tori Ichizu-cart-storage",
    },
  ),
)
