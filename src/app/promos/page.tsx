"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Megaphone, Calendar } from "lucide-react"

interface Announcement {
  id: number
  title: string
  content: string
  is_active: boolean
  created_at: string
}

export default function PromosPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/announcements")

        if (!response.ok) {
          throw new Error("Failed to fetch announcements")
        }

        const data = await response.json()
        setAnnouncements(Array.isArray(data) ? data : data.data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <Badge className="bg-green-100 text-green-700">Active</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-white py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-700 to-yellow-600">
              Promotions & Announcements
            </span>
          </h1>
          <p className="text-xl text-gray-600">
            Check out our latest deals and special offers
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading announcements...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-600">Error: {error}</p>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Announcements Grid */}
            {announcements.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
                {announcements.map((announcement) => (
                  <Card
                    key={announcement.id}
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-orange-100 overflow-hidden relative cursor-pointer"
                    onClick={() => setSelectedAnnouncement(announcement)}
                  >
                    <div className="absolute top-4 right-4">
                      {getStatusBadge(announcement.is_active)}
                    </div>

                    <CardHeader>
                      <CardTitle className="text-orange-700 pr-20">
                        {announcement.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-gray-600 line-clamp-3">
                        {announcement.content}
                      </p>

                      <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-semibold text-orange-700">
                            Special Offer
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-orange-600" />
                          <span>{formatDate(announcement.created_at)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No announcements available</p>
              </div>
            )}
          </>
        )}

        {/* Modal for full details */}
        <Dialog open={!!selectedAnnouncement} onOpenChange={(open) => !open && setSelectedAnnouncement(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle className="text-2xl text-orange-700">
                  {selectedAnnouncement?.title}
                </DialogTitle>
                {selectedAnnouncement && getStatusBadge(selectedAnnouncement.is_active)}
              </div>
            </DialogHeader>
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700">
                    Special Offer
                  </span>
                </div>
              </div>
              
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {selectedAnnouncement?.content}
                </p>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600 pt-4 border-t">
                <Calendar className="w-4 h-4 text-orange-600" />
                <span>Posted on {selectedAnnouncement && formatDate(selectedAnnouncement.created_at)}</span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}