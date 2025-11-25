import React from 'react';
import { ShoppingCart, Tag, Star } from 'lucide-react';

const ProductCard = ({ product, isOffer = false }) => {
  const handleAddToCart = () => {
    // Track with Analytics
    if (window.gtag) {
      window.gtag('event', 'add_to_cart', {
        currency: 'USD',
        value: product.price,
        items: [{
          item_id: product.id,
          item_name: product.name,
          price: product.price
        }]
      });
    }
    alert(`Added ${product.name} to cart!`);
  };

  const discount = product.originalPrice && isOffer
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative">
      {isOffer && (
        <div className="absolute top-3 right-3 z-10">
          <div className="bg-red-500 text-white px-3 py-1 rounded-full flex items-center gap-1 shadow-lg">
            <Tag size={14} />
            <span className="text-xs font-bold">{discount}% OFF</span>
          </div>
        </div>
      )}
      
      <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden group">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" font-size="48" text-anchor="middle" dy=".3em"%3E🔧%3C/text%3E%3C/svg%3E';
            }}
          />
        ) : (
          <span className="text-6xl text-gray-400">🔧</span>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">OUT OF STOCK</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-3 min-h-[4rem]">
          {product.description}
        </p>

        {product.category && (
          <div className="mb-3">
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {product.category}
            </span>
          </div>
        )}

        {product.rating && (
          <div className="flex items-center gap-1 mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className={i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
              />
            ))}
            <span className="text-sm text-gray-600 ml-1">({product.rating || 0})</span>
          </div>
        )}
        
        <div className="flex items-center justify-between mb-3">
          <div>
            {product.originalPrice && isOffer ? (
              <div>
                <span className="text-gray-400 line-through text-sm block">
                  ${product.originalPrice.toFixed(2)}
                </span>
                <span className="text-2xl font-bold text-red-600">
                  ${product.price.toFixed(2)}
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold text-yellow-600">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>
          
          {product.stock !== undefined && (
            <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-600' : product.stock > 0 ? 'text-orange-600' : 'text-red-600'}`}>
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          )}
        </div>
        
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg active:scale-95"
        >
          <ShoppingCart size={18} />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;