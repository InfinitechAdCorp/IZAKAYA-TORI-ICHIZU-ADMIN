"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Calendar, User, X } from "lucide-react"

interface BlogPost {
  id: number
  title: string
  excerpt: string
  content: string
  author: string
  created_at: string
  image_url: string
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null)

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/blog-posts")
        if (!response.ok) throw new Error("Failed to fetch blog posts")
        const data = await response.json()
        setPosts(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [])

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [selectedPost])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 drop-shadow-sm">
              OUR <span className="text-orange-700 drop-shadow-sm">BLOG</span>
            </h2>
            <p className="text-xl text-gray-700 max-w-2xl mx-auto drop-shadow-sm">
              Discover stories, recipes, and insights from our kitchen
            </p>
          </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-lg border-2 border-orange-100">
                <div className="h-56 bg-gradient-to-br from-orange-200 to-yellow-200"></div>
                <div className="p-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="space-y-2 mt-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm border-2 border-red-300 rounded-2xl p-8 text-center shadow-xl">
              <p className="text-red-600 text-lg font-semibold">⚠️ {error}</p>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {!loading && !error && posts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <div
                key={post.id}
                className="group overflow-hidden rounded-lg border-2 border-orange-100/50 hover:border-orange-300 bg-white/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 cursor-pointer"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards',
                  opacity: 0
                }}
                onClick={() => setSelectedPost(post)}
              >
                {/* Image with overlay */}
                <div className="relative h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-100">
                  {post.image_url ? (
                    <img
                      src={`${process.env.NEXT_PUBLIC_API_URL}${post.image_url}`}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">
                      🍽️
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Date badge */}
                  <div className="absolute top-4 right-4 bg-orange-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                    {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-xl font-bold line-clamp-2 group-hover:text-orange-600 transition-colors leading-tight mb-3">
                    {post.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed mb-4">
                    {post.excerpt}
                  </p>

                  {/* Author info with avatar */}
                  <div className="flex items-center gap-3 pt-3 mb-4 border-t border-orange-100">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-xs font-bold">
                      {post.author.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{post.author}</p>
                      <p className="text-xs text-gray-500">Recipe Creator</p>
                    </div>
                  </div>

                  {/* Button */}
                  <Button
                    className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                  >
                    Read More 
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="inline-block p-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-orange-200">
              <div className="text-7xl mb-6">📝</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">No Stories Yet</h2>
              <p className="text-gray-600 text-lg">Check back soon for delicious content!</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedPost && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Image */}
            <div className="relative h-64 md:h-96 overflow-hidden bg-gradient-to-br from-orange-100 to-yellow-100">
              {selectedPost.image_url ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${selectedPost.image_url}`}
                  alt={selectedPost.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-8xl">
                  🍽️
                </div>
              )}
              
              {/* Close button */}
              <button
                onClick={() => setSelectedPost(null)}
                className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
              >
                <X className="w-6 h-6 text-gray-800" />
              </button>

              {/* Date badge */}
              <div className="absolute top-4 left-4 bg-orange-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                {new Date(selectedPost.created_at).toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric' 
                })}
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-8">
              {/* Title */}
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                {selectedPost.title}
              </h2>

              {/* Author info */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-lg font-bold">
                  {selectedPost.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-800">{selectedPost.author}</p>
                  <p className="text-sm text-gray-500">Recipe Creator</p>
                </div>
              </div>

              {/* Excerpt */}
              <div className="mb-6">
                <p className="text-xl text-gray-700 leading-relaxed italic border-l-4 border-orange-600 pl-4">
                  {selectedPost.excerpt}
                </p>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedPost.content}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
}