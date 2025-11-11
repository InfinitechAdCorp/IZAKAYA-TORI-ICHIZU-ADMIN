"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, X, MapPin, Calendar, Phone } from "lucide-react"

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
}

interface Order {
  id: string
  date: string
  status: "confirmed" | "preparing" | "shipped" | "delivered" | "cancelled"
  items: OrderItem[]
  total: number
  deliveryAddress: string
  trackingNumber?: string
  estimatedDelivery?: string
}

interface OrderDetailsModalProps {
  order: Order | null
  onClose: () => void
}

const OrderDetailsModal = ({ order, onClose }: OrderDetailsModalProps) => {
  if (!order) return null

  const renderTrackingProgress = (status: Order["status"]) => {
    const steps = ["confirmed", "preparing", "shipped", "delivered"]
    const stepLabels = ["Confirmed", "Preparing", "Shipped", "Delivered"]
    const currentIndex = steps.indexOf(status)

    return (
      <div className="w-full max-w-md">
        <div className="relative flex items-center justify-between mb-2">
          <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-orange-600 -translate-y-1/2"></div>
          <div
            className="absolute top-1/2 left-4 h-0.5 bg-yellow-600 -translate-y-1/2 transition-all duration-500"
            style={{
              width: currentIndex > 0 ? `${(currentIndex / (steps.length - 1)) * 100}%` : "0%",
              maxWidth: "calc(100% - 32px)",
            }}
          ></div>

          {steps.map((step, index) => (
            <div
              key={step}
              className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                index <= currentIndex
                  ? "bg-orange-600 border-orange-600 text-white"
                  : "bg-gray-600 border-gray-500 text-gray-400"
              }`}
            >
              {index <= currentIndex ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <div className="w-2 h-2 bg-current rounded-full" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          {stepLabels.map((label, index) => (
            <div key={index} className="text-xs text-gray-400 text-center w-8">
              {label}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="bg-gradient-to-br from-gray-900 to-black border-orange-400/30 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b border-white/10">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl text-orange-400">Order Details - #{order.id}</CardTitle>
              <p className="text-gray-300 text-sm mt-1">Placed on {new Date(order.date).toLocaleDateString()}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-gray-400 hover:text-black">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-white font-semibold mb-3">Order Status</h3>
              <div className="bg-black/20 rounded-lg p-4">
                {renderTrackingProgress(order.status)}
                {order.trackingNumber && (
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-400/20 rounded">
                    <p className="text-blue-300 text-sm">
                      <strong>Tracking Number:</strong> {order.trackingNumber}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-white font-semibold mb-3">Delivery Information</h3>
              <div className="bg-black/20 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-white text-sm font-medium">Delivery Address</p>
                    <p className="text-gray-300 text-sm">{order.deliveryAddress}</p>
                  </div>
                </div>
                {order.estimatedDelivery && (
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-white text-sm font-medium">Estimated Delivery</p>
                      <p className="text-gray-300 text-sm">{new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Order Items</h3>
            <div className="bg-black/20 rounded-lg p-4 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0"
                >
                  <div>
                    <p className="text-white font-medium">{item.name}</p>
                    <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 font-medium">₱{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-gray-400 text-sm">₱{item.price.toFixed(2)} each</p>
                  </div>
                </div>
              ))}
              <div className="pt-3 border-t border-white/20">
                <div className="flex justify-between items-center">
                  <p className="text-white font-semibold">Total Amount</p>
                  <p className="text-xl font-bold bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
                    ₱{order.total.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="border-orange-400/50 text-orange-400 hover:bg-orange-400/20 bg-transparent"
            >
              <Phone className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default OrderDetailsModal
