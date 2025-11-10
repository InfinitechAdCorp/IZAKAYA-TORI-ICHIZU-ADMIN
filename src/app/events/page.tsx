import EventBookingForm from "@/components/event-booking-form"

export default function EventsPage() {
  return (
    <main className="min-h-screen bg-amber-900">
      <div className="bg-black text-white py-12 border-b-4 border-orange-500">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-2">Book Your Event</h1>
          <p className="text-orange-400 text-lg">Reserve your perfect venue at our restaurant</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <EventBookingForm />
      </div>
    </main>
  )
}
