import { Button } from "@/components/ui/button"

export function PromotionalSection() {
  return (
    <section className="py-16 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">
              Big Summer
              <span className="block text-accent">Sale</span>
            </h2>
            <p className="text-xl mb-8 text-primary-foreground/80 text-pretty">
              Save up to 50% on selected tech products. Limited time offer on premium devices and accessories.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" variant="secondary">
                Shop Sale
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                View All Deals
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src="/tech-products-sale-collection.jpg"
              alt="Summer Sale Products"
              className="w-full h-auto rounded-lg shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

