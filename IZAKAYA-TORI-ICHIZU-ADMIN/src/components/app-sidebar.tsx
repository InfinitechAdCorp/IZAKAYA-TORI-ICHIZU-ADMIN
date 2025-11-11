"use client"
import {
  Home,
  Package,
  Megaphone,
  Users,
  ShoppingCart,
  LogOut,
  ChevronDown,
  TrendingUp,
  ChefHat,
  Download,
  Calendar,
  X,
} from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
    color: "text-orange-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
  },
  {
    title: "Products",
    url: "/admin/product",
    icon: Package,
    color: "text-red-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
    countKey: "products",
  },
  {
    title: "Orders",
    url: "/admin/order",
    icon: ShoppingCart,
    color: "text-orange-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
    countKey: "orders",
  },
  {
    title: "Reservations",
    url: "/admin/reservations",
    icon: Calendar,
    color: "text-orange-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
    countKey: "reservations",
  },
  {
    title: "Event Booking",
    url: "/admin/events",
    icon: ChefHat,
    color: "text-orange-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
    countKey: "events",
  },
  {
    title: "Users",
    url: "/admin/users",
    icon: Users,
    color: "text-red-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
    countKey: "users",
  },
  {
    title: "Content Management",
    icon: Megaphone,
    color: "text-orange-600",
    bgColor: "hover:bg-gradient-to-r hover:from-orange-50 hover:to-red-50",
    items: [
      {
        title: "Announcements",
        url: "/admin/announcements",
        countKey: "announcements",
      },
      {
        title: "Blog Posts",
        url: "/admin/blog",
        countKey: "blogs",
      },
      {
        title: "Chefs",
        url: "/admin/chefs",
        countKey: "chefs",
      },
      {
        title: "Testimonials",
        url: "/admin/testimonials",
        countKey: "testimonials",
      },
      {
        title: "Inquiries",
        url: "/admin/contact",
        countKey: "inquiries",
      },
    ],
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { setOpenMobile, isMobile, toggleSidebar } = useSidebar()
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const isFetchingRef = useRef(false)

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

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('auth_token')
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
    return headers
  }, [])

  const getLastViewedTimestamps = useCallback((): Record<string, string> => {
    const stored = localStorage.getItem('page_last_viewed')
    return stored ? JSON.parse(stored) : {}
  }, [])

  const markPageAsViewed = useCallback((url: string) => {
    const timestamps = getLastViewedTimestamps()
    timestamps[url] = new Date().toISOString()
    localStorage.setItem('page_last_viewed', JSON.stringify(timestamps))
  }, [getLastViewedTimestamps])

  const fetchCounts = useCallback(async () => {
    // Prevent multiple simultaneous fetches
    if (isFetchingRef.current) return
    
    isFetchingRef.current = true
    
    try {
      const headers = getAuthHeaders()
      const lastViewed = getLastViewedTimestamps()
      
      // Fetch data for each section
      const [reservationsRes, ordersRes, inquiriesRes, eventsRes] = await Promise.all([
        fetch("/api/reservations", { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/orders", { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/contact", { headers }).then(r => r.json()).catch(() => ({ data: [] })),
        fetch("/api/events", { headers }).then(r => r.json()).catch(() => ({ data: [] })),
      ])

      const newCounts: Record<string, number> = {}

      // Count NEW reservations (created after last view)
      if (reservationsRes.data && Array.isArray(reservationsRes.data)) {
        const lastViewedTime = lastViewed["/admin/reservations"] 
          ? new Date(lastViewed["/admin/reservations"]).getTime() 
          : 0
        
        newCounts.reservations = reservationsRes.data.filter((r: any) => {
          const createdAt = new Date(r.created_at).getTime()
          return createdAt > lastViewedTime
        }).length
      }

      // Count NEW orders (created after last view)
      if (ordersRes.data && Array.isArray(ordersRes.data)) {
        const lastViewedTime = lastViewed["/admin/order"] 
          ? new Date(lastViewed["/admin/order"]).getTime() 
          : 0
        
        newCounts.orders = ordersRes.data.filter((o: any) => {
          const createdAt = new Date(o.created_at).getTime()
          return createdAt > lastViewedTime
        }).length
      }

      // Count NEW inquiries (created after last view)
      if (inquiriesRes.data && Array.isArray(inquiriesRes.data)) {
        const lastViewedTime = lastViewed["/admin/contact"] 
          ? new Date(lastViewed["/admin/contact"]).getTime() 
          : 0
        
        newCounts.inquiries = inquiriesRes.data.filter((i: any) => {
          const createdAt = new Date(i.created_at).getTime()
          return createdAt > lastViewedTime
        }).length
      }

      // Count NEW events (created after last view)
      if (eventsRes.data && Array.isArray(eventsRes.data)) {
        const lastViewedTime = lastViewed["/admin/events"] 
          ? new Date(lastViewed["/admin/events"]).getTime() 
          : 0
        
        console.log('Events data:', eventsRes.data)
        console.log('Last viewed time for events:', new Date(lastViewedTime))
        
        newCounts.events = eventsRes.data.filter((e: any) => {
          const createdAt = new Date(e.created_at).getTime()
          console.log('Event created at:', new Date(createdAt), 'Is new?', createdAt > lastViewedTime)
          return createdAt > lastViewedTime
        }).length
        
        console.log('Total new events:', newCounts.events)
      }

      console.log('Final counts:', newCounts)
      setCounts(newCounts)
    } catch (error) {
      console.error("Error fetching counts:", error)
    } finally {
      isFetchingRef.current = false
    }
  }, [getAuthHeaders, getLastViewedTimestamps])

  // Initial fetch and set up polling interval
  useEffect(() => {
    // Fetch immediately on mount
    fetchCounts()
    
    // Set up polling every 5 seconds for real-time updates
    fetchIntervalRef.current = setInterval(() => {
      fetchCounts()
    }, 5000) // Poll every 5 seconds
    
    return () => {
      if (fetchIntervalRef.current) {
        clearInterval(fetchIntervalRef.current)
      }
    }
  }, [fetchCounts])

  // Clear notification when visiting a page and refresh counts
  useEffect(() => {
    markPageAsViewed(pathname)
    // Refresh counts immediately after marking as viewed
    setTimeout(() => {
      fetchCounts()
    }, 100)
  }, [pathname, markPageAsViewed, fetchCounts])

  // Add visibility change listener to fetch when tab becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCounts()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [fetchCounts])

  const handleInstallApp = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setShowInstallButton(false)
    }

    setDeferredPrompt(null)
  }

  const handleLogout = () => {
    // Clear interval on logout
    if (fetchIntervalRef.current) {
      clearInterval(fetchIntervalRef.current)
    }
    localStorage.removeItem("auth_token")
    localStorage.removeItem("user_data")
    router.push("/login")
  }

  const handleLinkClick = () => {
    // Close sidebar on mobile/tablet when a link is clicked
    setOpenMobile(false)
  }

  const handleCloseSidebar = () => {
    if (isMobile) {
      setOpenMobile(false)
    } else {
      toggleSidebar()
    }
  }

  const renderBadge = (count: number | undefined) => {
    if (!count || count === 0) return null
    
    return (
      <span className="ml-auto flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
        {count > 9 ? "9+" : count}
      </span>
    )
  }

  return (
    <Sidebar className="border-r border-orange-100">
      <SidebarContent className="bg-gradient-to-b from-orange-50 via-red-50 to-orange-50">
        <SidebarGroup>
          {isMobile && (
            <div className="absolute top-3 right-3 z-50">
              <button
                onClick={handleCloseSidebar}
                className="p-2 hover:bg-orange-200 rounded-lg transition-colors active:bg-orange-300"
                aria-label="Close sidebar"
                type="button"
              >
                <X className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          )}

          <div className="px-4 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg mx-3 mb-4 shadow-lg">
            <h2 className="text-white font-bold text-lg">Izakaya Admin</h2>
            <p className="text-orange-100 text-xs">Management Portal</p>
          </div>

          {showInstallButton && (
            <div className="px-3 mb-4">
              <Button
                onClick={handleInstallApp}
                className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 py-2 rounded-lg transition-all duration-300 text-sm font-semibold shadow-md hover:shadow-lg"
              >
                <Download className="h-4 w-4" />
                <span>Install App</span>
              </Button>
            </div>
          )}

          <SidebarGroupContent className="px-2">
            <SidebarMenu className="space-y-1">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.items ? (
                    <Collapsible defaultOpen={true} className="group/collapsible">
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          className={`${item.bgColor} transition-all duration-200 rounded-lg mx-1 group hover:shadow-sm`}
                        >
                          <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                          <span className="font-medium">{item.title}</span>
                          <ChevronDown className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-180 text-gray-400" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub className="ml-6 mt-1">
                          {item.items.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={pathname === subItem.url}
                                className="hover:bg-orange-100 rounded-md transition-colors"
                              >
                                <Link href={subItem.url} className="flex items-center gap-2" onClick={handleLinkClick}>
                                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                                  <span className="flex-1">{subItem.title}</span>
                                  {subItem.countKey && renderBadge(counts[subItem.countKey])}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url}
                      className={`${item.bgColor} transition-all duration-200 rounded-lg mx-1 group hover:shadow-sm ${
                        pathname === item.url
                          ? "bg-gradient-to-r from-orange-100 to-red-100 border-l-4 border-orange-600"
                          : ""
                      }`}
                    >
                      <Link href={item.url || "#"} className="flex items-center gap-3" onClick={handleLinkClick}>
                        <item.icon className={`h-5 w-5 ${item.color} group-hover:scale-110 transition-transform`} />
                        <span className="font-medium flex-1">{item.title}</span>
                        {item.countKey && renderBadge(counts[item.countKey])}
                        {pathname === item.url && !counts[item.countKey || ""] && (
                          <TrendingUp className="ml-auto h-4 w-4 text-orange-600" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-200">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 transition-all duration-300 rounded-lg group"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2 text-red-500 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
