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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black via-orange-900 to-yellow-900 overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
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

      <div className="text-center relative z-10">
        {/* Animated ramen bowl */}
        <div className="mb-12 flex justify-center items-center">
          <div className="relative w-40 h-40">
            {/* Steaming effect */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-16 bg-gradient-to-t from-yellow-300/50 to-transparent rounded-full blur-md"
                  style={{
                    left: `${-30 + i * 20}px`,
                    animation: "float 3s ease-in-out infinite",
                    animationDelay: `${i * 250}ms`,
                  }}
                />
              ))}
            </div>

            {/* Bowl rim */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full h-12 bg-gradient-to-b from-orange-600 to-orange-700 rounded-t-3xl border-4 border-orange-500 shadow-lg"></div>

            {/* Bowl body */}
            <div className="absolute top-10 left-1/2 transform -translate-x-1/2 w-40 h-28 bg-gradient-to-b from-orange-700 to-orange-900 rounded-b-3xl border-4 border-orange-600 shadow-2xl">
              {/* Inner glow */}
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-200/10 via-transparent to-transparent rounded-b-3xl"></div>

              {/* Noodle swirl animation */}
              <div className="absolute inset-4">
                <svg viewBox="0 0 100 60" className="w-full h-full opacity-60">
                  <path
                    d="M10,30 Q25,15 40,30 T70,30 T100,30"
                    stroke="#fbbf24"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                  />
                  <path
                    d="M15,35 Q30,22 45,35 T75,35"
                    stroke="#fcd34d"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                    style={{ animationDelay: "200ms" }}
                  />
                  <path
                    d="M20,40 Q35,28 50,40 T80,40"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    fill="none"
                    className="animate-pulse"
                    style={{ animationDelay: "400ms" }}
                  />
                </svg>
              </div>

              {/* Broth shine */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3/4 h-2 bg-white/20 blur-sm rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Brand text */}
        <div className="mb-10">
          <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-1 tracking-wider">
            IZAKAYA
          </h1>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 tracking-wider">
            TORI ICHIZU
          </h2>
          <div className="h-1.5 w-32 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 mx-auto mt-4 rounded-full shadow-lg"></div>
        </div>

        {/* Loading animation */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
          <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
          <div className="w-2 h-8 bg-gradient-to-b from-orange-400 to-yellow-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
        </div>

        {/* Status text */}
        <p className="text-yellow-300/80 text-sm font-medium tracking-widest">
          準備中
        </p>

        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
            50% { opacity: 0.8; }
            100% { transform: translateY(-50px) translateX(15px); opacity: 0; }
          }
        `}</style>
      </div>
    </div>
  )
}