"use client"

import { useState, useEffect } from "react"
import {
  ChevronRight,
  Users,
  Calendar,
  Clock,
  Mail,
  Phone,
  User,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react"

export default function ReservationsPage() {
  const [step, setStep] = useState(1)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: "2",
    special_requests: "",
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // Check if user is logged in and pre-fill form
  useEffect(() => {
    const userData = localStorage.getItem("user_data")
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        // Pre-fill form with user data
        setFormData((prev) => ({
          ...prev,
          name: parsedUser.name || "",
          email: parsedUser.email || "",
          phone: parsedUser.phone || prev.phone,
        }))
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  const handleChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim() !== ""
      case 2:
        return formData.email.trim() !== "" && formData.phone.trim() !== ""
      case 3:
        return formData.date !== "" && formData.time !== ""
      case 4:
        return true
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setMessage("")

    try {
      const token = localStorage.getItem("auth_token")

      console.log("=== Reservation Submission Debug ===")
      console.log("User:", user)
      console.log("Token exists:", !!token)
      console.log("Form Data:", formData)

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
      }

      if (token) {
        headers["Authorization"] = `Bearer ${token}`
        console.log("Authorization header added to request")
      } else {
        console.warn("No auth token found in localStorage")
      }

      // Call your Next.js API route (not Laravel directly)
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers,
        body: JSON.stringify(formData),
      })

      console.log("Response status:", response.status)

      const data = await response.json()
      console.log("Response data:", data)

      if (!response.ok) {
        throw new Error(data.message || "Failed to create reservation")
      }

      setMessage("success")

      // Reset form after 3 seconds
      setTimeout(() => {
        setStep(1)
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          phone: user?.phone || "",
          date: "",
          time: "",
          guests: "2",
          special_requests: "",
        })
        setMessage("")
      }, 3000)
    } catch (error) {
      console.error("Reservation error:", error)
      setMessage("error")
    } finally {
      setLoading(false)
    }
  }

  if (message === "success") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-4xl font-black text-gray-900 mb-3">Reservation Confirmed!</h2>
          <p className="text-xl text-gray-600 mb-2">We're excited to see you at Izakaya Tori Ichizu</p>
          <p className="text-gray-500 mb-6">Check your email for confirmation details</p>

          {user && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-600 mb-1">View your reservation</p>
              <a href="/orders" className="text-orange-600 font-semibold hover:text-orange-700 underline">
                Go to My Reservations
              </a>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setMessage("")
                setStep(1)
              }}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold rounded-xl transition-all"
            >
              Make Another Reservation
            </button>
            <a
              href="/menu"
              className="flex-1 px-6 py-3 border-2 border-orange-300 text-orange-600 font-semibold rounded-xl hover:bg-orange-50 transition-all text-center"
            >
              Browse Menu
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-600">
              Reserve Your Spot
            </span>
          </h1>
          <p className="text-lg text-gray-600">Join us at Izakaya Tori Ichizu for an unforgettable dining experience</p>

          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
              <User className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-gray-700">
                Booking as <span className="font-semibold text-gray-900">{user.name}</span>
              </span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300 ${
                    s <= step
                      ? "bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded transition-all duration-300 ${
                      s < step ? "bg-orange-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-600 font-medium">
            <span>Guest Info</span>
            <span>Contact</span>
            <span>Date & Time</span>
            <span>Review</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-yellow-500 h-1" />

          <div className="p-8 md:p-10">
            {/* Step 1: Guest Info */}
            {step === 1 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Let's start with your name</h2>
                  <p className="text-gray-600">Help us personalize your reservation</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Number of Guests *</label>
                      <div className="relative">
                        <Users className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                        <select
                          name="guests"
                          value={formData.guests}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg appearance-none bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                            <option key={num} value={num}>
                              {num} {num === 1 ? "Guest" : "Guests"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="flex items-end">
                      <div className="w-full h-12 bg-orange-50 rounded-xl border-2 border-orange-100 flex items-center justify-center text-sm font-semibold text-orange-600">
                        Perfect for your group!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact */}
            {step === 2 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">How can we reach you?</h2>
                  <p className="text-gray-600">We'll send confirmation to this email</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        disabled={!!user?.email}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg disabled:bg-gray-50 disabled:text-gray-600"
                      />
                    </div>
                    {user?.email && <p className="text-xs text-gray-500 mt-1">Using your account email</p>}
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        placeholder="+63 912 345 6789"
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Date & Time */}
            {step === 3 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">When would you like to join us?</h2>
                  <p className="text-gray-600">Pick your preferred date and time</p>
                </div>

                <div className="space-y-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Date *</label>
                    <div className="relative">
                      <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <input
                        type="time"
                        name="time"
                        value={formData.time}
                        onChange={handleChange}
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all text-lg"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Review & Special Requests */}
            {step === 4 && (
              <div>
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Anything special we should know?</h2>
                  <p className="text-gray-600">Dietary restrictions, celebrations, or special requests</p>
                </div>

                <div className="space-y-6">
                  <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Your Reservation Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 mb-1">Name</p>
                        <p className="font-semibold text-gray-900">{formData.name}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Guests</p>
                        <p className="font-semibold text-gray-900">{formData.guests}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Email</p>
                        <p className="font-semibold text-gray-900">{formData.email}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Phone</p>
                        <p className="font-semibold text-gray-900">{formData.phone}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(formData.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 mb-1">Time</p>
                        <p className="font-semibold text-gray-900">{formData.time}</p>
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Special Requests (Optional)
                    </label>
                    <div className="relative">
                      <MessageSquare className="absolute left-4 top-3.5 w-5 h-5 text-orange-400 pointer-events-none" />
                      <textarea
                        name="special_requests"
                        value={formData.special_requests}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us about dietary needs, celebrations, or special occasions..."
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {message === "error" && (
              <div className="mt-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-900">Something went wrong</p>
                  <p className="text-red-700 text-sm">Please check your information and try again</p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-10">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-all"
                >
                  Back
                </button>
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => isStepValid() && setStep(step + 1)}
                  disabled={!isStepValid()}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-300 disabled:to-gray-300 text-white font-semibold py-3 px-6 rounded-xl transition-all disabled:cursor-not-allowed"
                >
                  {loading ? "Confirming..." : "Confirm Reservation"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 grid grid-cols-3 gap-4 text-center">
          <div className="text-gray-600">
            <p className="font-semibold">⚡ Instant</p>
            <p className="text-sm">Confirmation</p>
          </div>
          <div className="text-gray-600">
            <p className="font-semibold">🔒 Secure</p>
            <p className="text-sm">Booking</p>
          </div>
          <div className="text-gray-600">
            <p className="font-semibold">📧 Email</p>
            <p className="text-sm">Reminder</p>
          </div>
        </div>

        {/* Login Prompt for Guests */}
        {!user && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6 text-center">
            <p className="text-gray-700 mb-3">
              Have an account?{" "}
              <a href="/login" className="text-blue-600 font-semibold hover:underline">
                Login
              </a>{" "}
              to track your reservations
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
