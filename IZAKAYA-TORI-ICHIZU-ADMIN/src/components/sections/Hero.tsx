"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { X } from "lucide-react"

interface Product {
  id: number
  name: string
  description: string
  price: number
  category: string
  image_url: string
  is_featured: boolean
}

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [dishes, setDishes] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDish, setSelectedDish] = useState<Product | null>(null)

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await fetch(`${API_URL}/api/products?is_featured=1&limit=3`)
        if (response.ok) {
          const data = await response.json()
          const products = Array.isArray(data) ? data : data.data || []

          if (products.length > 0) {
            setDishes(products.slice(-3))
          } else {
            setDishes([
              {
                id: 1,
                name: "Yakitori Assorted",
                description: "Premium grilled chicken skewers with traditional Japanese sauce and sesame.",
                price: 0,
                category: "Yakitori",
                image_url: "/japanese-yakitori-grilled-chicken-skewers.jpg",
                is_featured: true,
              },
              {
                id: 2,
                name: "Tonkotsu Ramen",
                description: "Rich pork bone broth ramen with tender chashu pork and soft-boiled egg.",
                price: 0,
                category: "Ramen",
                image_url: "/japanese-tonkotsu-ramen-bowl.jpg",
                is_featured: true,
              },
              {
                id: 3,
                name: "Sashimi Platter",
                description: "Fresh assorted sashimi including salmon, tuna, and white fish.",
                price: 0,
                category: "Sashimi",
                image_url: "/japanese-sashimi-platter.jpg",
                is_featured: true,
              },
            ])
          }
        }
      } catch (error) {
        console.error("Error fetching featured products:", error)
        setDishes([
          {
            id: 1,
            name: "Yakitori Assorted",
            description: "Premium grilled chicken skewers with traditional Japanese sauce and sesame.",
            price: 0,
            category: "Yakitori",
            image_url: "/japanese-yakitori-grilled-chicken-skewers.jpg",
            is_featured: true,
          },
          {
            id: 2,
            name: "Tonkotsu Ramen",
            description: "Rich pork bone broth ramen with tender chashu pork and soft-boiled egg.",
            price: 0,
            category: "Ramen",
            image_url: "/japanese-tonkotsu-ramen-bowl.jpg",
            is_featured: true,
          },
          {
            id: 3,
            name: "Sashimi Platter",
            description: "Fresh assorted sashimi including salmon, tuna, and white fish.",
            price: 0,
            category: "Sashimi",
            image_url: "/japanese-sashimi-platter.jpg",
            is_featured: true,
          },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

  useEffect(() => {
    if (dishes.length === 0 || selectedDish !== null) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % dishes.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [dishes.length, selectedDish])

  const handleCardClick = (dish: Product, offset: number) => {
    if (offset === 0) {
      setSelectedDish(dish)
    }
  }

  return (
    <>
      <section className="relative min-h-[70vh] lg:min-h-[70vh] flex items-center justify-center bg-gradient-to-br from-black via-orange-900 to-black overflow-hidden py-8 lg:py-0">
        {/* Japanese patterns overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <div className="absolute top-10 left-5 w-20 h-20">
            <svg viewBox="0 0 100 100" className="w-full h-full text-orange-400 animate-pulse">
              <pattern id="dancheong1" patternUnits="userSpaceOnUse" width="20" height="20">
                <rect width="20" height="20" fill="currentColor" opacity="0.3" />
                <circle cx="10" cy="10" r="3" fill="#fbbf24" opacity="0.8" />
              </pattern>
              <rect width="100" height="100" fill="url(#dancheong1)" />
            </svg>
          </div>

          <div className="absolute top-1/4 right-10 w-32 h-16 opacity-15">
            <svg viewBox="0 0 120 60" className="w-full h-full text-yellow-400">
              <path
                d="M10,30 Q20,10 40,30 Q60,10 80,30 Q100,10 110,30 Q100,50 80,30 Q60,50 40,30 Q20,50 10,30 Z"
                fill="currentColor"
                className="animate-pulse"
              />
            </svg>
          </div>

          <div
            className="absolute bottom-1/4 left-10 w-24 h-24 opacity-20 animate-spin"
            style={{ animationDuration: "20s" }}
          >
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#ea580c" strokeWidth="2" opacity="0.6" />
              <path
                d="M50,5 A45,45 0 0,1 50,95 A22.5,22.5 0 0,1 50,50 A22.5,22.5 0 0,0 50,5 Z"
                fill="#fbbf24"
                opacity="0.4"
              />
              <path
                d="M50,95 A45,45 0 0,1 50,5 A22.5,22.5 0 0,1 50,50 A22.5,22.5 0 0,0 50,95 Z"
                fill="#ea580c"
                opacity="0.4"
              />
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8 lg:py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-16">
              {/* Left side - Text content */}
              <div className="flex-1 text-center lg:text-left text-white order-2 lg:order-1 w-full">
                {/* <div className="mb-4 lg:mb-8 flex justify-center lg:justify-start">
                  <Image
                    src="/logo.png"
                    alt="Izakaya Tori Ichizu Logo"
                    width={200}
                    height={140}
                    className="drop-shadow-2xl lg:w-[280px] lg:h-auto"
                    priority
                  />
                </div> */}

                <p className="text-lg md:text-2xl lg:text-3xl font-light text-yellow-100 mb-4 lg:mb-8">
                  "Where Tradition Meets Authentic Taste"
                </p>

                <p className="text-sm md:text-lg lg:text-xl mb-6 lg:mb-8 text-yellow-50 italic leading-relaxed px-4 lg:px-0">
                  Experience the essence of Japanese culinary heritage, crafted with passion and served with the warmth
                  of traditional hospitality
                </p>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center lg:justify-start px-4 lg:px-0">
                  <Button
                    asChild
                    size="lg"
                    className="bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700 text-base lg:text-lg px-6 lg:px-8 py-5 lg:py-6 shadow-xl text-white border-0"
                  >
                    <Link href="/menu">Explore Our Menu</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="text-base lg:text-lg px-6 lg:px-8 py-5 lg:py-6 border-2 border-yellow-100 text-yellow-100 hover:bg-yellow-100 hover:text-black bg-transparent"
                  >
                    <Link href="/contact">Make Reservation</Link>
                  </Button>
                </div>
              </div>

              {/* Right side - 3D Carousel */}
              <div className="flex-1 flex flex-col items-center order-1 lg:order-2 w-full">
                {loading ? (
                  <div className="w-72 h-80 lg:w-80 lg:h-96 flex items-center justify-center">
                    <div className="w-8 h-8 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
                  </div>
                ) : (
                  <>
                    <div
                      className="relative w-72 h-80 lg:w-80 lg:h-96 mx-auto mb-4 lg:mb-8"
                      style={{ perspective: "1000px" }}
                    >
                      {dishes.map((dish, i) => {
                        const offset = i - currentSlide
                        const isActive = offset === 0
                        const isNext = offset === 1 || offset === -(dishes.length - 1)
                        const isPrev = offset === -1 || offset === dishes.length - 1

                        return (
                          <div
                            key={dish.id}
                            className={`absolute inset-0 transition-all duration-700 ease-in-out transform-gpu ${
                              isActive
                                ? "z-30 scale-100 opacity-100 translate-x-0 cursor-pointer"
                                : isNext
                                  ? "z-20 scale-75 opacity-60 translate-x-24"
                                  : isPrev
                                    ? "z-20 scale-75 opacity-60 -translate-x-24"
                                    : "z-10 scale-50 opacity-20 translate-x-0"
                            }`}
                            style={{
                              transform: `
                                translateX(${offset * 100}px) 
                                rotateY(${offset * 45}deg) 
                                scale(${isActive ? 1 : 0.75})
                                translateZ(${isActive ? 0 : -100}px)
                              `,
                            }}
                            onClick={() => handleCardClick(dish, offset)}
                          >
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/20 shadow-2xl h-full hover:bg-white/15 transition-colors">
                              <div className="relative h-48 lg:h-64 overflow-hidden">
                                <img
                                  src={dish.image_url || "/placeholder.svg"}
                                  alt={dish.name}
                                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                              </div>
                              <div className="p-4 lg:p-6 text-left">
                                <h3 className="text-xl lg:text-2xl font-semibold mb-2 lg:mb-3 text-yellow-400">
                                  {dish.name}
                                </h3>
                                <p className="text-yellow-100 text-xs lg:text-base leading-relaxed line-clamp-2 lg:line-clamp-3">
                                  {dish.description}
                                </p>

                                {isActive && (
                                  <button
                                    className="mt-2 text-yellow-400 text-sm lg:text-base font-medium hover:text-yellow-300 transition-colors flex items-center gap-1"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedDish(dish)
                                    }}
                                  >
                                    Read More →
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Carousel indicators */}
                    <div className="flex justify-center gap-2">
                      {dishes.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentSlide(i)}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            i === currentSlide ? "bg-yellow-400 scale-125" : "bg-white/30 hover:bg-white/50"
                          }`}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal Popup */}
      {selectedDish && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={() => setSelectedDish(null)}
        >
          <div
            className="relative bg-gradient-to-br from-black to-orange-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-yellow-400/30 animate-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedDish(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <div className="relative h-64 md:h-80 overflow-hidden rounded-t-2xl">
              <img
                src={selectedDish.image_url || "/placeholder.svg"}
                alt={selectedDish.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            <div className="p-6 md:p-8">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-orange-700/50 text-yellow-200 text-sm rounded-full mb-3">
                  {selectedDish.category}
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-yellow-400 mb-2">{selectedDish.name}</h2>
              </div>

              <div className="text-yellow-100 text-base md:text-lg leading-relaxed space-y-4">
                {selectedDish.description}
              </div>

              {selectedDish.price > 0 && (
                <div className="mt-6 pt-6 border-t border-orange-700">
                  <p className="text-2xl font-semibold text-yellow-400">
                    ₱
                    {Number(selectedDish.price)
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Button
                  asChild
                  size="lg"
                  className="w-full bg-gradient-to-r from-orange-700 to-orange-600 hover:from-orange-800 hover:to-orange-700 text-white"
                >
                  <Link href="/menu">View Full Menu</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
