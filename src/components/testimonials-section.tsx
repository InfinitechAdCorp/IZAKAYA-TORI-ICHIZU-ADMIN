"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Star, Quote } from "lucide-react"

interface Testimonial {
  id: number
  client_name: string
  client_email: string
  rating: number
  message: string
  created_at: string
  image_url: string
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials")
        if (!response.ok) throw new Error("Failed to fetch testimonials")
        const data = await response.json()
        setTestimonials(data.slice(0, 3)) // Show only first 3 testimonials
      } catch (err) {
        console.error("Error fetching testimonials:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-yellow-600">
                What Our Guests Say
              </span>
            </h2>
            <p className="text-lg text-gray-600">Loading testimonials...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-yellow-600">
              What Our Guests Say
            </span>
          </h2>
          <p className="text-lg text-gray-600">Real experiences from our valued customers</p>
        </div>

        {/* Testimonials Grid */}
        {testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <Card
                key={testimonial.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-orange-100 overflow-hidden"
              >
                <CardContent className="p-8 space-y-4">
                  {/* Quote Icon */}
                  <Quote className="w-8 h-8 text-orange-300" />

                  {/* Rating */}
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>

                  {/* Message */}
                  <p className="text-gray-700 italic leading-relaxed">"{testimonial.message}"</p>

                  {/* Client Info */}
                  <div className="pt-4 border-t border-orange-100">
                    <p className="text-lg text-gray-800">{testimonial.client_name}</p>
              
                   <p className="text-xs text-gray-500 mt-2">
  {new Date(testimonial.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
</p>

                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">No testimonials yet. Be the first to share your experience!</p>
          </div>
        )}
      </div>
    </section>
  )
}
