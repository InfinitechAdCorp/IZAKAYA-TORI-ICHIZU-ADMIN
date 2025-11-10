"use client"

import type React from "react"
import { Toaster } from "@/components/ui/toaster"
import { Toaster as SonnerToaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import OppaLoader from "@/components/oppa-loader"
import { usePathname } from "next/navigation"
import FloatingSocialMedia from "@/components/FloatingSocialMedia"
import CustomerServiceChatbot from "@/components/CustomerServiceChatbot"

const queryClient = new QueryClient()

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showHeader = pathname !== "/" && pathname !== "/login" && pathname !== "/register"
  const isAdminRoute = pathname.startsWith("/admin")

  return (
    <>
      <OppaLoader />
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col">
            {showHeader && <Header />}
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
          {!isAdminRoute && <FloatingSocialMedia />}
          {!isAdminRoute && <CustomerServiceChatbot />}
          <Toaster />
          <SonnerToaster />
        </TooltipProvider>
      </QueryClientProvider>
    </>
  )
}
