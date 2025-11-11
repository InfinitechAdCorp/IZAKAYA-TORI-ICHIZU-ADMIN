"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Award } from "lucide-react"

interface Chef {
  id: number
  name: string
  position: string
  specialty: string
  experience_years: number
  bio: string
  image_url: string
  rating: number
}

export default function ChefsPage() {
  const [chefs, setChefs] = useState<Chef[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchChefs = async () => {
      try {
        const response = await fetch("/api/chefs")
        if (!response.ok) throw new Error("Failed to fetch chefs")
        const data = await response.json()
        setChefs(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchChefs()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-yellow-600">
              Our Master Chefs
            </span>
          </h1>
          <p className="text-xl text-gray-600">Meet the culinary artists behind our authentic Japanese cuisine</p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading chefs...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Chefs Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chefs.map((chef) => (
              <Card
                key={chef.id}
                className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-orange-100 overflow-hidden py-0"
              >
                {chef.image_url && (
  <div className="h-64 bg-gradient-to-br from-orange-400 to-yellow-400 overflow-hidden">
    <img
      src={`${process.env.NEXT_PUBLIC_API_URL}${chef.image_url || "/placeholder.svg"}`}
      alt={chef.name}
      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
    />
  </div>
)}

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-orange-700">{chef.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{chef.position}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-100 px-2 py-1 rounded">
                      <Star className="w-4 h-4 text-yellow-600 fill-yellow-600" />
                      <span className="text-sm font-semibold text-yellow-700">{chef.rating}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">{chef.experience_years} years experience</span>
                  </div>

                  <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200">{chef.specialty}</Badge>

                  <p className="text-gray-600 text-sm line-clamp-3">{chef.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && !error && chefs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600">No chefs available. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  )
}