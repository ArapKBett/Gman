import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from './ProductCard';
import { Sparkles, Clock } from 'lucide-react';

const OffersList = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    // Real-time listener for offers
    const q = query(
      collection(db, 'offers'),
      where('active', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const offersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOffers(offersData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching offers:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Countdown timer for offers (resets at midnight)
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading today's offers...</p>
      </div>
    );
  }

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="bg-gradient-to-r from-red-50 via-orange-50 to-yellow-50 py-12 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-200 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-red-200 rounded-full filter blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles size={32} className="text-red-600 animate-pulse" />
            Today's Special Offers
          </h2>
          
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-md">
            <Clock size={20} className="text-red-600" />
            <span className="font-bold text-gray-800">Ends in: {timeLeft}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {offers.map(offer => (
            <ProductCard key={offer.id} product={offer} isOffer={true} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default OffersList;