export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 mt-10">
      <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center">
        <p className="text-sm">
          © {new Date().getFullYear()} StoreEase. All rights reserved.
        </p>
        <div className="flex gap-4 mt-2 sm:mt-0">
          <a href="/about" className="hover:text-blue-600">
            About
          </a>
          <a href="/contact" className="hover:text-blue-600">
            Contact
          </a>
          <a href="/privacy" className="hover:text-blue-600">
            Privacy
          </a>
        </div>
      </div>
    </footer>
  );
}
