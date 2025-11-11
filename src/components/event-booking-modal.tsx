"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import EventBookingForm from "./event-booking-form"
import { Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

interface User {
  id: number
  name: string
  email: string
}

interface EventBookingModalProps {
  user?: User | null
  isMobile?: boolean
}

export default function EventBookingModal({ user }: EventBookingModalProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
  onClick={() => setIsOpen(true)}
  className="
    flex items-center gap-2 text-xs font-semibold
    px-4 py-2 h-9 rounded-lg transition-all duration-200
    bg-orange-50 text-orange-700 shadow-sm hover:bg-orange-100 hover:shadow-md
    sm:bg-gradient-to-r sm:from-orange-600 sm:to-orange-700 sm:text-white sm:shadow-none
    sm:hover:from-orange-700 sm:hover:to-orange-800
    whitespace-nowrap
  "
>
  <Calendar className="h-4 w-4 flex-shrink-0" />
  <span>Book Event</span>
</Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-xl font-bold text-black">Book Your Event</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Reserve your perfect venue at our restaurant
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <EventBookingForm onSuccess={() => setIsOpen(false)} user={user} />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
