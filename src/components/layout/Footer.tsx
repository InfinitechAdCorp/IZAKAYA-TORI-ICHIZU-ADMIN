"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

const Footer = () => {
  const pathname = usePathname()

  // Hide footer in admin routes
  if (pathname.startsWith("/admin")) {
    return null
  }

  return (
    <footer className="bg-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo + Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-xl font-bold text-orange-400">Izakaya Tori Ichizu</span>
            </div>
            <p className="text-white/80 text-sm">
              Authentic Japanese izakaya cuisine with traditional recipes. Experience the flavors of Japan in a warm,
              welcoming atmosphere.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link href="/" className="text-white/80 hover:text-orange-400 transition-colors text-sm">
                Home
              </Link>
              <Link href="/menu" className="text-white/80 hover:text-orange-400 transition-colors text-sm">
                Menu
              </Link>
              <Link href="/about" className="text-white/80 hover:text-orange-400 transition-colors text-sm">
                About Us
              </Link>
              <Link href="/contact" className="text-white/80 hover:text-orange-400 transition-colors text-sm">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Info</h3>
            <div className="space-y-2 text-sm">
              <Link
                href="https://www.google.com/maps/place/PISO+PAY.COM+Building/@14.5635978,121.0289417,17z"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <MapPin className="h-4 w-4 text-white/60" />
                <span className="text-white/80">
                  1st Floor, PISO PAY.COM BLDG, #47 Polaris St, Bel-Air, Makati City
                </span>
              </Link>

              <Link
                href="tel:(02) 8362 0676"
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <Phone className="h-4 w-4 text-white/60" />
                <span className="text-white/80">(02) 8362 0676</span>
              </Link>

              <Link
                href="mailto:ph.toriichizu01@gmail.com"
                className="flex items-center space-x-2 hover:text-orange-400 transition-colors"
              >
                <Mail className="h-4 w-4 text-white/60" />
                <span className="text-white/80">ph.toriichizu01@gmail.com</span>
              </Link>
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hours</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-white/60" />
                <span className="text-white/80">Open 24 Hours</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="border-t border-white/20 mt-8 pt-8 text-center">
          <p className="text-white/60 text-sm">
            © 2025 Izakaya Tori Ichizu. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
