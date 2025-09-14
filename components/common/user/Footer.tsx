import { Facebook, Twitter, Instagram, Youtube } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">TechStore</h3>
            <p className="text-sm mb-4 text-pretty">
              Your trusted destination for the latest technology products and accessories.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 hover:text-accent cursor-pointer" />
              <Twitter className="h-5 w-5 hover:text-accent cursor-pointer" />
              <Instagram className="h-5 w-5 hover:text-accent cursor-pointer" />
              <Youtube className="h-5 w-5 hover:text-accent cursor-pointer" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Contact
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Press
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Returns
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Shipping Info
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Track Order
                </a>
              </li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Policies</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Cookie Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Warranty
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 TechStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
