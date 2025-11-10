"use client"

import { useState, useEffect } from "react"
import { useCallback } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, LogOut, Download, User, Home, Calendar, ChefHat, ChevronDown, ShoppingCart, Package } from "lucide-react"
import Image from "next/image"
import EventBookingModal from "@/components/event-booking-modal"
import GoogleTranslate from "@/components/googleTranslate"
import { useCartStore } from "@/store/cartStore"

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const { getItemCount } = useCartStore()
  const itemCount = getItemCount()

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstallButton(true)
    }

    const handleAppInstalled = () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    window.addEventListener("appinstalled", handleAppInstalled)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
      window.removeEventListener("appinstalled", handleAppInstalled)
    }
  }, [])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallButton(false)
    }

    setDeferredPrompt(null)
  }

  const loadUserFromStorage = useCallback(() => {
    try {
      const storedUser = localStorage.getItem("user_data")
      const storedToken = localStorage.getItem("auth_token")

      if (storedUser && storedToken) {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        console.log("[Header] User loaded from storage:", parsedUser)
      } else {
        setUser(null)
        console.log("[Header] No user data or token found")
      }
    } catch (error) {
      console.error("[Header] Error loading user from storage:", error)
      setUser(null)
    }
  }, [])

  useEffect(() => {
    loadUserFromStorage()

    const handleUserUpdate = () => {
      console.log("[Header] User update event received")
      loadUserFromStorage()
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user_data" || e.key === "auth_token") {
        console.log("[Header] Storage change detected for:", e.key)
        loadUserFromStorage()
      }
    }

    window.addEventListener("userDataUpdated", handleUserUpdate)
    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("userDataUpdated", handleUserUpdate)
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [loadUserFromStorage])

  // Early return after hooks to preserve hook order
  if (pathname.startsWith("/admin")) {
    return null
  }

  const handleLogout = () => {
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    setUser(null)
    window.dispatchEvent(new CustomEvent("userDataUpdated"))
    router.push("/login")
  }

  const mainNav = [
    { name: "Home", href: "/", icon: Home },
    { name: "Menu", href: "/menu", icon: ChefHat },
    { name: "Reservations", href: "/reservations", icon: Calendar },
  ]

  const moreNav = [
    { name: "Blog", href: "/blog" },
    { name: "Chefs", href: "/chefs" },
    { name: "Promos", href: "/promos" },
    { name: "Testimonials", href: "/testimonials" },
  ]

  const isActivePage = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-orange-100 shadow-sm">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-50/50 via-yellow-50/30 to-orange-50/50">
        <div className="absolute top-1 left-4 w-12 h-12 bg-gradient-to-br from-orange-200/40 to-yellow-200/30 rounded-full blur-xl opacity-60"></div>
        <div className="absolute top-2 right-8 w-8 h-8 bg-gradient-to-br from-yellow-200/40 to-orange-200/30 rounded-full blur-lg opacity-50"></div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 lg:px-6 relative z-10">
        <div className="flex items-center justify-between h-14 sm:h-16 md:h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group flex-shrink-0">
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-lg overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <Image src="/logo.png" alt="Izakaya Tori Ichizu Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col hidden sm:flex">
              <span className="text-lg sm:text-base md:text-lg font-bold text-gray-800 leading-tight">Izakaya </span>
              <span className="text-md text-orange-600 font-medium -mt-0.5">Tori Ichizu</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {mainNav.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium transition-all duration-300 rounded-lg ${
                  isActivePage(item.href)
                    ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md"
                    : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Dropdown for More */}
            <div className="relative group">
              <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all duration-300">
                <span>More</span>
                <ChevronDown className="h-4 w-4 group-hover:rotate-180 transition-transform" />
              </button>

              <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg border border-orange-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 py-2">
                {moreNav.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                      isActivePage(item.href)
                        ? "bg-orange-50 text-orange-600"
                        : "text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                  >
                    <span>{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </nav>

          {/* Right side actions - Simplified for mobile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install button - Desktop only */}
            {showInstallButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleInstallApp}
                className="hidden md:flex items-center space-x-1 border-orange-300 text-orange-600 hover:bg-orange-50 bg-transparent text-xs"
              >
                <Download className="h-3 w-3" />
                <span>Install</span>
              </Button>
            )}

            {/* Google Translate - Desktop only */}
            <div className="hidden md:block">
              <GoogleTranslate />
            </div>

            {/* Event Booking - Desktop only - Positioned right of Google Translate */}
            <div className="hidden md:block">
              <EventBookingModal />
            </div>

            {user ? (
              <div className="relative group">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="relative bg-gradient-to-r from-orange-600 to-orange-700 border-orange-300 text-white hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-sm hover:shadow-md p-2 h-10 w-10 lg:hover:bg-gradient-to-r"
                >
                  <User className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 px-1.5 min-w-[18px] h-5 flex items-center justify-center text-xs bg-white text-orange-600 border-2 border-orange-500 shadow-md animate-pulse font-bold">
                      {itemCount}
                    </Badge>
                  )}
                </Button>

                <div
                  className={`absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-orange-100 py-2 z-50 transition-all duration-200 ${
                    isDropdownOpen
                      ? "opacity-100 visible"
                      : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                  }`}
                >
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>

                  {/* Menu Items */}
                  <Link href="/cart" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center justify-between px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <div className="flex items-center space-x-3">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="text-sm font-medium">Cart</span>
                      </div>
                      {itemCount > 0 && (
                        <Badge className="bg-orange-600 text-white px-2 py-0.5 text-xs">{itemCount}</Badge>
                      )}
                    </div>
                  </Link>

                  <Link href="/orders" onClick={() => setIsDropdownOpen(false)} className="block">
                    <div className="flex items-center space-x-3 px-4 py-2.5 text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors cursor-pointer">
                      <Package className="h-4 w-4" />
                      <span className="text-sm font-medium">Orders</span>
                    </div>
                  </Link>

                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => {
                        handleLogout()
                        setIsDropdownOpen(false)
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-2.5 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <LogOut className="h-4 w-4" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link href="/login" className="hidden md:flex">
                <Button
                  variant="default"
                  size="sm"
                  className="bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs px-3 py-1.5 h-8"
                >
                  Login
                </Button>
              </Link>
            )}

            {/* Mobile Menu - Hamburger */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="lg:hidden bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100 p-2 h-12 w-12"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[320px] bg-white border-l border-gray-200 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center space-x-3 p-4 border-b border-gray-100">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                      <Image src="/logo.png" alt="Izakaya Logo" fill className="object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="font-bold text-gray-800 text-sm">Izakaya Tori Ichizu</h2>
                      <p className="text-xs text-orange-600">Japanese Izakaya</p>
                    </div>
                  </div>

                  {showInstallButton && (
                    <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 border-b border-orange-100">
                      <Button
                        onClick={() => {
                          handleInstallApp()
                          setIsOpen(false)
                        }}
                        className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 py-3 rounded-lg transition-all duration-300 text-base font-semibold shadow-md hover:shadow-lg"
                      >
                        <Download className="h-5 w-5" />
                        <span>Install App</span>
                      </Button>
                    </div>
                  )}

                  {/* Mobile Menu Content */}
                  <div className="flex-1 overflow-y-auto py-4">
                    {/* Google Translate - Mobile */}
                    <div className="px-4 pb-4 border-b border-gray-100">
                      <GoogleTranslate />
                    </div>

                    {/* Main Navigation */}
                    <nav className="py-2">
                      <div className="space-y-1 px-2">
                        {mainNav.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 w-full text-left px-3 py-3 text-base font-medium rounded-lg transition-all duration-300 ${
                              isActivePage(item.href)
                                ? "bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-md"
                                : "text-gray-700 hover:bg-gray-50 hover:text-orange-600"
                            }`}
                          >
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </nav>

                    {/* Quick Actions */}
                    <div className="py-4 border-t border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-600 mb-3 px-4 uppercase tracking-wide">
                        Quick Actions
                      </h3>
                      <div className="space-y-2 px-2">
                        <Link href="/cart" onClick={() => setIsOpen(false)} className="block">
                          <div className="flex items-center justify-between px-3 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="h-5 w-5 flex-shrink-0" />
                              <span className="font-medium text-sm">View Cart</span>
                            </div>
                            {itemCount > 0 && (
                              <Badge className="bg-orange-600 text-white px-2 py-1 text-xs">{itemCount}</Badge>
                            )}
                          </div>
                        </Link>
                        <div className="px-3 py-3">
                          <EventBookingModal />
                        </div>
                      </div>
                    </div>

                    {/* Explore Section */}
                    <div className="py-4 border-t border-gray-100">
                      <h3 className="text-xs font-semibold text-gray-600 mb-3 px-4 uppercase tracking-wide">Explore</h3>
                      <div className="space-y-1 px-2">
                        {moreNav.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2.5 text-gray-700 hover:bg-gray-50 hover:text-orange-600 rounded-lg transition-colors text-sm font-medium"
                          >
                            <span>{item.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mobile Menu Footer */}
                  <div className="border-t border-gray-100 p-4 space-y-3">
                    {user ? (
                      <>
                        <Link href="/orders" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center space-x-3 px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <Package className="h-5 w-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-800">Orders</p>
                              <p className="text-xs text-gray-500">View your orders</p>
                            </div>
                          </div>
                        </Link>
                        <Link href="/cart" onClick={() => setIsOpen(false)}>
                          <div className="flex items-center justify-between px-3 py-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                            <div className="flex items-center space-x-3">
                              <ShoppingCart className="h-5 w-5 text-gray-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800">Cart</p>
                                <p className="text-xs text-gray-500">Review your items</p>
                              </div>
                            </div>
                            {itemCount > 0 && (
                              <Badge className="bg-orange-600 text-white px-2 py-1 text-xs">{itemCount}</Badge>
                            )}
                          </div>
                        </Link>
                        <div className="px-3 py-3 bg-gray-50 rounded-lg">
                          <p className="text-sm font-medium text-gray-800 mb-1">Hello, {user.name}!</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="flex items-center justify-center space-x-2 w-full border-red-300 text-red-600 hover:bg-red-50 py-2.5 text-sm font-medium"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Logout</span>
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)} className="block">
                        <Button
                          variant="default"
                          size="sm"
                          className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white py-2.5 font-semibold text-sm"
                        >
                          Login
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
