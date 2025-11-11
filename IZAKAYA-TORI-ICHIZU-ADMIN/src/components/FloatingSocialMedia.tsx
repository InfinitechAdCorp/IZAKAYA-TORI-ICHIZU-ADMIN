"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { Facebook, Instagram, MessageCircle, Phone, Share2, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FloatingSocialMedia() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  
  // Hide component if on home page
  if (pathname === "/") {
    return null
  }
  
  const socialLinks = [
    {
      name: "Facebook",
      icon: Facebook,
      href: "https://www.facebook.com/p/Izakaya-Tori-Ichizu-Philippines-61577219897910/",
      color: "hover:bg-[#1877F2]",
    },
    {
      name: "Instagram",
      icon: Instagram,
      href: "https://instagram.com/izakayatoriichizu",
      color: "hover:bg-[#E4405F]",
    },
    {
      name: "WhatsApp",
      icon: MessageCircle,
      href: "https://wa.me/1234567890",
      color: "hover:bg-[#25D366]",
    },
    {
      name: "Call Us",
      icon: Phone,
      href: "tel:283620676",
      color: "hover:bg-orange-600",
    },
  ]

  return (
    <div className="fixed right-4 top-1/3 md:top-1/2 md:-translate-y-1/2 z-50 flex flex-col gap-3">
      {/* Social Links - Show/Hide based on isOpen state */}
      <div
        className={`flex flex-col gap-3 transition-all duration-300 ${isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none md:opacity-100 md:translate-y-0 md:pointer-events-auto"}`}
      >
        {socialLinks.map((social, index) => (
          <a
            key={social.name}
            href={social.href}
            target={social.name !== "Call Us" ? "_blank" : undefined}
            rel={social.name !== "Call Us" ? "noopener noreferrer" : undefined}
            className="group"
            aria-label={social.name}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
            }}
          >
            <Button
              size="icon"
              className={`h-12 w-12 rounded-full bg-orange-600 text-white shadow-lg transition-all duration-300 ${social.color} hover:scale-110 hover:shadow-xl`}
            >
              <social.icon className="h-5 w-5" />
            </Button>
          </a>
        ))}
      </div>

      {/* Toggle Button - Only visible on mobile */}
      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg transition-all duration-300 hover:from-orange-600 hover:to-yellow-600 hover:scale-110 hover:shadow-xl md:hidden"
        aria-label="Toggle social media links"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Share2 className="h-6 w-6" />}
      </Button>
    </div>
  )
}
