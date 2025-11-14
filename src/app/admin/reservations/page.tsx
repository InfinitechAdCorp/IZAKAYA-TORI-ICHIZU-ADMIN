"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { CheckCircle, ChevronLeft, ChevronRight, Clock, Loader2, Plus, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { useIsMobile } from "@/hooks/use-mobile"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Label } from "@/components/ui/label"

interface Reservation {
  id: number
  name: string
  email: string
  phone: string
  date: string
  time: string
  guests: number
  special_requests?: string
  status: "pending" | "confirmed" | "cancelled"
  created_at: string
}

type ReservationStatus = "pending" | "confirmed" | "cancelled"

const eventStatuses = [
  { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800", icon: Clock },
  { value: "confirmed", label: "Confirmed", color: "bg-blue-100 text-blue-800", icon: CheckCircle },
  { value: "completed", label: "Completed", color: "bg-green-100 text-green-800", icon: CheckCircle },
  { value: "cancelled", label: "Cancelled", color: "bg-red-100 text-red-800", icon: XCircle },
]

export default function ReservationsAdmin() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [isAddingReservation, setIsAddingReservation] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reservationToDelete, setReservationToDelete] = useState<number | null>(null)
  const isMobile = useIsMobile()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
    guests: 1,
    special_requests: "",
    status: "pending" as ReservationStatus,
  })

  useEffect(() => {
    fetchReservations()
  }, [])

  useEffect(() => {
    if (reservations.length > 0) {
      console.log("✅ Loaded reservations:", reservations.length)
      console.log("Sample reservation:", reservations[0])
    }
  }, [reservations])

  function getAuthHeaders() {
    const token = localStorage.getItem("auth_token")
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }

  async function fetchReservations() {
    try {
      setLoading(true)
      const response = await fetch("/api/reservations", {
        headers: getAuthHeaders(),
      })

      console.log("Response status:", response.status)

      if (!response.ok) throw new Error("Failed to fetch")

      const data = await response.json()
      console.log("Raw API Response:", data)

      let reservationList = []

      if (data.success && data.data && Array.isArray(data.data)) {
        reservationList = data.data
      } else if (Array.isArray(data)) {
        reservationList = data
      } else if (data.data && Array.isArray(data.data)) {
        reservationList = data.data
      }

      console.log("✅ Loaded reservations:", reservationList.length)
      if (reservationList.length > 0) {
        console.log("Sample reservation:", reservationList[0])
      }

      setReservations(reservationList)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      setReservations([])
      toast({
        title: "Error",
        description: "Failed to load reservations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  function getDaysInMonth(date: Date) {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  function getReservationsForDate(date: Date | null) {
    if (!date) return []

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const dateStr = `${year}-${month}-${day}`

    const found = reservations.filter((res) => {
      const resDate = res.date.substring(0, 10)
      return resDate === dateStr
    })

    return found
  }

  function previousMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  function formatMonthYear(date: Date) {
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
  }

  function isToday(date: Date | null) {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  function formatTime(timeString: string) {
    const [hours, minutes] = timeString.split(":")
    const hour = parseInt(hours)
    const minute = minutes || "00"
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minute} ${period}`
  }

  async function handleCreateReservation() {
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(formData),
      })

      if (!response.ok) throw new Error("Failed to create reservation")

      toast({
        title: "Success",
        description: "Reservation created successfully",
      })

      setFormData({
        name: "",
        email: "",
        phone: "",
        date: "",
        time: "",
        guests: 1,
        special_requests: "",
        status: "pending",
      })
      setIsAddingReservation(false)
      fetchReservations()
    } catch (error) {
      console.error("Error creating reservation:", error)
      toast({
        title: "Error",
        description: "Failed to create reservation",
        variant: "destructive",
      })
    }
  }

  async function handleDelete(id: number) {
    try {
      const response = await fetch(`/api/reservations/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      })

      if (!response.ok) throw new Error("Failed to delete")

      toast({
        title: "Success",
        description: "Reservation deleted successfully",
      })

      setSelectedReservation(null)
      setDeleteDialogOpen(false)
      setReservationToDelete(null)
      fetchReservations()
    } catch (error) {
      console.error("Error deleting reservation:", error)
      toast({
        title: "Error",
        description: "Failed to delete reservation",
        variant: "destructive",
      })
    }
  }

  function openDeleteDialog(id: number) {
    setReservationToDelete(id)
    setDeleteDialogOpen(true)
  }

  async function handleStatusChange(id: number, newStatus: ReservationStatus) {
    try {
      // First update the status
      const response = await fetch(`/api/reservations/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update")

      // Then send email notification
      if (selectedReservation) {
        console.log("📧 Sending email notification...")
        try {
          const emailResponse = await fetch("/api/email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              to: selectedReservation.email,
              reservationDetails: {
                name: selectedReservation.name,
                date: selectedReservation.date,
                time: selectedReservation.time,
                guests: selectedReservation.guests,
                status: newStatus,
                special_requests: selectedReservation.special_requests,
              },
            }),
          })

          if (emailResponse.ok) {
            console.log("✅ Email sent successfully")
          } else {
            console.error("❌ Failed to send email")
          }
        } catch (emailError) {
          console.error("❌ Email error:", emailError)
          // Don't show error to user - status update succeeded
        }
      }

      toast({
        title: "Success",
        description: "Status updated and email sent",
      })

      fetchReservations()
      if (selectedReservation?.id === id) {
        setSelectedReservation({ ...selectedReservation, status: newStatus })
      }
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusInfo = eventStatuses.find((s) => s.value === status)
    if (!statusInfo) return null

    const Icon = statusInfo.icon
    return (
      <Badge className={`text-xs px-2 py-1 ${statusInfo.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {statusInfo.label}
      </Badge>
    )
  }

  const days = getDaysInMonth(currentDate)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  if (loading) {
    return (
      <SidebarProvider defaultOpen={!isMobile}>
        <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
          <AppSidebar />
          <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
            <div className="flex items-center justify-center min-h-screen w-full">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                <span className="text-gray-700 font-medium">Loading reservations...</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-60"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Reservations Calendar
              </span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="w-full space-y-4 sm:space-y-6">
              <div className="justify-between space-y-2">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100 grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
                  <div className="space-y-1">
                    <h1 className="sm:text-4xl text-3xl pb-2 font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                      Reservation Management</h1>
                      <p className="text-sm sm:text-base text-gray-600 mt-1">Effortlessly oversee all table bookings in one place.</p>
                  </div>
                </div>
              </div>
              {/* Calendar */}
              <div className="rounded-lg p-4 max-w-auto mx-auto flex-1 p-4 bg-white/70 backdrop-blur-sm shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 md:mb-8">
                  <div className="flex items-center gap-2 sm:gap-4">
                    <h2 className="text-xl sm:text-2xl font-bold">{formatMonthYear(currentDate)}</h2>
                    <Button variant="outline" size="sm" onClick={goToToday}>
                      Today
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => setIsAddingReservation(true)}
                      className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">New Reservation</span>
                      <span className="sm:hidden">New</span>
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {weekDays.map((day) => (
                    <div key={day} className="p-1 sm:p-2 text-center font-semibold text-xs sm:text-sm text-gray-600">
                      <span className="hidden sm:inline">{day}</span>
                      <span className="sm:hidden">{day.substring(0, 1)}</span>
                    </div>
                  ))}

                  {days.map((date, index) => {
                    const dayReservations = getReservationsForDate(date)

                    return (
                      <Card
                        key={index}
                        className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] ${!date ? "invisible" : ""} ${
                          isToday(date) ? "ring-2 ring-blue-500" : ""
                        }`}
                      >
                        <CardContent className="p-1 sm:p-2">
                          {date && (
                            <>
                              <div className="text-xs sm:text-sm font-semibold mb-1 sm:mb-2 text-gray-700">{date.getDate()}</div>
                              <div className="space-y-0.5 sm:space-y-1">
                                {dayReservations.map((reservation) => (
                                  <button
                                    key={reservation.id}
                                    onClick={() => setSelectedReservation(reservation)}
                                    className="w-full text-left px-1 sm:px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs truncate transition-colors bg-green-100 hover:bg-green-200 text-green-800 font-medium"
                                  >
                                    <span className="hidden sm:inline">{reservation.time.substring(0, 5)} - </span>
                                    {reservation.name}
                                  </button>
                                ))}
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>

                {/* Reservation Details Dialog */}
                <Dialog open={!!selectedReservation} onOpenChange={() => setSelectedReservation(null)}>
                  {selectedReservation && (
                    <DialogContent className="gap-0 sm:max-w-[750px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
                      <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 -m-6 mb-4 rounded-t-lg">
                        <DialogTitle className="text-xl font-bold">
                          <span>Reservation Details</span>
                        </DialogTitle>
                        <DialogDescription className="text-orange-100">Complete information for this reservation</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-orange-100">
                            <div>
                              <Label className="text-xs sm:text-sm font-semibold text-gray-600">Name</Label>
                              <p className="text-base sm:text-lg font-medium text-gray-800">{selectedReservation.name}</p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-semibold text-gray-600">Email</Label>
                              <p className="text-sm sm:text-base text-gray-700 break-all">{selectedReservation.email}</p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-semibold text-gray-600">Phone</Label>
                              <p className="text-sm sm:text-base text-gray-700">{selectedReservation.phone}</p>
                            </div>
                          </div>

                          <div className="space-y-3 bg-white/60 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-orange-100">
                            <div className="grid grid-cols-2 gap-3 sm:gap-4">
                              <div>
                                <Label className="text-xs sm:text-sm font-semibold text-gray-600">Date</Label>
                                <p className="text-sm sm:text-base text-gray-800">{formatDate(selectedReservation.date)}</p>
                              </div>
                              <div>
                                <Label className="text-xs sm:text-sm font-semibold text-gray-600">Time</Label>
                                <p className="text-sm sm:text-base text-gray-800">{formatTime(selectedReservation.time)}</p>
                              </div>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-semibold text-gray-600">Guests</Label>
                              <p className="text-sm sm:text-base text-gray-800">
                                {selectedReservation.guests} {selectedReservation.guests > 1 ? "people" : "person"}
                              </p>
                            </div>
                            <div>
                              <Label className="text-xs sm:text-sm font-semibold text-gray-600">Status</Label>
                              <div className="mt-1">{getStatusBadge(selectedReservation.status)}</div>
                            </div>
                          </div>
                        </div>

                        {selectedReservation.special_requests && (
                          <div className="bg-white/60 backdrop-blur-sm p-4 rounded-lg shadow-sm border border-orange-100">
                            <Label className="text-xs sm:text-sm font-semibold text-gray-600 block mb-2">Special Requests</Label>
                            <p className="text-sm sm:text-base text-gray-700 whitespace-pre-wrap">{selectedReservation.special_requests}</p>
                          </div>
                        )}

                        <div className="flex flex-col sm:flex-row justify-end gap-3">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedReservation(null)}
                            className="border-gray-300 text-gray-700 hover:bg-gray-100"
                          >
                            Close
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => openDeleteDialog(selectedReservation.id)}
                            className="bg-red-500 hover:bg-red-600 text-white"
                          >
                            Delete Reservation
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  )}
                </Dialog>

                {/* Create Reservation Dialog */}
                <Dialog open={isAddingReservation} onOpenChange={setIsAddingReservation}>
                  <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-br from-orange-50 to-red-50">
                    <DialogHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6 -m-6 mb-4 rounded-t-lg">
                      <DialogTitle className="text-xl font-bold">Create New Reservation</DialogTitle>
                      <DialogDescription className="text-orange-100">Fill in the details for the new reservation.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Name
                        </Label>
                        <Input
                          placeholder="Name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Email
                        </Label>
                        <Input
                          type="email"
                          placeholder="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Phone
                        </Label>
                        <Input
                          placeholder="Phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                      </div>{" "}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <Label htmlFor="name" className="text-gray-700 font-medium">
                            Date
                          </Label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          />
                        </div>
                        <div>
                          <Label htmlFor="name" className="text-gray-700 font-medium">
                            Time
                          </Label>
                          <Input
                            type="time"
                            value={formData.time}
                            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                            className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Number of Guests
                        </Label>
                        <Input
                          type="number"
                          placeholder="Number of Guests"
                          min="1"
                          max="20"
                          value={formData.guests}
                          onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value) })}
                          className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Special Requests (Optional)
                        </Label>
                        <Textarea
                          placeholder="Special Requests (Optional)"
                          value={formData.special_requests}
                          onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                          className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="name" className="text-gray-700 font-medium">
                          Status
                        </Label>
                        <Select value={formData.status} onValueChange={(value: ReservationStatus) => setFormData({ ...formData, status: value })}>
                          <SelectTrigger className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="mt-1 border-orange-200 focus:border-orange-400 focus:ring-orange-400">
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <DialogFooter className="gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsAddingReservation(false)
                          }}
                          className="flex-1 sm:flex-none border-orange-300 text-orange-600 hover:bg-orange-50"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleCreateReservation}
                          className="flex-1 sm:flex-none bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold shadow-lg"
                        >
                          Create Reservation
                        </Button>
                      </DialogFooter>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                  <DialogContent className="max-w-[95vw] sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Delete Reservation</DialogTitle>
                      <DialogDescription>Are you sure you want to delete this reservation? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setDeleteDialogOpen(false)
                          setReservationToDelete(null)
                        }}
                        className="w-full sm:w-auto"
                      >
                        Cancel
                      </Button>
                      <Button variant="destructive" onClick={() => reservationToDelete && handleDelete(reservationToDelete)} className="w-full sm:w-auto">
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </main>
        </div>
      </div>
      <Toaster />
    </SidebarProvider>
  )
}
