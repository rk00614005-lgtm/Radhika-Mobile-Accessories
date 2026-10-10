import React from 'react';
import { Product } from '../types/index.js';
import { useShop } from '../context/ShopContext.js';
import { Heart, ShoppingBag, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { navigateTo, addToCart, toggleWishlist, isInWishlist, cart } = useShop();

  const isWish = isInWishlist(product.id);
  const cartItem = cart.find((i) => i.product.id === product.id);
  const inCartQty = cartItem ? cartItem.quantity : 0;

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Badges Bar */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 items-start">
        {product.discountPercent > 0 && (
          <span className="bg-gradient-to-r from-pink-600 to-rose-500 text-white font-extrabold text-[11px] px-2 py-0.5 rounded-full shadow-sm">
            {product.discountPercent}% OFF
          </span>
        )}
        {product.isBestSeller && (
          <span className="bg-purple-900/90 text-purple-200 font-bold text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
            ⚡ Bestseller
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isWish
            ? 'bg-rose-50 text-rose-600 shadow-md scale-105'
            : 'bg-white/80 backdrop-blur-sm text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm'
        }`}
        aria-label="Toggle Wishlist"
      >
        <Heart className={`w-4 h-4 ${isWish ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <div
        onClick={() => navigateTo('product', { productId: product.id })}
        className="cursor-pointer relative pt-[85%] overflow-hidden bg-slate-50"
      >
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=600&q=80';
          }}
        />
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute bottom-2 left-2 bg-amber-500/90 backdrop-blur-sm text-white text-[10px] font-semibold px-2 py-0.5 rounded">
            Only {product.stock} left in stock!
          </div>
        )}
        {!product.inStock && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center text-white font-bold text-sm">
            Temporarily Out of Stock
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Rating */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-purple-700 tracking-wide uppercase text-[10px]">
              {product.brand}
            </span>
            <div className="flex items-center gap-1 bg-amber-50 px-1.5 py-0.5 rounded text-amber-700 font-bold text-[11px]">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              <span>{product.rating}</span>
              <span className="text-slate-400 font-normal">({product.reviewCount})</span>
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => navigateTo('product', { productId: product.id })}
            className="cursor-pointer font-bold text-slate-900 text-sm leading-snug line-clamp-2 hover:text-purple-600 transition-colors mb-2"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Compatibility badge or color options */}
          {product.compatibility && (
            <p className="text-[11px] text-slate-500 line-clamp-1 mb-3">
              Fits: <span className="text-slate-700 font-medium">{product.compatibility}</span>
            </p>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-extrabold text-slate-900">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-600 font-bold block">
              Free Delivery &gt; ₹499
            </span>
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={!product.inStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
              !product.inStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : inCartQty > 0
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white active:scale-95'
            }`}
            aria-label="Add to cart"
          >
            {inCartQty > 0 ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{inCartQty} in cart</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
