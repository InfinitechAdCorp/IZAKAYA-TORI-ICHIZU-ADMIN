"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Mail, Lock, Eye, EyeOff, Phone, MapPin, Building, Hash, UserPlus } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    zip_code: "",
    password: "",
    password_confirmation: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.password || !formData.password_confirmation) {
      toast.error("Missing Information", {
        description: "Please fill in all required fields.",
      })
      return
    }

    if (formData.password !== formData.password_confirmation) {
      toast.error("Password Mismatch", {
        description: "Passwords do not match. Please check and try again.",
      })
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password Too Short", {
        description: "Password must be at least 8 characters long.",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        localStorage.setItem("auth_token", data.data.token)
        localStorage.setItem("user_data", JSON.stringify(data.data.user))

        toast.success("Registration Successful!", {
          description: "Welcome to Izakaya Tori Ichizu!",
        })

        setTimeout(() => {
          router.push("/login")
        }, 2000)
      } else {
        toast.error("Registration Failed", {
          description: data.message || "Registration failed. Please try again.",
        })
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast.error("Connection Error", {
        description: "Unable to register. Please check your connection and try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen py-8 bg-gradient-to-br from-black via-orange-900 to-yellow-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 border-2 border-yellow-400 rounded-full"></div>
          <div className="absolute top-32 right-20 w-24 h-24 border-2 border-orange-400 rounded-full"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-yellow-400 rounded-full"></div>
          <div className="absolute bottom-32 right-10 w-28 h-28 border-2 border-orange-400 rounded-full"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-2xl bg-white shadow-2xl border-4 border-orange-400 !p-0">
            <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-yellow-500 rounded-t-lg !p-0 px-6 py-4 !m-0">
              <CardTitle className="text-3xl text-white mb-2 !mt-0">Izakaya Tori Ichizu</CardTitle>
              <h2 className="text-2xl text-white font-bold">Register</h2>
              <p className="text-white/90 mt-2">Join Izakaya Tori Ichizu family!</p>
            </CardHeader>
            <CardContent className="pt-6 p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <User className="w-4 h-4 text-orange-500" />
                      Full Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                      required
                      className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Mail className="w-4 h-4 text-orange-500" />
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone" className="text-black font-semibold flex items-center gap-2 mb-2">
                    <Phone className="w-4 h-4 text-orange-500" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="input your phone number"
                    className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <Label htmlFor="address" className="text-black font-semibold flex items-center gap-2 mb-2">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    placeholder="Enter your address"
                    className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base"
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Building className="w-4 h-4 text-orange-500" />
                      City
                    </Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange("city", e.target.value)}
                      placeholder="Enter your city"
                      className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>

                  <div>
                    <Label htmlFor="zip_code" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Hash className="w-4 h-4 text-orange-500" />
                      ZIP Code
                    </Label>
                    <Input
                      id="zip_code"
                      value={formData.zip_code}
                      onChange={(e) => handleInputChange("zip_code", e.target.value)}
                      placeholder="12345"
                      className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password" className="text-black font-semibold flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-orange-500" />
                      Password *
                    </Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        placeholder="Enter password (min 8 characters)"
                        required
                        minLength={8}
                        className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="password_confirmation"
                      className="text-black font-semibold flex items-center gap-2 mb-2"
                    >
                      <Lock className="w-4 h-4 text-orange-500" />
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="password_confirmation"
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.password_confirmation}
                        onChange={(e) => handleInputChange("password_confirmation", e.target.value)}
                        placeholder="Confirm password"
                        required
                        className="border-2 border-orange-300 bg-white text-black placeholder:text-gray-400 focus:border-orange-500 focus:ring-orange-400/30 h-12 text-base pr-10"
                        disabled={isSubmitting}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-500 hover:text-orange-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-bold py-3 h-14 shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                      Creating Account...
                    </span>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>

                <div className="text-center pt-4">
                  <p className="text-black/80">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-orange-600 hover:text-orange-700 font-semibold transition-colors"
                    >
                      Login here
                    </Link>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </>
  )
}