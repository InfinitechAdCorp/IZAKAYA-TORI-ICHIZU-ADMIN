"use client"

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, DollarSign, Users, Package, Calendar, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ReportsPage() {
  const [isMobile, setIsMobile] = useState(false)
  const [timeRange, setTimeRange] = useState("week")

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const stats = [
    {
      title: "Total Revenue",
      value: "₱45,231.89",
      change: "+20.1%",
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Total Orders",
      value: "234",
      change: "+12.5%",
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "New Customers",
      value: "89",
      change: "+8.2%",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Avg Order Value",
      value: "₱193.29",
      change: "+5.4%",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ]

  const topProducts = [
    { name: "Bibimbap", orders: 45, revenue: "₱6,750" },
    { name: "Kimchi Fried Rice", orders: 38, revenue: "₱5,320" },
    { name: "Korean BBQ Set", orders: 32, revenue: "₱9,600" },
    { name: "Tteokbokki", orders: 28, revenue: "₱3,360" },
    { name: "Japchae", orders: 25, revenue: "₱3,750" },
  ]

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex min-h-screen w-full bg-gradient-to-br from-orange-50 to-red-50">
        <AppSidebar />
        <div className={`flex-1 min-w-0 ${isMobile ? "ml-0" : "ml-72"}`}>
          {isMobile && (
            <div className="sticky top-0 z-50 flex h-12 items-center gap-2 border-b bg-white/90 backdrop-blur-sm px-4 md:hidden shadow-sm">
              <SidebarTrigger className="-ml-1" />
              <span className="text-sm font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Reports
              </span>
            </div>
          )}
          <main className="flex-1 overflow-auto p-3 sm:p-4 md:p-6">
            <div className="max-w-7xl space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-orange-100">
                  <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-orange-600" />
                    보고서 Reports
                  </h1>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">View analytics and business insights</p>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={timeRange} onValueChange={setTimeRange}>
                    <SelectTrigger className="w-32 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="year">This Year</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="bg-white">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.title} className="bg-white/70 backdrop-blur-sm shadow-lg border-orange-100">
                      <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">{stat.title}</CardTitle>
                        <div className={`${stat.bgColor} p-2 rounded-lg`}>
                          <Icon className={`w-4 h-4 ${stat.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stat.value}</div>
                        <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                          <TrendingUp className="w-3 h-3" />
                          {stat.change} from last period
                        </p>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-orange-100">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                    <CardTitle>Revenue Overview</CardTitle>
                    <CardDescription className="text-white/80">Daily revenue for the selected period</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="h-64 flex items-end justify-between gap-2">
                      {[65, 45, 78, 52, 88, 72, 95].map((height, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-gradient-to-t from-orange-500 to-red-500 rounded-t-lg transition-all hover:opacity-80"
                            style={{ height: `${height}%` }}
                          />
                          <span className="text-xs text-gray-500">
                            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Top Products */}
                <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-orange-100">
                  <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                    <CardTitle>Top Products</CardTitle>
                    <CardDescription className="text-white/80">Best selling items this {timeRange}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      {topProducts.map((product, index) => (
                        <div key={product.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 font-semibold text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-500">{product.orders} orders</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{product.revenue}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Additional Metrics */}
              <Card className="bg-white/70 backdrop-blur-sm shadow-lg border-orange-100">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Order Statistics
                  </CardTitle>
                  <CardDescription className="text-white/80">Detailed breakdown of order metrics</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Completed Orders</p>
                      <p className="text-3xl font-bold text-green-600">198</p>
                      <p className="text-xs text-gray-500 mt-1">84.6% completion rate</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                      <p className="text-3xl font-bold text-orange-600">28</p>
                      <p className="text-xs text-gray-500 mt-1">12.0% pending</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Cancelled Orders</p>
                      <p className="text-3xl font-bold text-red-600">8</p>
                      <p className="text-xs text-gray-500 mt-1">3.4% cancellation rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
