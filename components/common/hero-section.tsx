import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <section className="relative bg-gray-900 text-white min-h-[600px] flex items-center">
      <div className="absolute inset-0 bg-gray-900">
        <img
          src="/iphone-14-pro-hero-image-dark-background.jpg"
          alt="iPhone 14 Pro"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 z-10">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white">
            The Ultimate
            <span className="block text-blue-400">iPhone 14 Pro</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-100 text-pretty">
            Experience the future of mobile technology with our flagship device
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
              Shop Now
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-gray-900 bg-transparent"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
