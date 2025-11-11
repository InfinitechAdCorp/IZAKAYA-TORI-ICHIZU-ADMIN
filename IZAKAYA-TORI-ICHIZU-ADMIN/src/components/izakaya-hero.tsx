import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Award, Flame } from "lucide-react"

export default function IzakayaHero() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-white">
        <div className="absolute top-10 left-10 w-32 h-32 bg-orange-200/30 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-200/40 rounded-full blur-lg animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-orange-200/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-yellow-300/25 rounded-full blur-xl animate-pulse delay-700"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🇯🇵</span>
              <span className="text-lg font-medium text-orange-600 tracking-wide">AUTHENTIC JAPANESE IZAKAYA</span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
              Welcome to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-500">
                Izakaya Tori Ichizu
              </span>
            </h1>

            <p className="text-xl text-gray-700 leading-relaxed">
              Experience the heart of Japan in every bite! Our master chefs bring you
              <span className="font-semibold text-orange-600"> authentic flavors</span> from Tokyo's vibrant izakayas to
              your table. From sizzling yakitori to comforting ramen, every dish is crafted with love and tradition.
            </p>

            <p className="text-lg text-gray-600 leading-relaxed">
              🍗 <span className="font-medium">Itadakimasu!</span> Join our family and discover why we're the most
              beloved Japanese izakaya in town. Fresh ingredients, traditional recipes, and that special Japanese
              hospitality await you!
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-orange-700 hover:to-yellow-600 text-white px-8 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Link href="/menu">🍜 View Our Menu</Link>
              </Button>

              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white px-8 py-3 text-lg font-semibold transition-all duration-300 bg-transparent"
              >
                <Link href="/reservations">📞 Make Reservation</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Authentic Flavors</h3>
                <p className="text-sm text-gray-600">Traditional Japanese recipes from Tokyo</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 mt-8 bg-white/80 backdrop-blur-sm border-yellow-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Made with Love</h3>
                <p className="text-sm text-gray-600">Every dish crafted with Japanese heart</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Family Atmosphere</h3>
                <p className="text-sm text-gray-600">Warm Japanese hospitality & community</p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 mt-8 bg-white/80 backdrop-blur-sm border-yellow-100">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-bold text-lg mb-2 text-gray-800">Award Winning</h3>
                <p className="text-sm text-gray-600">Best Japanese izakaya 3 years running</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
