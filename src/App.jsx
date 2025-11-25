import React, { useState, lazy, Suspense } from 'react';
import Header from './components/Header';
import ProductList from './components/ProductList';
import OffersList from './components/OffersList';
import AdminAuth from './components/AdminAuth';
import './App.css';

// Lazy load AdminPanel for better performance
const AdminPanel = lazy(() => import('./components/AdminPanel'));

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <div className="App min-h-screen bg-gray-50">
      <Header onAdminClick={() => setShowAdmin(true)} />
      
      <main>
        <OffersList />
        <ProductList />
      </main>

      <footer className="bg-gray-800 text-white py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Goldman Hardware</h3>
              <p className="text-gray-400">
                Your trusted partner for quality hardware and tools since 1985.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-yellow-400 cursor-pointer transition-colors">About Us</li>
                <li className="hover:text-yellow-400 cursor-pointer transition-colors">Contact</li>
                <li className="hover:text-yellow-400 cursor-pointer transition-colors">Shipping Info</li>
                <li className="hover:text-yellow-400 cursor-pointer transition-colors">Returns</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 (555) 123-4567</li>
                <li>📧 info@goldmanhardware.com</li>
                <li>📍 123 Hardware Street<br />Tooltown, TL 12345</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 pt-8 text-center">
            <div className="flex justify-center gap-8 text-sm mb-4">
              <a href="#" className="hover:text-yellow-400 transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-yellow-400 transition-colors">Cookie Policy</a>
            </div>
            <p className="text-gray-400">
              © {new Date().getFullYear()} Goldman Hardware. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showAdmin && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading admin panel...</p>
            </div>
          </div>
        }>
          <AdminAuth onClose={() => setShowAdmin(false)}>
            <AdminPanel onClose={() => setShowAdmin(false)} />
          </AdminAuth>
        </Suspense>
      )}
    </div>
  );
}

export default App;