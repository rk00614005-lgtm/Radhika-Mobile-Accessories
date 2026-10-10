import React from 'react';
import { useShop } from '../context/ShopContext.js';
import { Compass, ShoppingBag, ArrowLeft, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { navigateTo } = useShop();

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-6">
      <div className="relative inline-block">
        <span className="text-8xl font-black text-purple-100 select-none">404</span>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-black text-purple-800 bg-white/80 px-4 py-1 rounded-2xl shadow-sm border border-purple-100">
            Page Not Found
          </span>
        </div>
      </div>

      <div className="space-y-2 max-w-md mx-auto">
        <h1 className="text-xl font-bold text-slate-900">
          The accessory page you are looking for does not exist
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          It might have been renamed, removed, or the link may be mistyped. Let&apos;s get you back to the latest mobile accessories.
        </p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 pt-2">
        <button
          onClick={() => navigateTo('home')}
          className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md"
        >
          <Home className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <button
          onClick={() => navigateTo('shop')}
          className="px-6 py-3 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-50 flex items-center gap-2"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Browse All Accessories</span>
        </button>

        <button
          onClick={() => navigateTo('track')}
          className="px-6 py-3 rounded-xl bg-purple-50 text-purple-700 font-bold text-xs hover:bg-purple-100 flex items-center gap-2"
        >
          <Compass className="w-4 h-4" />
          <span>Track an Order</span>
        </button>
      </div>
    </div>
  );
};
