import React from 'react';
import { ShoppingCart, Phone, Mail, MapPin, Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = ({ onAdminClick, cartCount = 0 }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full">
      {/* Top Bar */}
      <div className="bg-gray-800 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex gap-4 flex-wrap">
            <a href="tel:5551234567" className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
              <Phone size={14} />
              <span className="hidden sm:inline">(555) 123-4567</span>
            </a>
            <a href="mailto:info@goldmanhardware.com" className="flex items-center gap-1 hover:text-yellow-400 transition-colors">
              <Mail size={14} />
              <span className="hidden sm:inline">info@goldmanhardware.com</span>
            </a>
          </div>
          <button
            onClick={onAdminClick}
            className="hover:text-yellow-400 transition-colors font-medium"
          >
            Admin Panel
          </button>
        </div>
      </div>

      {/* Main Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <span className="text-yellow-600 font-bold text-xl md:text-2xl">GH</span>
              </div>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold leading-tight">Goldman Hardware</h1>
                <p className="text-yellow-100 text-xs md:text-base">Your Trusted Hardware Partner</p>
              </div>
            </div>
            <div className="relative">
              <button 
                className="hover:scale-110 transition-transform"
                aria-label="Shopping Cart"
              >
                <ShoppingCart size={28} className="md:w-8 md:h-8" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs font-bold">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-gray-700 to-gray-900 text-white py-8 md:py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Quality Tools for Every Job</h2>
          <p className="text-lg md:text-xl text-gray-300 mb-4 md:mb-6">
            From professionals to DIY enthusiasts - we've got you covered
          </p>
          <div className="flex justify-center items-center gap-2 text-yellow-400">
            <MapPin size={20} />
            <span className="text-sm md:text-base">Visit us: 123 Hardware Street, Tooltown, TL 12345</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between md:justify-start">
            <ul className="hidden md:flex gap-8 py-4 text-gray-700 font-medium">
              <li className="cursor-pointer hover:text-yellow-600 transition-colors">Home</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors">Products</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors">Today's Offers</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors">About Us</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors">Contact</li>
            </ul>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden py-4 text-gray-700"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <ul className="md:hidden py-4 space-y-3 text-gray-700 font-medium border-t">
              <li className="cursor-pointer hover:text-yellow-600 transition-colors py-2">Home</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors py-2">Products</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors py-2">Today's Offers</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors py-2">About Us</li>
              <li className="cursor-pointer hover:text-yellow-600 transition-colors py-2">Contact</li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;