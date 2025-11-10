"use client"

import Link from "next/link"
import { ChefHat } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-950 to-black flex items-center justify-center px-4">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-amber-700/30 rounded-full"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 border-2 border-amber-700/20 rounded-full"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        {/* Chef icon */}
        <div className="flex justify-center mb-8">
          <div className="bg-amber-600 p-6 rounded-full">
            <ChefHat className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* 404 Text */}
        <h1 className="text-7xl font-bold text-amber-500 mb-4">404</h1>

        {/* Japanese-themed message */}
        <p className="text-3xl font-bold text-white mb-2">ページが見つかりません</p>
        <p className="text-xl text-amber-200 mb-8">Page Not Found</p>

        {/* Description */}
        <p className="text-gray-300 mb-8 text-lg">申し訳ございません。お探しのページは見つかりませんでした。</p>
        <p className="text-gray-400 mb-12">
          It seems the page you're looking for has wandered off like a chef on their day off.
        </p>

        {/* Action buttons */}
        

        {/* Footer message */}
        <p className="text-gray-500 text-sm mt-12">🍜 Izakaya Tori Ichizu - Where every page has a purpose</p>
      </div>
    </div>
  )
}
