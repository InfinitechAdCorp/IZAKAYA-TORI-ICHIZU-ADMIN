"use client"
import React, { useEffect, useState } from "react"
import { Star, Send, Sparkles, CheckCircle, ArrowRight } from "lucide-react"

interface Testimonial {
  id: number
  client_name: string
  client_email: string
  rating: number
  message: string
  created_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  const [formData, setFormData] = useState({
    client_name: "",
    client_email: "",
    rating: 5,
    message: "",
  })

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        if (!response.ok) throw new Error("Failed to fetch testimonials")
        const data = await response.json()
        setTestimonials(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const handleFormChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target
    if (name === "message") {
      setCharCount(value.length)
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const isFormValid = () => {
    return formData.client_name.trim() && formData.client_email.trim() && formData.message.trim()
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const response = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          rating: rating,
        }),
      })

      if (!response.ok) throw new Error("Failed to submit testimonial")

      setShowSuccess(true)
      setFormData({
        client_name: "",
        client_email: "",
        rating: 5,
        message: "",
      })
      setRating(5)
      setCharCount(0)

      setTimeout(() => setShowSuccess(false), 4000)

      const refreshResponse = await fetch("/api/testimonials")
      if (refreshResponse.ok) {
        const data = await refreshResponse.json()
        setTestimonials(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-16 px-4 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Thank You!</h2>
          <p className="text-xl text-gray-600 mb-1">Your testimonial has been received</p>
          <p className="text-gray-500">We appreciate your kind words and can't wait to see you again!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="mb-4 flex justify-center">
            <div className="bg-orange-100 px-4 py-2 rounded-full border border-orange-300">
              <span className="text-orange-600 text-sm font-semibold">⭐ LOVED BY GUESTS</span>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 text-gray-900">
            Guest Stories
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover why guests keep coming back to Izakaya Tori Ichizu
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Testimonials Carousel - Left Side (2 cols) */}
          <div className="lg:col-span-2">
            {loading && (
              <div className="text-center py-16">
                <Sparkles className="w-8 h-8 text-orange-500 mx-auto animate-spin mb-4" />
                <p className="text-gray-600">Loading stories...</p>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
                <p className="text-red-600 font-semibold">Unable to load testimonials</p>
              </div>
            )}

            {!loading && !error && (
              <div className="space-y-6">
                {testimonials.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border-2 border-orange-100">
                    <Sparkles className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                    <p className="text-gray-600 text-lg font-semibold">Be the first to share your story</p>
                  </div>
                ) : (
                  testimonials.map((testimonial, idx) => (
                    <div
                      key={testimonial.id}
                      className="group relative bg-white border-2 border-orange-100 rounded-3xl p-8 hover:border-orange-300 hover:shadow-xl transition-all duration-500 overflow-hidden"
                    >
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                      <div className="relative">
                        {/* Stars */}
                        <div className="flex gap-1 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-5 h-5 ${
                                i < testimonial.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>

                        {/* Quote Mark */}
                        <p className="text-6xl text-orange-200 font-serif leading-none mb-2">"</p>

                        {/* Message */}
                        <p className="text-lg text-gray-700 leading-relaxed mb-6 font-light">
                          {testimonial.message}
                        </p>

                        {/* Divider */}
                        <div className="h-px bg-gradient-to-r from-orange-100/0 via-orange-100/50 to-orange-100/0 mb-6" />

                        {/* Author */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{testimonial.client_name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(testimonial.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <ArrowRight className="w-5 h-5 text-orange-300/0 group-hover:text-orange-400 transition-all duration-500 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Form - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 bg-white border-2 border-orange-100 rounded-3xl p-8 overflow-hidden group shadow-xl">
              {/* Gradient accent */}
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative">
                <h2 className="text-3xl font-black text-gray-900 mb-2">Share Your Story</h2>
                <p className="text-gray-600 text-sm mb-8">Tell us about your experience</p>

                <div className="space-y-5">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Your Name</label>
                    <input
                      type="text"
                      name="client_name"
                      value={formData.client_name}
                      onChange={handleFormChange}
                      required
                      placeholder="Enter your name"
                      className="w-full px-5 py-3.5 bg-orange-50/50 border-2 border-orange-100 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Email Address</label>
                    <input
                      type="email"
                      name="client_email"
                      value={formData.client_email}
                      onChange={handleFormChange}
                      required
                      placeholder="your@email.com"
                      className="w-full px-5 py-3.5 bg-orange-50/50 border-2 border-orange-100 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-4">Your Rating</label>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-all transform hover:scale-125 focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 transition-all ${
                              star <= (hoverRating || rating)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold text-gray-700">Your Message</label>
                      <span className="text-xs text-gray-500">{charCount}/500</span>
                    </div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleFormChange}
                      required
                      rows={5}
                      maxLength={500}
                      placeholder="What was your favorite moment?"
                      className="w-full px-5 py-3.5 bg-orange-50/50 border-2 border-orange-100 rounded-xl focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none text-gray-900 placeholder-gray-500"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting || !isFormValid()}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                  >
                    <Send className="w-5 h-5" />
                    {submitting ? "Sharing..." : "Share Story"}
                  </button>

                  <p className="text-xs text-gray-500 text-center pt-3">
                    ✓ Reviewed before appearing
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        {!loading && testimonials.length > 0 && (
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                label: "Average Rating",
                value: (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1),
              },
              { label: "Happy Guests", value: testimonials.length },
              {
                label: "5-Star Reviews",
                value: testimonials.filter((t) => t.rating === 5).length,
              },
              {
                label: "Satisfaction",
                value: "100%",
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-white border-2 border-orange-100 rounded-2xl p-6 text-center hover:border-orange-300 hover:shadow-lg transition-all"
              >
                <p className="text-3xl font-black text-orange-600 mb-2">{stat.value}</p>
                <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}