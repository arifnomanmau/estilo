import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Interior Design</h3>
            <p className="text-gray-600">
              Creating beautiful spaces that inspire and delight.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="flex flex-col space-y-2">
              <Link href="/">
                <a className="text-gray-600 hover:text-gray-900">Home</a>
              </Link>
              <Link href="/portfolio">
                <a className="text-gray-600 hover:text-gray-900">Portfolio</a>
              </Link>
              <Link href="/contact">
                <a className="text-gray-600 hover:text-gray-900">Contact</a>
              </Link>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-600">
              <p>123 Design Street</p>
              <p>contact@interiordesign.com</p>
              <p>+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-gray-600">
          <p>&copy; {new Date().getFullYear()} Interior Design. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
