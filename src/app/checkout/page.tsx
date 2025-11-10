"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useCartStore } from "@/store/cartStore"
import type { CheckoutInfo } from "@/types"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Smartphone, Building2, Wallet, Banknote, FileText, Lock, Package, LogIn, X, TruckIcon } from "lucide-react"
import Link from "next/link"

interface ExtendedCheckoutInfo extends Omit<CheckoutInfo, "paymentMethod"> {
  paymentMethod: "cash" | "gcash" | "paypal" | "bpi" | "maya"
  notes?: string
}

const formatPrice = (price: number): string => {
  return price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const Checkout = () => {
  const { items, getTotal, clearCart } = useCartStore()
  const subtotal = getTotal()
  const [deliveryFee, setDeliveryFee] = useState<number>(59.0)
  const [isCalculatingFee, setIsCalculatingFee] = useState(false)
  const total = subtotal + deliveryFee
  const [isProcessing, setIsProcessing] = useState(false)
  const router = useRouter()
  const [isOrderComplete, setIsOrderComplete] = useState(false)
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<any | null>(null)
  const [isLoadingUser, setIsLoadingUser] = useState(true)

  const [checkoutInfo, setCheckoutInfo] = useState<ExtendedCheckoutInfo>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zipCode: "",
    paymentMethod: "cash",
    notes: "",
  })

  useEffect(() => {
    const checkAuthAndFillForm = async () => {
      const token = localStorage.getItem("auth_token")
      const userData = localStorage.getItem("user_data")

      if (token && userData) {
        try {
          const response = await fetch("/api/orders?page=1&per_page=1", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const parsedUserData = JSON.parse(userData)
            setUserInfo(parsedUserData)

            setCheckoutInfo((prev) => ({
              ...prev,
              name: parsedUserData.name || "",
              email: parsedUserData.email || "",
              phone: parsedUserData.phone || "",
              address: parsedUserData.address || "",
              city: parsedUserData.city || "",
              zipCode: parsedUserData.zip_code || "",
            }))

            if (parsedUserData.city) {
              calculateDeliveryFee(parsedUserData.city)
            }

            toast({
              title: "Welcome back!",
              description: "Your information has been automatically filled.",
            })
          } else {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("user_data")
          }
        } catch (error) {
          console.error("Error checking auth:", error)
          localStorage.removeItem("auth_token")
          localStorage.removeItem("user_data")
        }
      }
      setIsLoadingUser(false)
    }

    checkAuthAndFillForm()
  }, [])

  const calculateDeliveryFee = async (city: string) => {
    if (!city || city.trim().length < 2) {
      setDeliveryFee(59.0)
      return
    }

    setIsCalculatingFee(true)
    try {
      const token = localStorage.getItem("auth_token")
      const response = await fetch("/api/delivery-fee", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ city: city.trim() }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setDeliveryFee(result.data.delivery_fee)
        toast({
          title: "Delivery Fee Updated",
          description: `Delivery fee for ${city}: ₱${formatPrice(result.data.delivery_fee)}`,
        })
      } else {
        setDeliveryFee(59.0)
      }
    } catch (error) {
      console.error("Error calculating delivery fee:", error)
      setDeliveryFee(59.0)
    } finally {
      setIsCalculatingFee(false)
    }
  }

  const handleInputChange = (field: keyof ExtendedCheckoutInfo, value: string) => {
    setCheckoutInfo((prev) => ({ ...prev, [field]: value }))

    if (field === "city" && value.trim().length >= 2) {
      const timeoutId = setTimeout(() => {
        calculateDeliveryFee(value)
      }, 500)
      return () => clearTimeout(timeoutId)
    }
  }

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setReceiptFile(file)
      const previewUrl = URL.createObjectURL(file)
      setReceiptPreview(previewUrl)
      toast({
        title: "Receipt Uploaded",
        description: `Receipt "${file.name}" has been uploaded successfully.`,
      })
    }
  }

  const handleRemoveReceipt = () => {
    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview)
    }
    setReceiptFile(null)
    setReceiptPreview(null)
    toast({
      title: "Receipt Removed",
      description: "Receipt has been removed.",
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!checkoutInfo.name || !checkoutInfo.email || !checkoutInfo.phone || !checkoutInfo.address) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    const token = localStorage.getItem("auth_token")
    if (!token) {
      toast({
        title: "Authentication Required",
        description: "Please log in to place an order.",
        variant: "destructive",
      })
      router.push("/login")
      return
    }

    setIsProcessing(true)

    try {
      const orderData = {
        items: items.map((item) => ({
          name: item.name,
          description: item.description || "",
          price: item.price,
          quantity: item.quantity,
          category: item.category || "Japanese Food",
          is_spicy: Boolean(item.isSpicy),
          is_vegetarian: Boolean(item.isVegetarian),
          image_url: typeof item.image === "string" ? item.image : "",
        })),
        payment_method: checkoutInfo.paymentMethod,
        delivery_address: checkoutInfo.address,
        delivery_city: checkoutInfo.city,
        delivery_zip_code: checkoutInfo.zipCode,
        customer_name: checkoutInfo.name,
        customer_email: checkoutInfo.email,
        customer_phone: checkoutInfo.phone,
        receipt_file: receiptFile ? receiptFile.name : "",
        notes: checkoutInfo.notes || "",
      }

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      const result = await response.json()

      if (response.ok && result.success && result.data) {
        clearCart()
        setIsOrderComplete(true)

        toast({
          title: "Order Placed Successfully!",
          description: `Order ${result.data.order.order_number} has been created.`,
        })

        router.push("/orders")
      } else {
        throw new Error(result.message || "Failed to create order")
      }
    } catch (error) {
      console.error("Error creating order:", error)
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to place order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0 && !isOrderComplete) {
    router.push("/cart")
    return null
  }

  if (isLoadingUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading checkout...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-white">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50">
        <div className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-orange-100/20 to-amber-200/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-orange-100/15 to-amber-200/10 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-br from-orange-100/10 to-amber-200/5 rounded-full blur-2xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-gradient-to-br from-orange-100/15 to-amber-200/10 rounded-full blur-xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">Checkout</h1>
            {userInfo && (
              <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-lg px-4 py-2 border border-orange-200 shadow-md">
                <LogIn className="w-4 h-4 text-orange-600" />
                <span className="text-gray-700 font-medium">Welcome, {userInfo.name}!</span>
              </div>
            )}
          </div>

          {!userInfo && (
            <Card className="mb-8 bg-white/95 backdrop-blur-sm border-orange-200 rounded-2xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Login for faster checkout!</h3>
                    <p className="text-gray-600">Save your information for quick ordering next time.</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/login">
                      <Button variant="outline" className="border-orange-300 text-gray-700 hover:bg-orange-50 bg-white">
                        <LogIn className="w-4 h-4 mr-2" />
                        Login
                      </Button>
                    </Link>
                    <Link href="/register">
                      <Button className="bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md">
                        <LogIn className="w-4 h-4 mr-2" />
                        Register
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/98 backdrop-blur-md border-orange-200 shadow-lg rounded-2xl">
              <CardHeader className="border-b border-orange-200 bg-orange-600 text-white rounded-t-2xl py-0">
                <CardTitle className="text-xl p-4">Delivery & Payment Information</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-orange-200 pb-2">
                      Personal Information
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700">
                          Full Name *
                        </Label>
                        <Input
                          id="name"
                          value={checkoutInfo.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          placeholder="Enter your full name"
                          required
                          className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-gray-700">
                          Email Address *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={checkoutInfo.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          placeholder="Enter your email"
                          required
                          className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="phone" className="text-gray-700">
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={checkoutInfo.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                        placeholder="Enter your phone number"
                        required
                        className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <Separator className="bg-orange-200" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-orange-200 pb-2">
                      Delivery Address
                    </h3>

                    <div>
                      <Label htmlFor="address" className="text-gray-700">
                        Street Address *
                      </Label>
                      <Input
                        id="address"
                        value={checkoutInfo.address}
                        onChange={(e) => handleInputChange("address", e.target.value)}
                        placeholder="Enter your street address"
                        required
                        className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-gray-700">
                          City *{" "}
                          {isCalculatingFee && <span className="text-xs text-gray-600">(Calculating fee...)</span>}
                        </Label>
                        <Input
                          id="city"
                          value={checkoutInfo.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          placeholder="Enter your city"
                          required
                          className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                        <p className="text-xs text-gray-600 mt-1">
                          <TruckIcon className="w-3 h-3 inline mr-1" />
                          Delivery fee: ₱{formatPrice(deliveryFee)} (₱59 for first 5km, ₱10/km after)
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="zipCode" className="text-gray-700">
                          ZIP Code *
                        </Label>
                        <Input
                          id="zipCode"
                          value={checkoutInfo.zipCode}
                          onChange={(e) => handleInputChange("zipCode", e.target.value)}
                          placeholder="Enter ZIP code"
                          required
                          className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-orange-200" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-orange-200 pb-2">
                      Payment Method
                    </h3>

                    <RadioGroup
                      value={checkoutInfo.paymentMethod}
                      onValueChange={(value) =>
                        handleInputChange("paymentMethod", value as ExtendedCheckoutInfo["paymentMethod"])
                      }
                      className="grid grid-cols-2 gap-3"
                    >
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-300 hover:border-orange-400 transition-colors">
                        <RadioGroupItem value="gcash" id="gcash" className="border-orange-500 text-orange-600" />
                        <Label htmlFor="gcash" className="text-gray-700 cursor-pointer flex items-center gap-2">
                          <Smartphone className="w-4 h-4" /> GCash
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-300 hover:border-orange-400 transition-colors">
                        <RadioGroupItem value="paypal" id="paypal" className="border-orange-500 text-orange-600" />
                        <Label htmlFor="paypal" className="text-gray-700 cursor-pointer flex items-center gap-2">
                          <Wallet className="w-4 h-4" /> PayPal
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-300 hover:border-orange-400 transition-colors">
                        <RadioGroupItem value="bpi" id="bpi" className="border-orange-500 text-orange-600" />
                        <Label htmlFor="bpi" className="text-gray-700 cursor-pointer flex items-center gap-2">
                          <Building2 className="w-4 h-4" /> BPI Online
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-300 hover:border-orange-400 transition-colors">
                        <RadioGroupItem value="maya" id="maya" className="border-orange-500 text-orange-600" />
                        <Label htmlFor="maya" className="text-gray-700 cursor-pointer flex items-center gap-2">
                          <Wallet className="w-4 h-4" /> Maya
                        </Label>
                      </div>

                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-orange-50 border border-orange-300 hover:border-orange-400 transition-colors col-span-2">
                        <RadioGroupItem value="cash" id="cash" className="border-orange-500 text-orange-600" />
                        <Label htmlFor="cash" className="text-gray-700 cursor-pointer flex items-center gap-2">
                          <Banknote className="w-4 h-4" /> Cash on Delivery
                        </Label>
                      </div>
                    </RadioGroup>

                    {(checkoutInfo.paymentMethod === "gcash" ||
                      checkoutInfo.paymentMethod === "paypal" ||
                      checkoutInfo.paymentMethod === "bpi" ||
                      checkoutInfo.paymentMethod === "maya") && (
                      <div className="space-y-4 pt-4 border-t border-orange-200">
                        <div className="text-center">
                          <h4 className="text-gray-700 font-semibold mb-3">
                            {checkoutInfo.paymentMethod === "gcash" && "GCash Payment"}
                            {checkoutInfo.paymentMethod === "paypal" && "PayPal Payment"}
                            {checkoutInfo.paymentMethod === "bpi" && "BPI Online Banking"}
                            {checkoutInfo.paymentMethod === "maya" && "Maya Payment"}
                          </h4>
                          <div className="bg-white p-4 rounded-lg inline-block border border-orange-200 shadow-sm">
                            <img
                              src="https://images.pexels.com/photos/4386321/pexels-photo-4386321.jpeg?auto=compress&cs=tinysrgb&w=300&h=300&fit=crop"
                              alt="QR Code"
                              className="w-48 h-48 object-cover mx-auto rounded-lg"
                            />
                          </div>
                          <div className="mt-4 space-y-2">
                            <p className="text-gray-600 text-sm">Scan QR code with your payment app</p>
                            <p className="text-gray-700 font-mono text-sm">
                              {checkoutInfo.paymentMethod === "gcash" && "GCash: +63 917 123 4567"}
                              {checkoutInfo.paymentMethod === "paypal" && "PayPal: japaneseizakaya@restaurant.com"}
                              {checkoutInfo.paymentMethod === "bpi" && "Account: 1234-5678-90"}
                              {checkoutInfo.paymentMethod === "maya" && "Maya: +63 917 987 6543"}
                            </p>
                            <p className="text-gray-700 font-semibold">Amount: ₱{formatPrice(total)}</p>
                          </div>
                          <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-300">
                            <Label
                              htmlFor="receipt"
                              className="text-gray-700 font-medium block mb-2 flex items-center gap-2 justify-center"
                            >
                              <FileText className="w-4 h-4" /> Upload Payment Receipt
                            </Label>
                            <Input
                              id="receipt"
                              type="file"
                              accept="image/*"
                              onChange={handleReceiptUpload}
                              className="bg-white border-orange-300 text-gray-900 file:bg-orange-600 file:text-white file:border-0 file:rounded file:px-3 file:py-1 file:mr-3 hover:file:bg-orange-700"
                            />
                            {receiptFile && receiptPreview && (
                              <div className="mt-4 relative">
                                <div className="relative inline-block">
                                  <img
                                    src={receiptPreview || "/placeholder.svg"}
                                    alt="Receipt preview"
                                    className="max-w-full h-auto max-h-64 rounded-lg border-2 border-orange-300"
                                  />
                                  <button
                                    type="button"
                                    onClick={handleRemoveReceipt}
                                    className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-lg transition-colors"
                                    aria-label="Remove receipt"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                                <p className="text-gray-700 text-sm mt-2">✓ {receiptFile.name}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-orange-200" />

                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg text-gray-900 border-b border-orange-200 pb-2">
                      Additional Notes
                    </h3>
                    <div>
                      <Label htmlFor="notes" className="text-gray-700">
                        Special Instructions (Optional)
                      </Label>
                      <Input
                        id="notes"
                        value={checkoutInfo.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        placeholder="Any special requests or delivery instructions..."
                        className="bg-white border-orange-300 text-gray-900 placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-500/20"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Processing Order...
                      </span>
                    ) : (
                      `Place Order - ₱${formatPrice(total)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card className="h-fit bg-white/98 backdrop-blur-md border-orange-200 shadow-lg rounded-2xl sticky top-24">
              <CardHeader className="border-b border-orange-200 bg-orange-600 text-white rounded-t-2xl py-0">
                <CardTitle className="text-xl p-4">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemPrice = Number(item.price) || 0
                    const itemTotal = itemPrice * item.quantity

                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center p-3 rounded-lg bg-orange-50 border border-orange-200"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{item.name}</div>
                          <div className="text-xs text-gray-600">
                            Qty: {item.quantity} × ₱{formatPrice(itemPrice)}
                          </div>
                        </div>
                        <div className="font-medium text-gray-900">₱{formatPrice(itemTotal)}</div>
                      </div>
                    )
                  })}
                </div>

                <Separator className="bg-orange-200" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Subtotal</span>
                    <span>₱{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <TruckIcon className="w-3 h-3" />
                      Delivery Fee
                    </span>
                    <span className={isCalculatingFee ? "animate-pulse" : ""}>₱{formatPrice(deliveryFee)}</span>
                  </div>
                  <Separator className="bg-orange-200" />
                  <div className="flex justify-between font-semibold text-lg">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₱{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="text-xs text-center pt-4 space-y-2">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Lock className="w-4 h-4" /> <span>Your payment information is secure</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <Package className="w-4 h-4" /> <span>Estimated delivery: 30-45 minutes</span>
                  </div>
                  <div className="text-gray-700 font-medium">Thank you for your order! 🍱</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
