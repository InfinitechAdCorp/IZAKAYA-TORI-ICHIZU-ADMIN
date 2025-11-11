"use client"

import { useState, useEffect } from "react"

export default function IzakayaLoader() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!isLoading) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-yellow-50 via-orange-50 to-white">
      <div className="text-center">
        <div className="relative mb-12">
          {/* Japanese lantern inspired design */}
          <div className="relative w-64 mx-auto">
            <div className="relative">
              <svg viewBox="0 0 200 60" className="w-full h-auto animate-pulse" xmlns="http://www.w3.org/2000/svg">
                {/* Lantern shadow */}
                <path
                  d="M 10 45 Q 100 35 190 45"
                  fill="none"
                  stroke="#1a1a1a"
                  strokeWidth="8"
                  opacity="0.2"
                  strokeLinecap="round"
                />

                {/* Main lantern body */}
                <path
                  d="M 10 40 Q 100 30 190 40"
                  fill="none"
                  stroke="#ea580c"
                  strokeWidth="12"
                  strokeLinecap="round"
                  className="animate-pulse"
                />

                {/* Lantern pattern */}
                {[...Array(12)].map((_, i) => (
                  <ellipse
                    key={i}
                    cx={20 + i * 14}
                    cy={40 - Math.sin(i * 0.5) * 5}
                    rx="6"
                    ry="3"
                    fill="#f59e0b"
                    opacity="0.8"
                    className="animate-pulse"
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}

                {/* Lantern decorations */}
                <circle
                  cx="15"
                  cy="42"
                  r="4"
                  fill="#fbbf24"
                  className="animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <circle
                  cx="100"
                  cy="32"
                  r="5"
                  fill="#fbbf24"
                  className="animate-bounce"
                  style={{ animationDelay: "200ms" }}
                />
                <circle
                  cx="185"
                  cy="42"
                  r="4"
                  fill="#fbbf24"
                  className="animate-bounce"
                  style={{ animationDelay: "400ms" }}
                />
              </svg>
            </div>

            {/* Steaming bowl */}
            <div className="relative mt-4">
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-full">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute left-1/2 transform -translate-x-1/2 w-2 h-16 bg-gradient-to-t from-orange-300/40 via-yellow-200/30 to-transparent rounded-full animate-pulse"
                    style={{
                      left: `${40 + i * 5}%`,
                      animationDelay: `${i * 150}ms`,
                      animationDuration: "2s",
                      transform: `translateX(-50%) rotate(${(i - 2) * 3}deg)`,
                    }}
                  />
                ))}
              </div>

              <div className="w-32 h-16 mx-auto relative">
                <div className="absolute inset-0 bg-black/10 rounded-full blur-sm transform translate-y-1"></div>

                <div className="relative w-full h-full bg-gradient-to-b from-yellow-100 via-yellow-50 to-white rounded-full border-4 border-orange-800 shadow-xl">
                  <div className="absolute top-0 inset-x-2 h-2 bg-gradient-to-r from-orange-700 via-orange-600 to-orange-700 rounded-full"></div>

                  <div className="absolute inset-3 bg-gradient-to-br from-yellow-100 via-orange-50 to-yellow-100 rounded-full overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 bg-orange-300/60 rounded-full animate-ping"
                        style={{
                          left: `${20 + i * 12}%`,
                          top: `${30 + (i % 3) * 15}%`,
                          animationDelay: `${i * 200}ms`,
                          animationDuration: "1.5s",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Japanese pattern elements */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 border-2 border-orange-400/30 rounded-sm animate-pulse"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${20 + (i % 4) * 20}%`,
                  animationDelay: `${i * 250}ms`,
                  transform: `rotate(${i * 45}deg)`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Brand text */}
        <div className="mb-8 relative">
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            <div className="w-1 h-8 bg-gradient-to-b from-transparent via-orange-500 to-transparent animate-pulse"></div>
            <div
              className="w-1 h-8 bg-gradient-to-b from-transparent via-yellow-500 to-transparent animate-pulse"
              style={{ animationDelay: "200ms" }}
            ></div>
          </div>

          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-800 via-orange-700 to-yellow-600 animate-pulse drop-shadow-2xl tracking-wider">
            TORI ICHIZU
          </h1>
          <p className="text-xl text-gray-700 mt-3 font-serif tracking-widest">Japanese Izakaya</p>
        </div>

        {/* Animated dots */}
        <div className="flex justify-center space-x-3 mt-8">
          <div className="w-3 h-3 bg-orange-700 rounded-full animate-bounce shadow-lg"></div>
          <div
            className="w-3 h-3 bg-orange-600 rounded-full animate-bounce shadow-lg"
            style={{ animationDelay: "150ms" }}
          ></div>
          <div
            className="w-3 h-3 bg-yellow-600 rounded-full animate-bounce shadow-lg"
            style={{ animationDelay: "300ms" }}
          ></div>
        </div>

        <p className="text-base text-gray-600 mt-6 animate-pulse font-medium">
          Preparing your authentic Japanese experience...
        </p>
      </div>
    </div>
  )
}
